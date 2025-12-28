import { type Kysely, sql } from 'kysely';
import type { DB } from '@/infrastructure/db/types';
import type { Ability } from './domain';

export class AbilitiesRepository {
  constructor(private db: Kysely<DB>) {}

  async getByIdentifier(identifier: string): Promise<Ability | null> {
    const isId = /^\d+$/.test(identifier);

    const row = await this.db
      .selectFrom('abilities')
      .selectAll()
      .where(isId ? 'id' : 'slug', '=', isId ? Number(identifier) : identifier)
      .executeTakeFirst();

    if (!row) return null;

    const flags = await this.db
      .selectFrom('ability_flags')
      .innerJoin('ability_flag_types', 'ability_flag_types.id', 'ability_flags.flag_id')
      .select([
        'ability_flag_types.id',
        'ability_flag_types.name',
        'ability_flag_types.slug',
        'ability_flag_types.description',
      ])
      .where('ability_flags.ability_id', '=', row.id)
      .execute();

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      desc: row.desc,
      shortDesc: row.short_desc,
      flags,
    };
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
}
