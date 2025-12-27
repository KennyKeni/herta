import { Slug } from '../../../../common/utils/slug';
import type { Seeder } from '../utils';
import { batchInsert, loadJson } from '../utils';

interface NatureJson {
  id: number;
  slug: string;
  name: string;
  plusStatId: number | null;
  minusStatId: number | null;
}

export const naturesSeeder: Seeder = {
  name: 'Natures',
  tables: ['natures'],

  async seed(db, logger) {
    const start = Date.now();
    const data = await loadJson<NatureJson[]>('natures.json');

    const rows = data.map((n) => ({
      id: n.id,
      slug: Slug.forPokemon(n.name),
      name: n.name,
      plus_stat_id: n.plusStatId,
      minus_stat_id: n.minusStatId,
    }));

    const count = await batchInsert(db, 'natures', rows);
    logger.table('natures', count, Date.now() - start);
    return count;
  },
};
