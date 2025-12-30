import type { Seeder } from '../utils';
import { batchInsert, loadJson } from '../utils';

interface FormMoveJson {
  formId: number;
  moveId: number;
  methodId: number;
  level: number | null;
}

interface BehaviourJson {
  formId: number;
  data: Record<string, unknown>;
}

interface FormDropJson {
  formId: number;
  amount: number;
}

interface DropRangeJson {
  id: number;
  formId: number;
  itemId: number;
  quantityMin: number;
  quantityMax: number;
}

interface DropPercentageJson {
  formId: number;
  itemId: number;
  percentage: number;
}

interface FormAspectComboJson {
  id: number;
  formId: number;
  comboIndex: number;
}

interface FormAspectComboAspectJson {
  comboId: number;
  aspectId: number;
}

export const pokemonDataSeeder: Seeder = {
  name: 'Pokemon Data',
  tables: [
    'form_moves',
    'behaviour',
    'form_drops',
    'drop_ranges',
    'drop_percentages',
    'form_aspect_combos',
    'form_aspect_combo_aspects',
  ],

  async seed(db, logger) {
    let total = 0;

    // form_moves
    {
      const start = Date.now();
      const data = await loadJson<FormMoveJson[]>('form_moves.json');
      if (data.length > 0) {
        const rows = data.map((m) => ({
          form_id: m.formId,
          move_id: m.moveId,
          method_id: m.methodId,
          level: m.level,
        }));
        const count = await batchInsert(db, 'form_moves', rows);
        logger.table('form_moves', count, Date.now() - start);
        total += count;
      } else {
        logger.table('form_moves', 0, Date.now() - start);
      }
    }

    // behaviour
    {
      const start = Date.now();
      const data = await loadJson<BehaviourJson[]>('behaviour.json');
      if (data.length > 0) {
        const rows = data.map((b) => ({
          form_id: b.formId,
          data: JSON.stringify(b.data),
        }));
        const count = await batchInsert(db, 'behaviour', rows);
        logger.table('behaviour', count, Date.now() - start);
        total += count;
      } else {
        logger.table('behaviour', 0, Date.now() - start);
      }
    }

    // form_drops
    {
      const start = Date.now();
      const data = await loadJson<FormDropJson[]>('form_drops.json');
      const rows = data.map((d) => ({
        form_id: d.formId,
        amount: d.amount,
      }));
      const count = await batchInsert(db, 'form_drops', rows);
      logger.table('form_drops', count, Date.now() - start);
      total += count;
    }

    // drop_ranges
    {
      const start = Date.now();
      const data = await loadJson<DropRangeJson[]>('drop_ranges.json');
      const rows = data.map((d) => ({
        id: d.id,
        form_id: d.formId,
        item_id: d.itemId,
        quantity_min: d.quantityMin,
        quantity_max: d.quantityMax,
      }));
      const count = await batchInsert(db, 'drop_ranges', rows);
      logger.table('drop_ranges', count, Date.now() - start);
      total += count;
    }

    // drop_percentages
    {
      const start = Date.now();
      const data = await loadJson<DropPercentageJson[]>('drop_percentages.json');
      const rows = data.map((d) => ({
        form_id: d.formId,
        item_id: d.itemId,
        percentage: d.percentage,
      }));
      const count = await batchInsert(db, 'drop_percentages', rows);
      logger.table('drop_percentages', count, Date.now() - start);
      total += count;
    }

    // form_aspect_combos
    {
      const start = Date.now();
      const data = await loadJson<FormAspectComboJson[]>('form_aspect_combos.json');
      const rows = data.map((c) => ({
        id: c.id,
        form_id: c.formId,
        combo_index: c.comboIndex,
      }));
      const count = await batchInsert(db, 'form_aspect_combos', rows);
      logger.table('form_aspect_combos', count, Date.now() - start);
      total += count;
    }

    // form_aspect_combo_aspects
    {
      const start = Date.now();
      const data = await loadJson<FormAspectComboAspectJson[]>('form_aspect_combo_aspects.json');
      const rows = data.map((a) => ({
        combo_id: a.comboId,
        aspect_id: a.aspectId,
      }));
      const count = await batchInsert(db, 'form_aspect_combo_aspects', rows);
      logger.table('form_aspect_combo_aspects', count, Date.now() - start);
      total += count;
    }

    return total;
  },
};
