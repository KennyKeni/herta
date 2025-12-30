import type { Kysely } from 'kysely';
import type { DB } from '@/infrastructure/db/types';
import type { Biome, BiomeTag, MoonPhase, TimeRange } from './domain';

export class WorldRepository {
  constructor(private db: Kysely<DB>) {}

  async findBiomes(ids: number[]): Promise<Biome[]> {
    if (!ids.length) return [];
    const rows = await this.db
      .selectFrom('biomes as b')
      .leftJoin('namespaces as n', 'n.id', 'b.namespace_id')
      .select(['b.id', 'b.name', 'n.id as namespace_id', 'n.name as namespace_name'])
      .where('b.id', 'in', ids)
      .execute();

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      namespace: r.namespace_id ? { id: r.namespace_id, name: r.namespace_name! } : null,
    }));
  }

  async findBiomeTags(ids: number[]): Promise<BiomeTag[]> {
    if (!ids.length) return [];
    const rows = await this.db
      .selectFrom('biome_tags as bt')
      .leftJoin('namespaces as n', 'n.id', 'bt.namespace_id')
      .select(['bt.id', 'bt.name', 'n.id as namespace_id', 'n.name as namespace_name'])
      .where('bt.id', 'in', ids)
      .execute();

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      namespace: r.namespace_id ? { id: r.namespace_id, name: r.namespace_name! } : null,
    }));
  }

  async findMoonPhases(ids: number[]): Promise<MoonPhase[]> {
    if (!ids.length) return [];
    return this.db
      .selectFrom('moon_phases')
      .select(['id', 'name'])
      .where('id', 'in', ids)
      .execute();
  }

  async findTimeRanges(ids: number[]): Promise<TimeRange[]> {
    if (!ids.length) return [];
    return this.db
      .selectFrom('time_ranges')
      .select(['id', 'name'])
      .where('id', 'in', ids)
      .execute();
  }

  async getAllBiomes(): Promise<Biome[]> {
    const rows = await this.db
      .selectFrom('biomes as b')
      .leftJoin('namespaces as n', 'n.id', 'b.namespace_id')
      .select(['b.id', 'b.name', 'n.id as namespace_id', 'n.name as namespace_name'])
      .execute();

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      namespace: r.namespace_id ? { id: r.namespace_id, name: r.namespace_name! } : null,
    }));
  }

  async getAllBiomeTags(): Promise<BiomeTag[]> {
    const rows = await this.db
      .selectFrom('biome_tags as bt')
      .leftJoin('namespaces as n', 'n.id', 'bt.namespace_id')
      .select(['bt.id', 'bt.name', 'n.id as namespace_id', 'n.name as namespace_name'])
      .execute();

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      namespace: r.namespace_id ? { id: r.namespace_id, name: r.namespace_name! } : null,
    }));
  }

  async getAllMoonPhases(): Promise<MoonPhase[]> {
    return this.db.selectFrom('moon_phases').select(['id', 'name']).execute();
  }

  async getAllTimeRanges(): Promise<TimeRange[]> {
    return this.db.selectFrom('time_ranges').select(['id', 'name']).execute();
  }
}
