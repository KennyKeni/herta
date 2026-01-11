import { type Kysely, sql } from 'kysely';
import { createFuzzyMatcher, type FuzzyMatchOptions, type FuzzyMatchResult } from '@/common/fuzzy';
import type { DB } from '@/infrastructure/db/types';
import type {
  HiddenPowerIv,
  IncludeOptions,
  Type,
  TypeDetail,
  TypeFilter,
  TypeMatchupRef,
} from './domain';

export class TypesRepository {
  constructor(private db: Kysely<DB>) {}

  async getByIdentifier(identifier: string): Promise<Type | null> {
    const isId = /^\d+$/.test(identifier);

    const row = await this.db
      .selectFrom('types')
      .selectAll()
      .where(isId ? 'id' : 'slug', '=', isId ? Number(identifier) : identifier)
      .executeTakeFirst();

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
    };
  }

  async fuzzyResolve(names: string[]): Promise<number[]> {
    if (!names.length) return [];

    const results = await Promise.all(
      names.map((name) =>
        this.db
          .selectFrom('types')
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
      table: 'types',
      matchColumn: 'name',
      idColumn: 'id',
    })(query, options);
  }

  async searchTypes(filter: TypeFilter): Promise<{ data: Type[]; total: number }> {
    let query = this.db.selectFrom('types').select(['id', 'name', 'slug']);
    let countQuery = this.db.selectFrom('types').select(sql<number>`COUNT(*)`.as('count'));

    if (filter.typeIds?.length) {
      query = query.where('id', 'in', filter.typeIds);
      countQuery = countQuery.where('id', 'in', filter.typeIds);
    }
    if (filter.typeSlugs?.length) {
      query = query.where('slug', 'in', filter.typeSlugs);
      countQuery = countQuery.where('slug', 'in', filter.typeSlugs);
    }
    if (filter.name) {
      query = query.where(sql<boolean>`name % ${filter.name}`);
      countQuery = countQuery.where(sql<boolean>`name % ${filter.name}`);
    }

    if (filter.name) {
      query = query.orderBy(sql`similarity(name, ${filter.name})`, 'desc');
    } else {
      query = query.orderBy('id');
    }

    query = query.limit(filter.limit ?? 20).offset(filter.offset ?? 0);

    const [data, countResult] = await Promise.all([
      query.execute(),
      countQuery.executeTakeFirstOrThrow(),
    ]);

    return { data, total: Number(countResult.count) };
  }

  async getByIdentifierWithDetails(
    identifier: string,
    options: IncludeOptions = {}
  ): Promise<TypeDetail | null> {
    const type = await this.getByIdentifier(identifier);
    if (!type) return null;

    const [offensiveMatchups, defensiveMatchups, hiddenPowerIvs] = await Promise.all([
      options.includeMatchups !== false ? this.getOffensiveMatchups(type.id) : [],
      options.includeMatchups !== false ? this.getDefensiveMatchups(type.id) : [],
      options.includeHiddenPower !== false ? this.getHiddenPowerIvs(type.id) : [],
    ]);

    return {
      ...type,
      offensiveMatchups,
      defensiveMatchups,
      hiddenPowerIvs,
    };
  }

  private async getOffensiveMatchups(typeId: number): Promise<TypeMatchupRef[]> {
    const rows = await this.db
      .selectFrom('type_matchups as tm')
      .innerJoin('types as t', 't.id', 'tm.defending_type_id')
      .select(['t.id', 't.name', 't.slug', 'tm.multiplier'])
      .where('tm.attacking_type_id', '=', typeId)
      .where('tm.multiplier', '!=', 1)
      .orderBy('tm.multiplier', 'desc')
      .execute();

    return rows.map((r) => ({
      type: { id: r.id, name: r.name, slug: r.slug },
      multiplier: r.multiplier,
    }));
  }

  private async getDefensiveMatchups(typeId: number): Promise<TypeMatchupRef[]> {
    const rows = await this.db
      .selectFrom('type_matchups as tm')
      .innerJoin('types as t', 't.id', 'tm.attacking_type_id')
      .select(['t.id', 't.name', 't.slug', 'tm.multiplier'])
      .where('tm.defending_type_id', '=', typeId)
      .where('tm.multiplier', '!=', 1)
      .orderBy('tm.multiplier', 'desc')
      .execute();

    return rows.map((r) => ({
      type: { id: r.id, name: r.name, slug: r.slug },
      multiplier: r.multiplier,
    }));
  }

  private async getHiddenPowerIvs(typeId: number): Promise<HiddenPowerIv[]> {
    const rows = await this.db
      .selectFrom('hidden_power_ivs')
      .select(['hp', 'atk', 'def', 'spa', 'spd', 'spe'])
      .where('type_id', '=', typeId)
      .execute();

    return rows;
  }
}
