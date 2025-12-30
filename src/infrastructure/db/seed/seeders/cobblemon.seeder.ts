import type { Seeder } from '../utils';
import { batchInsert, loadJson } from '../utils';

interface LightingJson {
  speciesId: number;
  lightLevel: number;
  liquidGlowMode: string | null;
}

interface RidingJson {
  speciesId: number;
  data: Record<string, unknown>;
}

interface SpawnJson {
  id: number;
  bucketId: number;
  positionTypeId: number;
  levelMin: number;
  levelMax: number;
  weight: number;
  formId: number;
}

interface SpawnConditionJson {
  id: number;
  spawnId: number;
  conditionType: string;
  multiplier: number | null;
}

interface SpawnPresetJson {
  spawnId: number;
  presetTypeId: number;
}

interface SpawnConditionBiomeJson {
  conditionId: number;
  biomeId: number;
}

interface SpawnConditionBiomeTagJson {
  conditionId: number;
  biomeTagId: number;
}

interface SpawnConditionTimeJson {
  conditionId: number;
  timeRangeId: number;
}

interface SpawnConditionWeatherJson {
  conditionId: number;
  isRaining: boolean | null;
  isThundering: boolean | null;
}

interface SpawnConditionMoonPhaseJson {
  conditionId: number;
  moonPhaseId: number;
}

interface SpawnConditionSkyJson {
  conditionId: number;
  canSeeSky: boolean | null;
  minSkyLight: number | null;
  maxSkyLight: number | null;
}

interface SpawnConditionPositionJson {
  conditionId: number;
  minY: number | null;
  maxY: number | null;
}

interface SpawnConditionLureJson {
  conditionId: number;
  minLureLevel: number | null;
  maxLureLevel: number | null;
}

export const cobblemonSeeder: Seeder = {
  name: 'Cobblemon Specific',
  tables: [
    'lighting',
    'riding',
    'spawns',
    'spawn_conditions',
    'spawn_presets',
    'spawn_condition_biomes',
    'spawn_condition_biome_tags',
    'spawn_condition_time',
    'spawn_condition_weather',
    'spawn_condition_moon_phases',
    'spawn_condition_sky',
    'spawn_condition_position',
    'spawn_condition_lure',
  ],

  async seed(db, logger) {
    let total = 0;

    // lighting
    {
      const start = Date.now();
      const data = await loadJson<LightingJson[]>('lighting.json');
      const rows = data.map((l) => ({
        species_id: l.speciesId,
        light_level: l.lightLevel,
        liquid_glow_mode: l.liquidGlowMode,
      }));
      const count = await batchInsert(db, 'lighting', rows);
      logger.table('lighting', count, Date.now() - start);
      total += count;
    }

    // riding
    {
      const start = Date.now();
      const data = await loadJson<RidingJson[]>('riding.json');
      const rows = data.map((r) => ({
        species_id: r.speciesId,
        data: JSON.stringify(r.data),
      }));
      const count = await batchInsert(db, 'riding', rows);
      logger.table('riding', count, Date.now() - start);
      total += count;
    }

    // spawns
    {
      const start = Date.now();
      const data = await loadJson<SpawnJson[]>('spawns.json');
      const rows = data.map((s) => ({
        id: s.id,
        bucket_id: s.bucketId,
        position_type_id: s.positionTypeId,
        level_min: s.levelMin,
        level_max: s.levelMax,
        weight: s.weight,
        form_id: s.formId,
      }));
      const count = await batchInsert(db, 'spawns', rows);
      logger.table('spawns', count, Date.now() - start);
      total += count;
    }

    // spawn_conditions
    {
      const start = Date.now();
      const data = await loadJson<SpawnConditionJson[]>('spawn_conditions.json');
      const rows = data.map((c) => ({
        id: c.id,
        spawn_id: c.spawnId,
        condition_type: c.conditionType,
        multiplier: c.multiplier,
      }));
      const count = await batchInsert(db, 'spawn_conditions', rows);
      logger.table('spawn_conditions', count, Date.now() - start);
      total += count;
    }

    // spawn_presets
    {
      const start = Date.now();
      const data = await loadJson<SpawnPresetJson[]>('spawn_presets.json');
      const rows = data.map((p) => ({
        spawn_id: p.spawnId,
        preset_type_id: p.presetTypeId,
      }));
      const count = await batchInsert(db, 'spawn_presets', rows);
      logger.table('spawn_presets', count, Date.now() - start);
      total += count;
    }

    // spawn_condition_biomes
    {
      const start = Date.now();
      const data = await loadJson<SpawnConditionBiomeJson[]>('spawn_condition_biomes.json');
      const rows = data.map((b) => ({
        condition_id: b.conditionId,
        biome_id: b.biomeId,
      }));
      const count = await batchInsert(db, 'spawn_condition_biomes', rows);
      logger.table('spawn_condition_biomes', count, Date.now() - start);
      total += count;
    }

    // spawn_condition_biome_tags
    {
      const start = Date.now();
      const data = await loadJson<SpawnConditionBiomeTagJson[]>('spawn_condition_biome_tags.json');
      const rows = data.map((b) => ({
        condition_id: b.conditionId,
        biome_tag_id: b.biomeTagId,
      }));
      const count = await batchInsert(db, 'spawn_condition_biome_tags', rows);
      logger.table('spawn_condition_biome_tags', count, Date.now() - start);
      total += count;
    }

    // spawn_condition_time
    {
      const start = Date.now();
      const data = await loadJson<SpawnConditionTimeJson[]>('spawn_condition_time.json');
      const rows = data.map((t) => ({
        condition_id: t.conditionId,
        time_range_id: t.timeRangeId,
      }));
      const count = await batchInsert(db, 'spawn_condition_time', rows);
      logger.table('spawn_condition_time', count, Date.now() - start);
      total += count;
    }

    // spawn_condition_weather
    {
      const start = Date.now();
      const data = await loadJson<SpawnConditionWeatherJson[]>('spawn_condition_weather.json');
      const rows = data.map((w) => ({
        condition_id: w.conditionId,
        is_raining: w.isRaining,
        is_thundering: w.isThundering,
      }));
      const count = await batchInsert(db, 'spawn_condition_weather', rows);
      logger.table('spawn_condition_weather', count, Date.now() - start);
      total += count;
    }

    // spawn_condition_moon_phases
    {
      const start = Date.now();
      const data = await loadJson<SpawnConditionMoonPhaseJson[]>('spawn_condition_moon_phases.json');
      const rows = data.map((m) => ({
        condition_id: m.conditionId,
        moon_phase_id: m.moonPhaseId,
      }));
      const count = await batchInsert(db, 'spawn_condition_moon_phases', rows);
      logger.table('spawn_condition_moon_phases', count, Date.now() - start);
      total += count;
    }

    // spawn_condition_sky
    {
      const start = Date.now();
      const data = await loadJson<SpawnConditionSkyJson[]>('spawn_condition_sky.json');
      const rows = data.map((s) => ({
        condition_id: s.conditionId,
        can_see_sky: s.canSeeSky,
        min_sky_light: s.minSkyLight,
        max_sky_light: s.maxSkyLight,
      }));
      const count = await batchInsert(db, 'spawn_condition_sky', rows);
      logger.table('spawn_condition_sky', count, Date.now() - start);
      total += count;
    }

    // spawn_condition_position
    {
      const start = Date.now();
      const data = await loadJson<SpawnConditionPositionJson[]>('spawn_condition_position.json');
      const rows = data.map((p) => ({
        condition_id: p.conditionId,
        min_y: p.minY,
        max_y: p.maxY,
      }));
      const count = await batchInsert(db, 'spawn_condition_position', rows);
      logger.table('spawn_condition_position', count, Date.now() - start);
      total += count;
    }

    // spawn_condition_lure
    {
      const start = Date.now();
      const data = await loadJson<SpawnConditionLureJson[]>('spawn_condition_lure.json');
      const rows = data.map((l) => ({
        condition_id: l.conditionId,
        min_lure_level: l.minLureLevel,
        max_lure_level: l.maxLureLevel,
      }));
      const count = await batchInsert(db, 'spawn_condition_lure', rows);
      logger.table('spawn_condition_lure', count, Date.now() - start);
      total += count;
    }

    return total;
  },
};
