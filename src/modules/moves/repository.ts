import { type Kysely, sql } from 'kysely';
import { createFuzzyMatcher, type FuzzyMatchOptions, type FuzzyMatchResult } from '@/common/fuzzy';
import { FilterLogic } from '@/common/types';
import type { DB } from '@/infrastructure/db/types';
import type { IncludeOptions, Move, MoveFilter } from './domain';

export class MovesRepository {
  constructor(private db: Kysely<DB>) {}

  async getByIdentifier(identifier: string, options: IncludeOptions = {}): Promise<Move | null> {
    const isId = /^\d+$/.test(identifier);

    const row = await this.db
      .selectFrom('moves')
      .innerJoin('types', 'types.id', 'moves.type_id')
      .innerJoin('move_categories', 'move_categories.id', 'moves.category_id')
      .leftJoin('move_targets', 'move_targets.id', 'moves.target_id')
      .leftJoin('move_z_data', 'move_z_data.move_id', 'moves.id')
      .leftJoin('move_max_power', 'move_max_power.move_id', 'moves.id')
      .select([
        'moves.id',
        'moves.name',
        'moves.slug',
        'moves.desc',
        'moves.short_desc',
        'moves.power',
        'moves.accuracy',
        'moves.pp',
        'moves.priority',
        'moves.crit_ratio',
        'moves.min_hits',
        'moves.max_hits',
        'moves.drain_percent',
        'moves.heal_percent',
        'moves.recoil_percent',
        'types.id as type_id',
        'types.name as type_name',
        'types.slug as type_slug',
        'move_categories.id as category_id',
        'move_categories.slug as category_slug',
        'move_categories.name as category_name',
        'move_categories.description as category_description',
        'move_targets.id as target_id',
        'move_targets.name as target_name',
        'move_targets.slug as target_slug',
        'move_targets.description as target_description',
        'move_z_data.z_power',
        'move_z_data.z_effect',
        'move_z_data.z_crystal',
        'move_z_data.is_z_exclusive',
        'move_max_power.max_power',
      ])
      .where(isId ? 'moves.id' : 'moves.slug', '=', isId ? Number(identifier) : identifier)
      .executeTakeFirst();

    if (!row) return null;

    const [flags, boosts, effects, gmaxSpecies] = await Promise.all([
      options.includeFlags !== false ? this.fetchFlagsForMove(row.id) : [],
      options.includeBoosts !== false ? this.fetchBoostsForMove(row.id) : [],
      options.includeEffects !== false ? this.fetchEffectsForMove(row.id) : [],
      options.includeGmaxSpecies !== false ? this.fetchGmaxSpeciesForMove(row.id) : [],
    ]);

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      desc: row.desc,
      shortDesc: row.short_desc,
      type: { id: row.type_id, name: row.type_name, slug: row.type_slug },
      category: {
        id: row.category_id,
        slug: row.category_slug,
        name: row.category_name,
        description: row.category_description,
      },
      target: row.target_id
        ? {
            id: row.target_id,
            name: row.target_name ?? '',
            slug: row.target_slug ?? '',
            description: row.target_description,
          }
        : null,
      power: row.power,
      accuracy: row.accuracy,
      pp: row.pp,
      priority: row.priority,
      critRatio: row.crit_ratio,
      minHits: row.min_hits,
      maxHits: row.max_hits,
      drainPercent: row.drain_percent,
      healPercent: row.heal_percent,
      recoilPercent: row.recoil_percent,
      flags,
      boosts,
      effects,
      maxPower: row.max_power ?? null,
      zData:
        options.includeZData !== false && (row.z_power != null || row.z_effect != null)
          ? {
              zPower: row.z_power,
              zEffect: row.z_effect,
              zCrystal: row.z_crystal,
              isZExclusive: row.is_z_exclusive ?? false,
            }
          : null,
      gmaxSpecies,
    };
  }

  private async fetchFlagsForMove(moveId: number) {
    return this.db
      .selectFrom('move_flags')
      .innerJoin('move_flag_types', 'move_flag_types.id', 'move_flags.flag_id')
      .select([
        'move_flag_types.id',
        'move_flag_types.name',
        'move_flag_types.slug',
        'move_flag_types.description',
      ])
      .where('move_flags.move_id', '=', moveId)
      .execute();
  }

  private async fetchBoostsForMove(moveId: number) {
    const boosts = await this.db
      .selectFrom('move_boosts')
      .innerJoin('stats', 'stats.id', 'move_boosts.stat_id')
      .select([
        'stats.id as stat_id',
        'stats.slug as stat_slug',
        'stats.name as stat_name',
        'move_boosts.stages',
        'move_boosts.is_self',
      ])
      .where('move_boosts.move_id', '=', moveId)
      .execute();

    return boosts.map((b) => ({
      stat: { id: b.stat_id, slug: b.stat_slug, name: b.stat_name },
      stages: b.stages,
      isSelf: b.is_self,
    }));
  }

  private async fetchEffectsForMove(moveId: number) {
    const effects = await this.db
      .selectFrom('move_effects')
      .innerJoin('condition_types', 'condition_types.id', 'move_effects.condition_type_id')
      .leftJoin('conditions', 'conditions.id', 'move_effects.condition_id')
      .leftJoin('condition_types as ct2', 'ct2.id', 'conditions.type_id')
      .select([
        'condition_types.id as condition_type_id',
        'condition_types.slug as condition_type_slug',
        'condition_types.name as condition_type_name',
        'conditions.id as condition_id',
        'conditions.slug as condition_slug',
        'conditions.name as condition_name',
        'conditions.type_id as condition_type_fk',
        'ct2.slug as condition_type_fk_slug',
        'ct2.name as condition_type_fk_name',
        'conditions.description as condition_description',
        'move_effects.chance',
        'move_effects.is_self',
      ])
      .where('move_effects.move_id', '=', moveId)
      .execute();

    return effects.map((e) => ({
      conditionType: {
        id: e.condition_type_id,
        slug: e.condition_type_slug,
        name: e.condition_type_name,
      },
      condition: e.condition_id
        ? {
            id: e.condition_id,
            slug: e.condition_slug ?? '',
            name: e.condition_name ?? '',
            type: {
              id: e.condition_type_fk ?? 0,
              slug: e.condition_type_fk_slug ?? '',
              name: e.condition_type_fk_name ?? '',
            },
            description: e.condition_description,
          }
        : null,
      chance: e.chance,
      isSelf: e.is_self,
    }));
  }

  private async fetchGmaxSpeciesForMove(moveId: number) {
    return this.db
      .selectFrom('gmax_moves')
      .innerJoin('species', 'species.id', 'gmax_moves.species_id')
      .select(['species.id', 'species.name', 'species.slug'])
      .where('gmax_moves.move_id', '=', moveId)
      .execute();
  }

  async fuzzyResolve(names: string[]): Promise<number[]> {
    if (!names.length) return [];

    const results = await Promise.all(
      names.map((name) =>
        this.db
          .selectFrom('moves')
          .select(['id'])
          .where(sql<boolean>`name % ${name}`)
          .orderBy(sql`similarity(name, ${name})`, 'desc')
          .limit(1)
          .executeTakeFirst()
      )
    );

    return results.filter((r): r is { id: number } => r != null).map((r) => r.id);
  }

  async fuzzyResolveCategories(names: string[]): Promise<number[]> {
    if (!names.length) return [];

    const results = await Promise.all(
      names.map((name) =>
        this.db
          .selectFrom('move_categories')
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
      table: 'moves',
      matchColumn: 'name',
      idColumn: 'id',
    })(query, options);
  }

  async fuzzyMatchCategories(
    query: string,
    options?: FuzzyMatchOptions
  ): Promise<FuzzyMatchResult[]> {
    return createFuzzyMatcher(this.db, {
      table: 'move_categories',
      matchColumn: 'name',
      idColumn: 'id',
    })(query, options);
  }

  async searchMoves(
    filters: MoveFilter,
    useFuzzy: boolean
  ): Promise<{ data: Move[]; total: number }> {
    let query = this.buildSearchQuery(filters);
    let countQuery = this.buildSearchQuery(filters)
      .clearSelect()
      .select(sql<number>`COUNT(*)`.as('count'));

    if (filters.name) {
      if (useFuzzy) {
        query = query.where(sql<boolean>`m.name % ${filters.name}`);
        countQuery = countQuery.where(sql<boolean>`m.name % ${filters.name}`);
        query = query.orderBy(sql`similarity(m.name, ${filters.name})`, 'desc');
      } else {
        query = query.where('m.name', 'ilike', `${filters.name}%`);
        countQuery = countQuery.where('m.name', 'ilike', `${filters.name}%`);
        query = query.orderBy('m.name');
      }
    } else {
      query = query.orderBy('m.id');
    }

    query = query.limit(filters.limit ?? 20).offset(filters.offset ?? 0);

    const [rows, countResult] = await Promise.all([
      query.execute(),
      countQuery.executeTakeFirstOrThrow(),
    ]);

    if (rows.length === 0) return { data: [], total: Number(countResult.count) };

    const moveIds = rows.map((r) => r.id);
    const relations = await this.fetchRelations(moveIds, filters);

    const data = rows.map((row) => this.toMove(row, relations));

    return { data, total: Number(countResult.count) };
  }

  private buildSearchQuery(filters: MoveFilter) {
    let query = this.db
      .selectFrom('moves as m')
      .innerJoin('types as t', 't.id', 'm.type_id')
      .innerJoin('move_categories as mc', 'mc.id', 'm.category_id')
      .leftJoin('move_targets as mt', 'mt.id', 'm.target_id')
      .leftJoin('move_z_data as mz', 'mz.move_id', 'm.id')
      .leftJoin('move_max_power as mmp', 'mmp.move_id', 'm.id')
      .select([
        'm.id',
        'm.name',
        'm.slug',
        'm.desc',
        'm.short_desc',
        'm.power',
        'm.accuracy',
        'm.pp',
        'm.priority',
        'm.crit_ratio',
        'm.min_hits',
        'm.max_hits',
        'm.drain_percent',
        'm.heal_percent',
        'm.recoil_percent',
        't.id as type_id',
        't.name as type_name',
        't.slug as type_slug',
        'mc.id as category_id',
        'mc.slug as category_slug',
        'mc.name as category_name',
        'mc.description as category_description',
        'mt.id as target_id',
        'mt.name as target_name',
        'mt.slug as target_slug',
        'mt.description as target_description',
        'mz.z_power',
        'mz.z_effect',
        'mz.z_crystal',
        'mz.is_z_exclusive',
        'mmp.max_power',
      ]);

    if (filters.moveIds?.length) query = query.where('m.id', 'in', filters.moveIds);
    if (filters.moveSlugs?.length) query = query.where('m.slug', 'in', filters.moveSlugs);
    if (filters.typeIds?.length) query = query.where('t.id', 'in', filters.typeIds);
    if (filters.typeSlugs?.length) query = query.where('t.slug', 'in', filters.typeSlugs);
    if (filters.categoryIds?.length) query = query.where('mc.id', 'in', filters.categoryIds);
    if (filters.categorySlugs?.length) query = query.where('mc.slug', 'in', filters.categorySlugs);
    if (filters.targetIds?.length) query = query.where('mt.id', 'in', filters.targetIds);
    if (filters.targetSlugs?.length) query = query.where('mt.slug', 'in', filters.targetSlugs);
    if (filters.flagIds?.length || filters.flagSlugs?.length) {
      query = query.where('m.id', 'in', this.flagSubquery(filters.flagIds, filters.flagSlugs));
    }

    return query;
  }

  private flagSubquery(
    idFilter?: number[],
    slugFilter?: string[],
    _filter: FilterLogic = FilterLogic.OR
  ) {
    return this.db
      .selectFrom('move_flags as mf')
      .innerJoin('move_flag_types as mft', 'mft.id', 'mf.flag_id')
      .select('mf.move_id')
      .where((eb) => {
        const conditions = [];

        if (idFilter?.length) {
          conditions.push(eb('mft.id', 'in', idFilter));
        }
        if (slugFilter?.length) {
          conditions.push(eb('mft.slug', 'in', slugFilter));
        }

        return conditions.length ? eb.or(conditions) : eb.lit(true);
      });
  }

  private async fetchRelations(moveIds: number[], filters: MoveFilter) {
    const [flags, boosts, effects, gmaxSpecies] = await Promise.all([
      this.fetchFlags(filters.includeFlags !== false ? moveIds : []),
      this.fetchBoosts(filters.includeBoosts !== false ? moveIds : []),
      this.fetchEffects(filters.includeEffects !== false ? moveIds : []),
      this.fetchGmaxSpecies(filters.includeGmaxSpecies !== false ? moveIds : []),
    ]);

    return {
      flags: this.groupBy(flags, 'move_id'),
      boosts: this.groupBy(boosts, 'move_id'),
      effects: this.groupBy(effects, 'move_id'),
      gmaxSpecies: this.groupBy(gmaxSpecies, 'move_id'),
    };
  }

  private fetchFlags(moveIds: number[]) {
    if (!moveIds.length)
      return Promise.resolve(
        [] as {
          move_id: number;
          id: number;
          name: string;
          slug: string;
          description: string | null;
        }[]
      );
    return this.db
      .selectFrom('move_flags as mf')
      .innerJoin('move_flag_types as mft', 'mft.id', 'mf.flag_id')
      .select(['mf.move_id', 'mft.id', 'mft.name', 'mft.slug', 'mft.description'])
      .where('mf.move_id', 'in', moveIds)
      .execute();
  }

  private fetchBoosts(moveIds: number[]) {
    if (!moveIds.length)
      return Promise.resolve(
        [] as {
          move_id: number;
          stat_id: number;
          stat_slug: string;
          stat_name: string;
          stages: number;
          is_self: boolean;
        }[]
      );
    return this.db
      .selectFrom('move_boosts as mb')
      .innerJoin('stats as s', 's.id', 'mb.stat_id')
      .select([
        'mb.move_id',
        's.id as stat_id',
        's.slug as stat_slug',
        's.name as stat_name',
        'mb.stages',
        'mb.is_self',
      ])
      .where('mb.move_id', 'in', moveIds)
      .execute();
  }

  private fetchEffects(moveIds: number[]) {
    if (!moveIds.length)
      return Promise.resolve(
        [] as {
          move_id: number;
          condition_type_id: number;
          condition_type_slug: string;
          condition_type_name: string;
          condition_id: number | null;
          condition_slug: string | null;
          condition_name: string | null;
          condition_type_fk: number | null;
          condition_type_fk_slug: string | null;
          condition_type_fk_name: string | null;
          condition_description: string | null;
          chance: number;
          is_self: boolean;
        }[]
      );
    return this.db
      .selectFrom('move_effects as me')
      .innerJoin('condition_types as ct', 'ct.id', 'me.condition_type_id')
      .leftJoin('conditions as c', 'c.id', 'me.condition_id')
      .leftJoin('condition_types as ct2', 'ct2.id', 'c.type_id')
      .select([
        'me.move_id',
        'ct.id as condition_type_id',
        'ct.slug as condition_type_slug',
        'ct.name as condition_type_name',
        'c.id as condition_id',
        'c.slug as condition_slug',
        'c.name as condition_name',
        'c.type_id as condition_type_fk',
        'ct2.slug as condition_type_fk_slug',
        'ct2.name as condition_type_fk_name',
        'c.description as condition_description',
        'me.chance',
        'me.is_self',
      ])
      .where('me.move_id', 'in', moveIds)
      .execute();
  }

  private fetchGmaxSpecies(moveIds: number[]) {
    if (!moveIds.length)
      return Promise.resolve(
        [] as {
          move_id: number;
          id: number;
          name: string;
          slug: string;
        }[]
      );
    return this.db
      .selectFrom('gmax_moves as gm')
      .innerJoin('species as s', 's.id', 'gm.species_id')
      .select(['gm.move_id', 's.id', 's.name', 's.slug'])
      .where('gm.move_id', 'in', moveIds)
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

  private toMove(
    row: Awaited<ReturnType<ReturnType<typeof this.buildSearchQuery>['execute']>>[number],
    relations: Awaited<ReturnType<typeof this.fetchRelations>>
  ): Move {
    const flags = relations.flags.get(row.id) ?? [];
    const boosts = relations.boosts.get(row.id) ?? [];
    const effects = relations.effects.get(row.id) ?? [];
    const gmaxSpeciesRows = relations.gmaxSpecies.get(row.id) ?? [];

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      desc: row.desc,
      shortDesc: row.short_desc,
      type: { id: row.type_id, name: row.type_name, slug: row.type_slug },
      category: {
        id: row.category_id,
        slug: row.category_slug,
        name: row.category_name,
        description: row.category_description,
      },
      target: row.target_id
        ? {
            id: row.target_id,
            name: row.target_name ?? '',
            slug: row.target_slug ?? '',
            description: row.target_description,
          }
        : null,
      power: row.power,
      accuracy: row.accuracy,
      pp: row.pp,
      priority: row.priority,
      critRatio: row.crit_ratio,
      minHits: row.min_hits,
      maxHits: row.max_hits,
      drainPercent: row.drain_percent,
      healPercent: row.heal_percent,
      recoilPercent: row.recoil_percent,
      flags,
      boosts: boosts.map((b) => ({
        stat: { id: b.stat_id, slug: b.stat_slug, name: b.stat_name },
        stages: b.stages,
        isSelf: b.is_self,
      })),
      effects: effects.map((e) => ({
        conditionType: {
          id: e.condition_type_id,
          slug: e.condition_type_slug,
          name: e.condition_type_name,
        },
        condition: e.condition_id
          ? {
              id: e.condition_id,
              slug: e.condition_slug ?? '',
              name: e.condition_name ?? '',
              type: {
                id: e.condition_type_fk ?? 0,
                slug: e.condition_type_fk_slug ?? '',
                name: e.condition_type_fk_name ?? '',
              },
              description: e.condition_description,
            }
          : null,
        chance: e.chance,
        isSelf: e.is_self,
      })),
      maxPower: row.max_power ?? null,
      zData:
        row.z_power != null || row.z_effect != null
          ? {
              zPower: row.z_power,
              zEffect: row.z_effect,
              zCrystal: row.z_crystal,
              isZExclusive: row.is_z_exclusive ?? false,
            }
          : null,
      gmaxSpecies: gmaxSpeciesRows.map((g) => ({ id: g.id, name: g.name, slug: g.slug })),
    };
  }
}
