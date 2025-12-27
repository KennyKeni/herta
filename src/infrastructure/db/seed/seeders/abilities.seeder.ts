import { Slug } from '../../../../common/utils/slug';
import type { Seeder } from '../utils';
import { batchInsert, loadJson } from '../utils';

interface AbilityJson {
  id: number;
  slug: string;
  name: string;
  desc: string | null;
  shortDesc: string | null;
}

interface AbilityFlagJson {
  abilityId: number;
  flagId: number;
}

export const abilitiesSeeder: Seeder = {
  name: 'Abilities',
  tables: ['abilities', 'ability_flags'],

  async seed(db, logger) {
    let total = 0;

    // abilities
    {
      const start = Date.now();
      const data = await loadJson<AbilityJson[]>('abilities.json');
      const rows = data.map((a) => ({
        id: a.id,
        slug: Slug.forPokemon(a.name),
        name: a.name,
        desc: a.desc,
        short_desc: a.shortDesc,
      }));
      const count = await batchInsert(db, 'abilities', rows);
      logger.table('abilities', count, Date.now() - start);
      total += count;
    }

    // ability_flags
    {
      const start = Date.now();
      const data = await loadJson<AbilityFlagJson[]>('ability_flags.json');
      const rows = data.map((f) => ({
        ability_id: f.abilityId,
        flag_id: f.flagId,
      }));
      const count = await batchInsert(db, 'ability_flags', rows);
      logger.table('ability_flags', count, Date.now() - start);
      total += count;
    }

    return total;
  },
};
