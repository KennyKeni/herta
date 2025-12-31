import { type Kysely, sql } from 'kysely';

export interface FuzzyMatchOptions {
  limit?: number;
  threshold?: number;
}

export interface FuzzyMatchResult<TId = number> {
  id: TId;
  name: string;
  slug: string;
  score: number;
}

export interface FuzzyMatcherConfig {
  table: string;
  matchColumn: string;
  idColumn: string;
  nameColumn?: string;
  slugColumn?: string;
}

// biome-ignore lint/suspicious/noExplicitAny: generic utility accepts any DB schema
export function createFuzzyMatcher<TId = number>(db: Kysely<any>, config: FuzzyMatcherConfig) {
  const { table, matchColumn, idColumn, nameColumn = matchColumn, slugColumn = 'slug' } = config;

  return async function fuzzyMatch(
    query: string,
    options: FuzzyMatchOptions = {}
  ): Promise<FuzzyMatchResult<TId>[]> {
    const { limit = 1, threshold } = options;

    let dbQuery = db
      // biome-ignore lint/suspicious/noExplicitAny: dynamic table name from config
      .selectFrom(table as any)
      .select([
        sql<TId>`${sql.ref(idColumn)}`.as('id'),
        sql<string>`${sql.ref(nameColumn)}`.as('name'),
        sql<string>`${sql.ref(slugColumn)}`.as('slug'),
        sql<number>`similarity(${sql.ref(matchColumn)}, ${query})`.as('score'),
      ])
      .where(sql<boolean>`${sql.ref(matchColumn)} % ${query}`)
      .orderBy(sql`similarity(${sql.ref(matchColumn)}, ${query})`, 'desc')
      .limit(limit);

    if (threshold !== undefined) {
      dbQuery = dbQuery.where(
        sql<boolean>`similarity(${sql.ref(matchColumn)}, ${query}) >= ${threshold}`
      );
    }

    const results = await dbQuery.execute();

    return results as FuzzyMatchResult<TId>[];
  };
}
