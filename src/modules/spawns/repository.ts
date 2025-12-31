import type { Kysely } from 'kysely';
import type { DB } from '@/infrastructure/db/types';
import type {
  BiomeRef,
  BiomeTagRef,
  MoonPhaseRef,
  Spawn,
  SpawnCondition,
  SpawnConditionLure,
  SpawnConditionPosition,
  SpawnConditionSky,
  SpawnConditionWeather,
  SpawnPreset,
  TimeRangeRef,
} from './domain';

interface SpawnRow {
  id: number;
  form_id: number;
  bucket_id: number;
  bucket_slug: string;
  bucket_name: string;
  position_type_id: number;
  position_type_slug: string;
  position_type_name: string;
  weight: number;
  level_min: number;
  level_max: number;
}

interface ConditionRow {
  id: number;
  spawn_id: number;
  condition_type: string;
  multiplier: number | null;
}

export class SpawnRepository {
  constructor(private db: Kysely<DB>) {}

  async findByFormIds(formIds: number[]): Promise<Map<number, Spawn[]>> {
    if (!formIds.length) return new Map();

    const spawns = await this.fetchSpawnRows(formIds);
    if (spawns.length === 0) return new Map();

    const spawnIds = spawns.map((s) => s.id);
    const conditions = await this.fetchConditions(spawnIds);
    const conditionIds = [...conditions.values()].flat().map((c) => c.id);

    const [biomes, biomeTags, timeRanges, moonPhases, weather, sky, position, lure, presets] =
      await Promise.all([
        this.fetchConditionBiomes(conditionIds),
        this.fetchConditionBiomeTags(conditionIds),
        this.fetchConditionTimeRanges(conditionIds),
        this.fetchConditionMoonPhases(conditionIds),
        this.fetchConditionWeather(conditionIds),
        this.fetchConditionSky(conditionIds),
        this.fetchConditionPosition(conditionIds),
        this.fetchConditionLure(conditionIds),
        this.fetchPresets(spawnIds),
      ]);

    return this.assembleSpawns(
      spawns,
      conditions,
      biomes,
      biomeTags,
      timeRanges,
      moonPhases,
      weather,
      sky,
      position,
      lure,
      presets
    );
  }

  private async fetchSpawnRows(formIds: number[]): Promise<SpawnRow[]> {
    return this.db
      .selectFrom('spawns as s')
      .innerJoin('spawn_buckets as sb', 'sb.id', 's.bucket_id')
      .innerJoin('spawn_position_types as spt', 'spt.id', 's.position_type_id')
      .select([
        's.id',
        's.form_id',
        's.bucket_id',
        'sb.slug as bucket_slug',
        'sb.name as bucket_name',
        's.position_type_id',
        'spt.slug as position_type_slug',
        'spt.name as position_type_name',
        's.weight',
        's.level_min',
        's.level_max',
      ])
      .where('s.form_id', 'in', formIds)
      .execute();
  }

  private async fetchConditions(spawnIds: number[]): Promise<Map<number, ConditionRow[]>> {
    if (!spawnIds.length) return new Map();

    const rows = await this.db
      .selectFrom('spawn_conditions')
      .select(['id', 'spawn_id', 'condition_type', 'multiplier'])
      .where('spawn_id', 'in', spawnIds)
      .execute();

    const map = new Map<number, ConditionRow[]>();
    for (const row of rows) {
      const arr = map.get(row.spawn_id) ?? [];
      arr.push(row);
      map.set(row.spawn_id, arr);
    }
    return map;
  }

  private async fetchConditionBiomes(conditionIds: number[]): Promise<Map<number, BiomeRef[]>> {
    if (!conditionIds.length) return new Map();

    const rows = await this.db
      .selectFrom('spawn_condition_biomes as scb')
      .innerJoin('biomes as b', 'b.id', 'scb.biome_id')
      .select(['scb.condition_id', 'b.id', 'b.slug', 'b.name'])
      .where('scb.condition_id', 'in', conditionIds)
      .execute();

    const map = new Map<number, BiomeRef[]>();
    for (const row of rows) {
      const arr = map.get(row.condition_id) ?? [];
      arr.push({ id: row.id, slug: row.slug, name: row.name });
      map.set(row.condition_id, arr);
    }
    return map;
  }

  private async fetchConditionBiomeTags(
    conditionIds: number[]
  ): Promise<Map<number, BiomeTagRef[]>> {
    if (!conditionIds.length) return new Map();

    const rows = await this.db
      .selectFrom('spawn_condition_biome_tags as scbt')
      .innerJoin('biome_tags as bt', 'bt.id', 'scbt.biome_tag_id')
      .select(['scbt.condition_id', 'bt.id', 'bt.slug', 'bt.name'])
      .where('scbt.condition_id', 'in', conditionIds)
      .execute();

    const map = new Map<number, BiomeTagRef[]>();
    for (const row of rows) {
      const arr = map.get(row.condition_id) ?? [];
      arr.push({ id: row.id, slug: row.slug, name: row.name });
      map.set(row.condition_id, arr);
    }
    return map;
  }

  private async fetchConditionTimeRanges(
    conditionIds: number[]
  ): Promise<Map<number, TimeRangeRef[]>> {
    if (!conditionIds.length) return new Map();

    const rows = await this.db
      .selectFrom('spawn_condition_time as sct')
      .innerJoin('time_ranges as tr', 'tr.id', 'sct.time_range_id')
      .select(['sct.condition_id', 'tr.id', 'tr.slug', 'tr.name'])
      .where('sct.condition_id', 'in', conditionIds)
      .execute();

    const map = new Map<number, TimeRangeRef[]>();
    for (const row of rows) {
      const arr = map.get(row.condition_id) ?? [];
      arr.push({ id: row.id, slug: row.slug, name: row.name });
      map.set(row.condition_id, arr);
    }
    return map;
  }

  private async fetchConditionMoonPhases(
    conditionIds: number[]
  ): Promise<Map<number, MoonPhaseRef[]>> {
    if (!conditionIds.length) return new Map();

    const rows = await this.db
      .selectFrom('spawn_condition_moon_phases as scmp')
      .innerJoin('moon_phases as mp', 'mp.id', 'scmp.moon_phase_id')
      .select(['scmp.condition_id', 'mp.id', 'mp.slug', 'mp.name'])
      .where('scmp.condition_id', 'in', conditionIds)
      .execute();

    const map = new Map<number, MoonPhaseRef[]>();
    for (const row of rows) {
      const arr = map.get(row.condition_id) ?? [];
      arr.push({ id: row.id, slug: row.slug, name: row.name });
      map.set(row.condition_id, arr);
    }
    return map;
  }

  private async fetchConditionWeather(
    conditionIds: number[]
  ): Promise<Map<number, SpawnConditionWeather>> {
    if (!conditionIds.length) return new Map();

    const rows = await this.db
      .selectFrom('spawn_condition_weather')
      .select(['condition_id', 'is_raining', 'is_thundering'])
      .where('condition_id', 'in', conditionIds)
      .execute();

    const map = new Map<number, SpawnConditionWeather>();
    for (const row of rows) {
      map.set(row.condition_id, {
        isRaining: row.is_raining,
        isThundering: row.is_thundering,
      });
    }
    return map;
  }

  private async fetchConditionSky(conditionIds: number[]): Promise<Map<number, SpawnConditionSky>> {
    if (!conditionIds.length) return new Map();

    const rows = await this.db
      .selectFrom('spawn_condition_sky')
      .select(['condition_id', 'can_see_sky', 'min_sky_light', 'max_sky_light'])
      .where('condition_id', 'in', conditionIds)
      .execute();

    const map = new Map<number, SpawnConditionSky>();
    for (const row of rows) {
      map.set(row.condition_id, {
        canSeeSky: row.can_see_sky,
        minSkyLight: row.min_sky_light,
        maxSkyLight: row.max_sky_light,
      });
    }
    return map;
  }

  private async fetchConditionPosition(
    conditionIds: number[]
  ): Promise<Map<number, SpawnConditionPosition>> {
    if (!conditionIds.length) return new Map();

    const rows = await this.db
      .selectFrom('spawn_condition_position')
      .select(['condition_id', 'min_y', 'max_y'])
      .where('condition_id', 'in', conditionIds)
      .execute();

    const map = new Map<number, SpawnConditionPosition>();
    for (const row of rows) {
      map.set(row.condition_id, {
        minY: row.min_y,
        maxY: row.max_y,
      });
    }
    return map;
  }

  private async fetchConditionLure(
    conditionIds: number[]
  ): Promise<Map<number, SpawnConditionLure>> {
    if (!conditionIds.length) return new Map();

    const rows = await this.db
      .selectFrom('spawn_condition_lure')
      .select(['condition_id', 'min_lure_level', 'max_lure_level'])
      .where('condition_id', 'in', conditionIds)
      .execute();

    const map = new Map<number, SpawnConditionLure>();
    for (const row of rows) {
      map.set(row.condition_id, {
        minLureLevel: row.min_lure_level,
        maxLureLevel: row.max_lure_level,
      });
    }
    return map;
  }

  private async fetchPresets(spawnIds: number[]): Promise<Map<number, SpawnPreset[]>> {
    if (!spawnIds.length) return new Map();

    const rows = await this.db
      .selectFrom('spawn_presets as sp')
      .innerJoin('spawn_preset_types as spt', 'spt.id', 'sp.preset_type_id')
      .select(['sp.spawn_id', 'spt.id', 'spt.slug', 'spt.name'])
      .where('sp.spawn_id', 'in', spawnIds)
      .execute();

    const map = new Map<number, SpawnPreset[]>();
    for (const row of rows) {
      const arr = map.get(row.spawn_id) ?? [];
      arr.push({ presetType: { id: row.id, slug: row.slug, name: row.name } });
      map.set(row.spawn_id, arr);
    }
    return map;
  }

  private assembleSpawns(
    spawns: SpawnRow[],
    conditions: Map<number, ConditionRow[]>,
    biomes: Map<number, BiomeRef[]>,
    biomeTags: Map<number, BiomeTagRef[]>,
    timeRanges: Map<number, TimeRangeRef[]>,
    moonPhases: Map<number, MoonPhaseRef[]>,
    weather: Map<number, SpawnConditionWeather>,
    sky: Map<number, SpawnConditionSky>,
    position: Map<number, SpawnConditionPosition>,
    lure: Map<number, SpawnConditionLure>,
    presets: Map<number, SpawnPreset[]>
  ): Map<number, Spawn[]> {
    const result = new Map<number, Spawn[]>();

    for (const spawn of spawns) {
      const spawnConditions = conditions.get(spawn.id) ?? [];
      const assembledConditions: SpawnCondition[] = spawnConditions.map((c) => ({
        id: c.id,
        type: c.condition_type,
        multiplier: c.multiplier,
        biomes: biomes.get(c.id) ?? [],
        biomeTags: biomeTags.get(c.id) ?? [],
        timeRanges: timeRanges.get(c.id) ?? [],
        moonPhases: moonPhases.get(c.id) ?? [],
        weather: weather.get(c.id) ?? null,
        sky: sky.get(c.id) ?? null,
        position: position.get(c.id) ?? null,
        lure: lure.get(c.id) ?? null,
      }));

      const spawnEntity: Spawn = {
        id: spawn.id,
        formId: spawn.form_id,
        bucket: { id: spawn.bucket_id, slug: spawn.bucket_slug, name: spawn.bucket_name },
        positionType: {
          id: spawn.position_type_id,
          slug: spawn.position_type_slug,
          name: spawn.position_type_name,
        },
        weight: spawn.weight,
        levelMin: spawn.level_min,
        levelMax: spawn.level_max,
        presets: presets.get(spawn.id) ?? [],
        conditions: assembledConditions,
      };

      const arr = result.get(spawn.form_id) ?? [];
      arr.push(spawnEntity);
      result.set(spawn.form_id, arr);
    }

    return result;
  }
}
