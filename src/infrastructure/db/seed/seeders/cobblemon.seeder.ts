import type { Seeder } from '../utils';
import { batchInsert, loadJson } from '../utils';

interface LightingJson {
  speciesId: number;
  data: {
    lightLevel: number;
    liquidGlowMode: string | null;
  };
}

interface RidingJson {
  speciesId: number;
  data: Record<string, unknown>;
}

export const cobblemonSeeder: Seeder = {
  name: 'Cobblemon Specific',
  tables: ['species_lighting', 'species_riding'],

  async seed(db, logger) {
    let total = 0;

    // species_lighting
    {
      const start = Date.now();
      const data = await loadJson<LightingJson[]>('lighting.json');
      const rows = data.map((l) => ({
        species_id: l.speciesId,
        light_level: l.data.lightLevel,
        liquid_glow_mode: l.data.liquidGlowMode ?? null,
      }));
      const count = await batchInsert(db, 'species_lighting', rows);
      logger.table('species_lighting', count, Date.now() - start);
      total += count;
    }

    // species_riding
    {
      const start = Date.now();
      const data = await loadJson<RidingJson[]>('riding.json');
      const rows = data.map((r) => ({
        species_id: r.speciesId,
        data: JSON.stringify(r.data),
      }));
      const count = await batchInsert(db, 'species_riding', rows);
      logger.table('species_riding', count, Date.now() - start);
      total += count;
    }

    return total;
  },
};
