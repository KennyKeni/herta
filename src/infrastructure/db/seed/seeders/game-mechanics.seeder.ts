import type { Seeder } from '../utils';
import { batchInsert, loadJson } from '../utils';

interface TypeMatchupJson {
  attackingTypeId: number;
  defendingTypeId: number;
  multiplier: number;
}

interface HiddenPowerIvsJson {
  typeId: number;
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export const gameMechanicsSeeder: Seeder = {
  name: 'Game Mechanics',
  tables: ['type_matchups', 'hidden_power_ivs'],

  async seed(db, logger) {
    let total = 0;

    // type_matchups
    {
      const start = Date.now();
      const data = await loadJson<TypeMatchupJson[]>('type_matchups.json');
      const rows = data.map((m) => ({
        attacking_type_id: m.attackingTypeId,
        defending_type_id: m.defendingTypeId,
        multiplier: m.multiplier,
      }));
      const count = await batchInsert(db, 'type_matchups', rows);
      logger.table('type_matchups', count, Date.now() - start);
      total += count;
    }

    // hidden_power_ivs
    {
      const start = Date.now();
      const data = await loadJson<HiddenPowerIvsJson[]>('hidden_power_ivs.json');
      const rows = data.map((h) => ({
        type_id: h.typeId,
        hp: h.hp,
        atk: h.atk,
        def: h.def,
        spa: h.spa,
        spd: h.spd,
        spe: h.spe,
      }));
      const count = await batchInsert(db, 'hidden_power_ivs', rows);
      logger.table('hidden_power_ivs', count, Date.now() - start);
      total += count;
    }

    return total;
  },
};
