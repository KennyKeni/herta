import { type Kysely, sql } from 'kysely';
import { createFuzzyMatcher, type FuzzyMatchOptions, type FuzzyMatchResult } from '@/common/fuzzy';
import { FilterLogic } from '@/common/types';
import type { DB } from '@/infrastructure/db/types';
import type { Ability, AbilityFilter, IncludeOptions } from './domain';

export class AbilitiesRepository {
  constructor(private db: Kysely<DB>) {}

  async getByIdentifier(identifier: string, options: IncludeOptions = {}): Promise<Ability | null> {
    const isId = /^\d+$/.test(identifier);

    const row = await this.db
      .selectFrom('abilities')
      .selectAll()
      .where(isId ? 'id' : 'slug', '=', isId ? Number(identifier) : identifier)
      .executeTakeFirst();

    if (!row) return null;

    const flags =
      options.includeFlags !== false
        ? await this.db
            .selectFrom('ability_flags')
            .innerJoin('ability_flag_types', 'ability_flag_types.id', 'ability_flags.flag_id')
            .select([
              'ability_flag_types.id',
              'ability_flag_types.name',
              'ability_flag_types.slug',
              'ability_flag_types.description',
            ])
            .where('ability_flags.ability_id', '=', row.id)
            .execute()
        : [];

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      desc: row.desc,
      shortDesc: row.short_desc,
      flags,
    };
  }

  async searchAbilities(filters: AbilityFilter): Promise<{ data: Ability[]; total: number }> {
    let query = this.buildSearchQuery(filters);
    let countQuery = this.buildSearchQuery(filters)
      .clearSelect()
      .select(sql<number>`COUNT(*)`.as('count'));

    if (filters.name) {
      query = query.where(sql<boolean>`a.name % ${filters.name}`);
      countQuery = countQuery.where(sql<boolean>`a.name % ${filters.name}`);
    }

    if (filters.name) {
      query = query.orderBy(sql`similarity(a.name, ${filters.name})`, 'desc');
    } else {
      query = query.orderBy('a.id');
    }

    query = query.limit(filters.limit ?? 20).offset(filters.offset ?? 0);

    const [rows, countResult] = await Promise.all([
      query.execute(),
      countQuery.executeTakeFirstOrThrow(),
    ]);

    if (rows.length === 0) return { data: [], total: Number(countResult.count) };

    const abilityIds = rows.map((r) => r.id);
    const flags = await this.fetchFlags(filters.includeFlags !== false ? abilityIds : []);
    const flagsMap = this.groupBy(flags, 'ability_id');

    const data = rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      desc: row.desc,
      shortDesc: row.short_desc,
      flags: flagsMap.get(row.id) ?? [],
    }));

    return { data, total: Number(countResult.count) };
  }

  async fuzzyResolve(names: string[]): Promise<number[]> {
    if (!names.length) return [];

    const results = await Promise.all(
      names.map((name) =>
        this.db
          .selectFrom('abilities')
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
      table: 'abilities',
      matchColumn: 'name',
      idColumn: 'id',
    })(query, options);
  }

  private buildSearchQuery(filters: AbilityFilter) {
    let query = this.db
      .selectFrom('abilities as a')
      .select([
        'a.id as id',
        'a.slug as slug',
        'a.name as name',
        'a.short_desc as short_desc',
        'a.desc as desc',
      ]);

    if (filters.abilityIds?.length) query = query.where('a.id', 'in', filters.abilityIds);
    if (filters.abilitySlugs?.length) query = query.where('a.slug', 'in', filters.abilitySlugs);
    if (filters.flagIds?.length || filters.flagSlugs?.length) {
      query = query.where('a.id', 'in', this.flagSubquery(filters.flagIds, filters.flagSlugs));
    }

    return query;
  }

  private flagSubquery(
    idFilter?: number[],
    slugFilter?: string[],
    _filter: FilterLogic = FilterLogic.OR
  ) {
    return this.db
      .selectFrom('ability_flags as af')
      .innerJoin('ability_flag_types as at', 'at.id', 'af.flag_id')
      .select('af.ability_id')
      .where((eb) => {
        const conditions = [];

        if (idFilter?.length) {
          conditions.push(eb('at.id', 'in', idFilter));
        }
        if (slugFilter?.length) {
          conditions.push(eb('at.slug', 'in', slugFilter));
        }

        return conditions.length ? eb.or(conditions) : eb.lit(true);
      });
  }

  private fetchFlags(abilityIds: number[]) {
    if (!abilityIds.length)
      return Promise.resolve(
        [] as {
          ability_id: number;
          id: number;
          name: string;
          slug: string;
          description: string | null;
        }[]
      );
    return this.db
      .selectFrom('ability_flags as af')
      .innerJoin('ability_flag_types as aft', 'aft.id', 'af.flag_id')
      .select(['af.ability_id', 'aft.id', 'aft.name', 'aft.slug', 'aft.description'])
      .where('af.ability_id', 'in', abilityIds)
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
}
