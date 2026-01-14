import { type Kysely, sql } from 'kysely';
import { createFuzzyMatcher, type FuzzyMatchOptions, type FuzzyMatchResult } from '@/common/fuzzy';
import type { DB } from '@/infrastructure/db/types';
import type { IncludeOptions, Item, ItemFilter, Recipe } from './domain';

export class ItemsRepository {
  constructor(private db: Kysely<DB>) {}

  async getByIdentifier(identifier: string, options: IncludeOptions = {}): Promise<Item | null> {
    const isId = /^\d+$/.test(identifier);

    const row = await this.db
      .selectFrom('items as i')
      .leftJoin('namespaces as ns', 'ns.id', 'i.namespace_id')
      .select([
        'i.id',
        'i.slug',
        'i.name',
        'i.num',
        'i.desc',
        'i.short_desc',
        'i.gen',
        'i.namespace_id',
        'ns.slug as namespace_slug',
        'ns.name as namespace_name',
        'i.implemented',
      ])
      .where(isId ? 'i.id' : 'i.slug', '=', isId ? Number(identifier) : identifier)
      .executeTakeFirst();

    if (!row) return null;

    const relations = await this.fetchRelations([row.id], options);

    return this.toItem(row, relations);
  }

  async fuzzyResolve(names: string[]): Promise<number[]> {
    if (!names.length) return [];

    const results = await Promise.all(
      names.map((name) =>
        this.db
          .selectFrom('items')
          .select(['id'])
          .where(sql<boolean>`name % ${name}`)
          .orderBy(sql`similarity(name, ${name})`, 'desc')
          .limit(1)
          .executeTakeFirst()
      )
    );

    return results.filter((r): r is { id: number } => r != null).map((r) => r.id);
  }

  async fuzzyResolveTags(names: string[]): Promise<number[]> {
    if (!names.length) return [];

    const results = await Promise.all(
      names.map((name) =>
        this.db
          .selectFrom('item_tag_types')
          .select(['id'])
          .where(sql<boolean>`name % ${name}`)
          .orderBy(sql`similarity(name, ${name})`, 'desc')
          .limit(1)
          .executeTakeFirst()
      )
    );

    return results.filter((r): r is { id: number } => r != null).map((r) => r.id);
  }

  async fuzzyMatch(query: string, options?: FuzzyMatchOptions): Promise<FuzzyMatchResult[]> {
    return createFuzzyMatcher(this.db, {
      table: 'items',
      matchColumn: 'name',
      idColumn: 'id',
    })(query, options);
  }

  async fuzzyMatchTags(query: string, options?: FuzzyMatchOptions): Promise<FuzzyMatchResult[]> {
    return createFuzzyMatcher(this.db, {
      table: 'item_tag_types',
      matchColumn: 'name',
      idColumn: 'id',
    })(query, options);
  }

  async searchItems(
    filters: ItemFilter,
    useFuzzy: boolean
  ): Promise<{ data: Item[]; total: number }> {
    let query = this.buildSearchQuery(filters);
    let countQuery = this.buildSearchQuery(filters)
      .clearSelect()
      .select(sql<number>`COUNT(*)`.as('count'));

    if (filters.name) {
      if (useFuzzy) {
        query = query.where(sql<boolean>`i.name % ${filters.name}`);
        countQuery = countQuery.where(sql<boolean>`i.name % ${filters.name}`);
        query = query.orderBy(sql`similarity(i.name, ${filters.name})`, 'desc');
      } else {
        query = query.where('i.name', 'ilike', `${filters.name}%`);
        countQuery = countQuery.where('i.name', 'ilike', `${filters.name}%`);
        query = query.orderBy('i.name');
      }
    } else {
      query = query.orderBy('i.id');
    }

    query = query.limit(filters.limit ?? 20).offset(filters.offset ?? 0);

    const [rows, countResult] = await Promise.all([
      query.execute(),
      countQuery.executeTakeFirstOrThrow(),
    ]);

    if (rows.length === 0) return { data: [], total: Number(countResult.count) };

    const itemIds = rows.map((r) => r.id);
    const relations = await this.fetchRelations(itemIds, filters);

    const data = rows.map((row) => this.toItem(row, relations));

    return { data, total: Number(countResult.count) };
  }

  private buildSearchQuery(filters: ItemFilter) {
    let query = this.db
      .selectFrom('items as i')
      .leftJoin('namespaces as ns', 'ns.id', 'i.namespace_id')
      .select([
        'i.id',
        'i.slug',
        'i.name',
        'i.num',
        'i.desc',
        'i.short_desc',
        'i.gen',
        'i.namespace_id',
        'ns.slug as namespace_slug',
        'ns.name as namespace_name',
        'i.implemented',
      ]);

    if (filters.itemIds?.length) query = query.where('i.id', 'in', filters.itemIds);
    if (filters.tagIds?.length || filters.tagSlugs?.length) {
      query = query.where('i.id', 'in', this.tagSubquery(filters.tagIds, filters.tagSlugs));
    }

    return query;
  }

  private tagSubquery(tagIds?: number[], tagSlugs?: string[]) {
    return this.db
      .selectFrom('item_tags as it')
      .innerJoin('item_tag_types as itt', 'itt.id', 'it.tag_id')
      .select('it.item_id')
      .where((eb) => {
        const conditions = [];

        if (tagIds?.length) {
          conditions.push(eb('itt.id', 'in', tagIds));
        }
        if (tagSlugs?.length) {
          conditions.push(eb('itt.slug', 'in', tagSlugs));
        }

        return conditions.length ? eb.or(conditions) : eb.lit(true);
      });
  }

  private async fetchRelations(itemIds: number[], options: IncludeOptions) {
    const [boosts, flags, tags, recipes, recipeInputs, recipeTagInputs] = await Promise.all([
      this.fetchBoosts(options.includeBoosts !== false ? itemIds : []),
      this.fetchFlags(options.includeFlags !== false ? itemIds : []),
      this.fetchTags(options.includeTags !== false ? itemIds : []),
      this.fetchRecipes(options.includeRecipes ? itemIds : []),
      this.fetchRecipeInputs(options.includeRecipes ? itemIds : []),
      this.fetchRecipeTagInputs(options.includeRecipes ? itemIds : []),
    ]);

    return {
      boosts: this.groupBy(boosts, 'item_id'),
      flags: this.groupBy(flags, 'item_id'),
      tags: this.groupBy(tags, 'item_id'),
      recipes: this.groupBy(recipes, 'result_item_id'),
      recipeInputs: this.groupBy(recipeInputs, 'recipe_id'),
      recipeTagInputs: this.groupBy(recipeTagInputs, 'recipe_id'),
    };
  }

  private fetchBoosts(itemIds: number[]) {
    if (!itemIds.length)
      return Promise.resolve(
        [] as {
          item_id: number;
          stat_id: number;
          stat_slug: string;
          stat_name: string;
          stages: number;
        }[]
      );
    return this.db
      .selectFrom('item_boosts as ib')
      .innerJoin('stats as s', 's.id', 'ib.stat_id')
      .select([
        'ib.item_id',
        's.id as stat_id',
        's.slug as stat_slug',
        's.name as stat_name',
        'ib.stages',
      ])
      .where('ib.item_id', 'in', itemIds)
      .execute();
  }

  private fetchFlags(itemIds: number[]) {
    if (!itemIds.length)
      return Promise.resolve(
        [] as {
          item_id: number;
          flag_type_id: number;
          flag_slug: string;
          flag_name: string;
        }[]
      );
    return this.db
      .selectFrom('item_flags as if')
      .innerJoin('item_flag_types as ift', 'ift.id', 'if.flag_type_id')
      .select(['if.item_id', 'if.flag_type_id', 'ift.slug as flag_slug', 'ift.name as flag_name'])
      .where('if.item_id', 'in', itemIds)
      .execute();
  }

  private fetchTags(itemIds: number[]) {
    if (!itemIds.length)
      return Promise.resolve(
        [] as {
          item_id: number;
          tag_id: number;
          tag_slug: string;
          tag_name: string;
        }[]
      );
    return this.db
      .selectFrom('item_tags as it')
      .innerJoin('item_tag_types as itt', 'itt.id', 'it.tag_id')
      .select(['it.item_id', 'itt.id as tag_id', 'itt.slug as tag_slug', 'itt.name as tag_name'])
      .where('it.item_id', 'in', itemIds)
      .execute();
  }

  private fetchRecipes(itemIds: number[]) {
    if (!itemIds.length)
      return Promise.resolve(
        [] as {
          id: number;
          result_item_id: number;
          type_id: number;
          type_slug: string;
          type_name: string;
          result_count: number;
          experience: number | null;
          cooking_time: number | null;
        }[]
      );
    return this.db
      .selectFrom('recipes as r')
      .innerJoin('recipe_types as rt', 'rt.id', 'r.type_id')
      .select([
        'r.id',
        'r.result_item_id',
        'rt.id as type_id',
        'rt.slug as type_slug',
        'rt.name as type_name',
        'r.result_count',
        'r.experience',
        'r.cooking_time',
      ])
      .where('r.result_item_id', 'in', itemIds)
      .execute();
  }

  private fetchRecipeInputs(itemIds: number[]) {
    if (!itemIds.length)
      return Promise.resolve(
        [] as {
          recipe_id: number;
          item_id: number;
          item_name: string;
          slot: number | null;
          slot_type_id: number | null;
          slot_type_slug: string | null;
          slot_type_name: string | null;
          slot_type_description: string | null;
        }[]
      );
    return this.db
      .selectFrom('recipe_inputs as ri')
      .innerJoin('recipes as r', 'r.id', 'ri.recipe_id')
      .innerJoin('items as i', 'i.id', 'ri.item_id')
      .leftJoin('recipe_slot_types as rst', 'rst.id', 'ri.slot_type_id')
      .select([
        'ri.recipe_id',
        'ri.item_id',
        'i.name as item_name',
        'ri.slot',
        'rst.id as slot_type_id',
        'rst.slug as slot_type_slug',
        'rst.name as slot_type_name',
        'rst.description as slot_type_description',
      ])
      .where('r.result_item_id', 'in', itemIds)
      .execute();
  }

  private fetchRecipeTagInputs(itemIds: number[]) {
    if (!itemIds.length)
      return Promise.resolve(
        [] as {
          recipe_id: number;
          tag_id: number;
          tag_slug: string;
          tag_name: string;
          slot: number | null;
          slot_type_id: number | null;
          slot_type_slug: string | null;
          slot_type_name: string | null;
          slot_type_description: string | null;
        }[]
      );
    return this.db
      .selectFrom('recipe_tag_inputs as rti')
      .innerJoin('recipes as r', 'r.id', 'rti.recipe_id')
      .innerJoin('recipe_tag_types as rtt', 'rtt.id', 'rti.tag_id')
      .leftJoin('recipe_slot_types as rst', 'rst.id', 'rti.slot_type_id')
      .select([
        'rti.recipe_id',
        'rtt.id as tag_id',
        'rtt.slug as tag_slug',
        'rtt.name as tag_name',
        'rti.slot',
        'rst.id as slot_type_id',
        'rst.slug as slot_type_slug',
        'rst.name as slot_type_name',
        'rst.description as slot_type_description',
      ])
      .where('r.result_item_id', 'in', itemIds)
      .execute();
  }

  private groupBy<T, K extends keyof T>(rows: T[], key: K): Map<T[K], T[]> {
    const map = new Map<T[K], T[]>();
    for (const row of rows) {
      const arr = map.get(row[key]) ?? [];
      arr.push(row);
      map.set(row[key], arr);
    }
    return map;
  }

  private toItem(
    row: Awaited<ReturnType<ReturnType<typeof this.buildSearchQuery>['execute']>>[number],
    relations: Awaited<ReturnType<typeof this.fetchRelations>>
  ): Item {
    const boosts = relations.boosts.get(row.id) ?? [];
    const flags = relations.flags.get(row.id) ?? [];
    const tags = relations.tags.get(row.id) ?? [];
    const recipeRows = relations.recipes.get(row.id) ?? [];

    const recipes: Recipe[] = recipeRows.map((r) => {
      const inputs = relations.recipeInputs.get(r.id) ?? [];
      const tagInputs = relations.recipeTagInputs.get(r.id) ?? [];

      return {
        id: r.id,
        type: { id: r.type_id, slug: r.type_slug, name: r.type_name },
        resultCount: r.result_count,
        experience: r.experience,
        cookingTime: r.cooking_time,
        inputs: inputs.map((i) => ({
          item: { id: i.item_id, name: i.item_name },
          slot: i.slot,
          slotType: i.slot_type_id
            ? {
                id: i.slot_type_id,
                slug: i.slot_type_slug ?? '',
                name: i.slot_type_name ?? '',
                description: i.slot_type_description,
              }
            : null,
        })),
        tagInputs: tagInputs.map((t) => ({
          tag: { id: t.tag_id, slug: t.tag_slug, name: t.tag_name },
          slot: t.slot,
          slotType: t.slot_type_id
            ? {
                id: t.slot_type_id,
                slug: t.slot_type_slug ?? '',
                name: t.slot_type_name ?? '',
                description: t.slot_type_description,
              }
            : null,
        })),
      };
    });

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      num: row.num,
      desc: row.desc,
      shortDesc: row.short_desc,
      generation: row.gen,
      namespace: row.namespace_id
        ? { id: row.namespace_id, slug: row.namespace_slug ?? '', name: row.namespace_name ?? '' }
        : null,
      implemented: row.implemented,
      boosts: boosts.map((b) => ({
        stat: { id: b.stat_id, slug: b.stat_slug, name: b.stat_name },
        stages: b.stages,
      })),
      flags: flags.map((f) => ({ id: f.flag_type_id, slug: f.flag_slug, name: f.flag_name })),
      tags: tags.map((t) => ({ id: t.tag_id, slug: t.tag_slug, name: t.tag_name })),
      recipes,
    };
  }
}
