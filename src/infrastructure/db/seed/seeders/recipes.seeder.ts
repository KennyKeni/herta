import type { Seeder } from '../utils';
import { batchInsert, loadJson } from '../utils';

interface RecipeJson {
  id: string;
  type: string;
  result_id: string;
  result_count: number;
}

interface RecipeSlotTypeJson {
  id: number;
  name: string;
  description: string | null;
}

interface RecipeInputJson {
  recipe_id: string;
  slot: number | null;
  slot_type_id: number | null;
  input_type: string;
  input_namespace: string;
  input_value: string;
}

export const recipesSeeder: Seeder = {
  name: 'Recipes',
  tables: ['recipes', 'recipe_slot_types', 'recipe_inputs'],

  async seed(db, logger) {
    let total = 0;

    // recipes
    {
      const start = Date.now();
      const data = await loadJson<RecipeJson[]>('recipes.json');
      const rows = data.map((r) => ({
        id: r.id,
        type: r.type,
        result_id: r.result_id,
        result_count: r.result_count,
      }));
      const count = await batchInsert(db, 'recipes', rows);
      logger.table('recipes', count, Date.now() - start);
      total += count;
    }

    // recipe_slot_types
    {
      const start = Date.now();
      const data = await loadJson<RecipeSlotTypeJson[]>('recipe_slot_types.json');
      const rows = data.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
      }));
      const count = await batchInsert(db, 'recipe_slot_types', rows);
      logger.table('recipe_slot_types', count, Date.now() - start);
      total += count;
    }

    // recipe_inputs
    {
      const start = Date.now();
      const data = await loadJson<RecipeInputJson[]>('recipe_inputs.json');
      const rows = data.map((i) => ({
        recipe_id: i.recipe_id,
        slot: i.slot,
        slot_type_id: i.slot_type_id,
        input_type: i.input_type,
        input_namespace: i.input_namespace,
        input_value: i.input_value,
      }));
      const count = await batchInsert(db, 'recipe_inputs', rows);
      logger.table('recipe_inputs', count, Date.now() - start);
      total += count;
    }

    return total;
  },
};
