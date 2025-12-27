import { Slug } from '../../../../common/utils/slug';
import type { Seeder } from '../utils';
import { batchInsert, loadJson } from '../utils';

interface AspectJson {
  id: number;
  slug: string;
  name: string;
  type: string;
  isCosmetic: boolean;
  isFlag: boolean;
  aspectFormat: string | null;
}

interface AspectChoiceJson {
  id: number;
  aspectId: number;
  value: string;
  name: string;
  aspectString: string;
}

interface AspectGroupsMapJson {
  aspectId: number;
  aspectGroupId: number;
}

interface FormAspectJson {
  formId: number;
  aspectChoiceId: number;
}

export const aspectsSeeder: Seeder = {
  name: 'Aspects',
  tables: ['aspects', 'aspect_choices', 'aspect_groups_map', 'form_aspects'],

  async seed(db, logger) {
    let total = 0;

    // aspects
    {
      const start = Date.now();
      const data = await loadJson<AspectJson[]>('aspects.json');
      const rows = data.map((a) => ({
        id: a.id,
        slug: Slug.forPokemon(a.name),
        name: a.name,
        type: a.type,
      }));
      const count = await batchInsert(db, 'aspects', rows);
      logger.table('aspects', count, Date.now() - start);
      total += count;
    }

    // aspect_choices
    {
      const start = Date.now();
      const data = await loadJson<AspectChoiceJson[]>('aspect_choices.json');
      const rows = data.map((c) => ({
        id: c.id,
        aspect_id: c.aspectId,
        slug: Slug.forPokemon(c.name),
        name: c.name,
        aspect_string: c.aspectString,
      }));
      const count = await batchInsert(db, 'aspect_choices', rows);
      logger.table('aspect_choices', count, Date.now() - start);
      total += count;
    }

    // aspect_groups_map
    {
      const start = Date.now();
      const data = await loadJson<AspectGroupsMapJson[]>('aspect_groups_map.json');
      const rows = data.map((m) => ({
        aspect_id: m.aspectId,
        aspect_group_id: m.aspectGroupId,
      }));
      const count = await batchInsert(db, 'aspect_groups_map', rows);
      logger.table('aspect_groups_map', count, Date.now() - start);
      total += count;
    }

    // form_aspects
    {
      const start = Date.now();
      const data = await loadJson<FormAspectJson[]>('form_aspects.json');
      const rows = data.map((f) => ({
        form_id: f.formId,
        aspect_choice_id: f.aspectChoiceId,
      }));
      const count = await batchInsert(db, 'form_aspects', rows);
      logger.table('form_aspects', count, Date.now() - start);
      total += count;
    }

    return total;
  },
};
