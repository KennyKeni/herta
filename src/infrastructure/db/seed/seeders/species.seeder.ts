import { slugForPokemon } from '@/common/utils/slug';
import type { Seeder } from '../utils';
import { batchInsert, loadJson } from '../utils';

interface SpeciesJson {
  id: number;
  slug: string;
  name: string;
  generation: number;
  catchRate: number;
  baseFriendship: number;
  experienceGroupId: number;
  eggCycles: number;
  maleRatio: number | null;
  baseScale: number;
  description: string | null;
}

interface SpeciesHitboxJson {
  speciesId: number;
  width: number;
  height: number;
  fixed: boolean;
}

interface SpeciesEggGroupJson {
  speciesId: number;
  eggGroupId: number;
}

export const speciesSeeder: Seeder = {
  name: 'Species',
  tables: ['species', 'species_hitboxes', 'species_egg_groups'],

  async seed(db, logger) {
    let total = 0;

    // species
    {
      const start = Date.now();
      const speciesData = await loadJson<SpeciesJson[]>('species.json');
      const rows = speciesData.map((s) => ({
        id: s.id,
        slug: slugForPokemon(s.name),
        name: s.name,
        generation: s.generation,
        catch_rate: s.catchRate,
        base_friendship: s.baseFriendship,
        experience_group_id: s.experienceGroupId,
        egg_cycles: s.eggCycles,
        male_ratio: s.maleRatio,
        base_scale: s.baseScale,
        description: s.description,
      }));
      const count = await batchInsert(db, 'species', rows);
      logger.table('species', count, Date.now() - start);
      total += count;
    }

    // species_hitboxes
    {
      const start = Date.now();
      const data = await loadJson<SpeciesHitboxJson[]>('species_hitboxes.json');
      const rows = data.map((h) => ({
        species_id: h.speciesId,
        width: h.width,
        height: h.height,
        fixed: h.fixed,
      }));
      const count = await batchInsert(db, 'species_hitboxes', rows);
      logger.table('species_hitboxes', count, Date.now() - start);
      total += count;
    }

    // species_egg_groups
    {
      const start = Date.now();
      const data = await loadJson<SpeciesEggGroupJson[]>('species_egg_groups.json');
      const rows = data.map((e) => ({
        species_id: e.speciesId,
        egg_group_id: e.eggGroupId,
      }));
      const count = await batchInsert(db, 'species_egg_groups', rows);
      logger.table('species_egg_groups', count, Date.now() - start);
      total += count;
    }

    return total;
  },
};
