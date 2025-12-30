import { slugForPokemon } from '../../../../common/utils/slug';
import type { Seeder } from '../utils';
import { batchInsert, loadJson } from '../utils';

interface MoveJson {
  id: number;
  name: string;
  typeId: number;
  categoryId: number;
  targetId: number | null;
  power: number | null;
  accuracy: number | boolean | null;
  pp: number;
  priority: number;
  critRatio: number | null;
  minHits: number | null;
  maxHits: number | null;
  drainPercent: number | null;
  healPercent: number | null;
  recoilPercent: number | null;
  desc: string | null;
  shortDesc: string | null;
}

interface MoveFlagJson {
  moveId: number;
  flagId: number;
}

interface MoveBoostJson {
  moveId: number;
  isSelf: boolean;
  statId: number;
  stages: number;
}

interface MoveEffectJson {
  moveId: number;
  chance: number;
  isSelf: boolean;
  conditionTypeId: number;
  conditionId: number;
}

interface MoveZDataJson {
  moveId: number;
  isZExclusive: boolean;
  zCrystal: string | null;
  zPower: number | null;
  zEffect: string | null;
}

interface MoveMaxPowerJson {
  moveId: number;
  maxPower: number;
}

interface GmaxMoveJson {
  moveId: number;
  speciesId: number;
}

export const movesSeeder: Seeder = {
  name: 'Moves',
  tables: [
    'moves',
    'move_flags',
    'move_boosts',
    'move_effects',
    'move_z_data',
    'move_max_power',
    'gmax_moves',
  ],

  async seed(db, logger) {
    let total = 0;

    // moves
    {
      const start = Date.now();
      const data = await loadJson<MoveJson[]>('moves.json');
      const rows = data.map((m) => ({
        id: m.id,
        slug: slugForPokemon(m.name),
        name: m.name,
        type_id: m.typeId,
        category_id: m.categoryId,
        target_id: m.targetId,
        power: m.power,
        accuracy: m.accuracy === true ? -1 : m.accuracy === false ? null : m.accuracy,
        pp: m.pp,
        priority: m.priority,
        crit_ratio: m.critRatio,
        min_hits: m.minHits,
        max_hits: m.maxHits,
        drain_percent: m.drainPercent,
        heal_percent: m.healPercent,
        recoil_percent: m.recoilPercent,
        desc: m.desc,
        short_desc: m.shortDesc,
      }));
      const count = await batchInsert(db, 'moves', rows);
      logger.table('moves', count, Date.now() - start);
      total += count;
    }

    // move_flags
    {
      const start = Date.now();
      const data = await loadJson<MoveFlagJson[]>('move_flags.json');
      const rows = data.map((f) => ({
        move_id: f.moveId,
        flag_id: f.flagId,
      }));
      const count = await batchInsert(db, 'move_flags', rows);
      logger.table('move_flags', count, Date.now() - start);
      total += count;
    }

    // move_boosts
    {
      const start = Date.now();
      const data = await loadJson<MoveBoostJson[]>('move_boosts.json');
      const rows = data.map((b) => ({
        move_id: b.moveId,
        is_self: b.isSelf,
        stat_id: b.statId,
        stages: b.stages,
      }));
      const count = await batchInsert(db, 'move_boosts', rows);
      logger.table('move_boosts', count, Date.now() - start);
      total += count;
    }

    // move_effects
    {
      const start = Date.now();
      const data = await loadJson<MoveEffectJson[]>('move_effects.json');
      const rows = data.map((e) => ({
        move_id: e.moveId,
        chance: e.chance,
        is_self: e.isSelf,
        condition_type_id: e.conditionTypeId,
        condition_id: e.conditionId,
      }));
      const count = await batchInsert(db, 'move_effects', rows);
      logger.table('move_effects', count, Date.now() - start);
      total += count;
    }

    // move_z_data
    {
      const start = Date.now();
      const data = await loadJson<MoveZDataJson[]>('move_z_data.json');
      const rows = data.map((z) => ({
        move_id: z.moveId,
        is_z_exclusive: z.isZExclusive,
        z_crystal: z.zCrystal,
        z_power: z.zPower,
        z_effect: z.zEffect,
      }));
      const count = await batchInsert(db, 'move_z_data', rows);
      logger.table('move_z_data', count, Date.now() - start);
      total += count;
    }

    // move_max_power
    {
      const start = Date.now();
      const data = await loadJson<MoveMaxPowerJson[]>('move_max_power.json');
      const rows = data.map((m) => ({
        move_id: m.moveId,
        max_power: m.maxPower,
      }));
      const count = await batchInsert(db, 'move_max_power', rows);
      logger.table('move_max_power', count, Date.now() - start);
      total += count;
    }

    // gmax_moves
    {
      const start = Date.now();
      const data = await loadJson<GmaxMoveJson[]>('gmax_moves.json');
      const rows = data.map((g) => ({
        move_id: g.moveId,
        species_id: g.speciesId,
      }));
      const count = await batchInsert(db, 'gmax_moves', rows);
      logger.table('gmax_moves', count, Date.now() - start);
      total += count;
    }

    return total;
  },
};
