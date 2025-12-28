import { type Kysely, sql } from 'kysely';
import type { DB } from '@/infrastructure/db/types';
import type { Type } from './domain';

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
}
