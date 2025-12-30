import { type Kysely, sql } from 'kysely';
import type { DB } from '@/infrastructure/db/types';
import type { Item, ItemFilter } from './domain';

export class ItemsRepository {
  constructor(private db: Kysely<DB>) {}

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

  async searchItems(filters: ItemFilter): Promise<Item[]> {
    const rows = await this.buildSearchQuery(filters)
      .limit(filters.limit ?? 20)
      .offset(filters.offset ?? 0)
      .execute();

    if (rows.length === 0) return [];

    const itemIds = rows.map((r) => r.id);
    const relations = await this.fetchRelations(itemIds, filters);

    return rows.map((row) => this.toItem(row, relations));
  }

  private buildSearchQuery(filters: ItemFilter) {
    let query = this.db
      .selectFrom('items as i')
      .select([
        'i.id',
        'i.name',
        'i.desc',
        'i.short_desc',
        'i.gen',
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

  private async fetchRelations(itemIds: number[], filters: ItemFilter) {
    const [boosts, flags, tags] = await Promise.all([
      this.fetchBoosts(filters.includeBoosts !== false ? itemIds : []),
      this.fetchFlags(filters.includeFlags !== false ? itemIds : []),
      this.fetchTags(filters.includeTags !== false ? itemIds : []),
    ]);

    return {
      boosts: this.groupBy(boosts, 'item_id'),
      flags: this.groupBy(flags, 'item_id'),
      tags: this.groupBy(tags, 'item_id'),
    };
  }

  private fetchBoosts(itemIds: number[]) {
    if (!itemIds.length)
      return Promise.resolve(
        [] as {
          item_id: number;
          stat_id: number;
          stat_name: string;
          stages: number;
        }[]
      );
    return this.db
      .selectFrom('item_boosts as ib')
      .innerJoin('stats as s', 's.id', 'ib.stat_id')
      .select(['ib.item_id', 's.id as stat_id', 's.name as stat_name', 'ib.stages'])
      .where('ib.item_id', 'in', itemIds)
      .execute();
  }

  private fetchFlags(itemIds: number[]) {
    if (!itemIds.length)
      return Promise.resolve(
        [] as {
          item_id: number;
          flag_type_id: number;
          flag_name: string;
        }[]
      );
    return this.db
      .selectFrom('item_flags as if')
      .innerJoin('item_flag_types as ift', 'ift.id', 'if.flag_type_id')
      .select(['if.item_id', 'if.flag_type_id', 'ift.name as flag_name'])
      .where('if.item_id', 'in', itemIds)
      .execute();
  }

  private fetchTags(itemIds: number[]) {
    if (!itemIds.length)
      return Promise.resolve(
        [] as {
          item_id: number;
          tag_slug: string;
          tag_name: string;
        }[]
      );
    return this.db
      .selectFrom('item_tags as it')
      .innerJoin('item_tag_types as itt', 'itt.id', 'it.tag_id')
      .select(['it.item_id', 'itt.slug as tag_slug', 'itt.name as tag_name'])
      .where('it.item_id', 'in', itemIds)
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

    return {
      id: row.id,
      name: row.name,
      desc: row.desc,
      shortDesc: row.short_desc,
      generation: row.gen,
      implemented: row.implemented,
      boosts: boosts.map((b) => ({
        stat: { id: b.stat_id, name: b.stat_name },
        stages: b.stages,
      })),
      flags: flags.map((f) => ({ id: f.flag_type_id, name: f.flag_name })),
      tags: tags.map((t) => ({ slug: t.tag_slug, name: t.tag_name })),
      recipes: [],
    };
  }
}
