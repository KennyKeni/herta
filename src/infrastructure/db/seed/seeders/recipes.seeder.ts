import type { Seeder } from '../utils';
import { batchInsert, loadJson } from '../utils';

interface RecipeJson {
  id: number;
  typeId: number;
  resultItemId: number | null;
  resultCount: number;
  experience?: number | null;
  cookingTime?: number | null;
}

interface RecipeSlotTypeJson {
  id: number;
  name: string;
  description: string | null;
}

interface RecipeInputJson {
  recipeId: number;
  itemId: number;
  slot?: number | null;
  slotTypeId?: number | null;
}

interface RecipeTagInputJson {
  recipeId: number;
  tagTypeId: number;
  slot?: number | null;
  slotTypeId?: number | null;
}

export const recipesSeeder: Seeder = {
  name: 'Recipes',
  tables: ['recipes', 'recipe_slot_types', 'recipe_inputs', 'recipe_tag_inputs'],

  async seed(db, logger) {
    let total = 0;

    // recipes
    {
      const start = Date.now();
      const data = await loadJson<RecipeJson[]>('recipes.json');
      const rows = data.map((r) => ({
        id: r.id,
        type_id: r.typeId,
        result_item_id: r.resultItemId,
        result_count: r.resultCount,
        experience: r.experience ?? null,
        cooking_time: r.cookingTime ?? null,
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
        recipe_id: i.recipeId,
        item_id: i.itemId,
        slot: i.slot ?? null,
        slot_type_id: i.slotTypeId ?? null,
      }));
      const count = await batchInsert(db, 'recipe_inputs', rows);
      logger.table('recipe_inputs', count, Date.now() - start);
      total += count;
    }

    // recipe_tag_inputs
    {
      const start = Date.now();
      const data = await loadJson<RecipeTagInputJson[]>('recipe_tag_inputs.json');
      const rows = data.map((t) => ({
        recipe_id: t.recipeId,
        tag_id: t.tagTypeId,
        slot: t.slot ?? null,
        slot_type_id: t.slotTypeId ?? null,
      }));
      const count = await batchInsert(db, 'recipe_tag_inputs', rows);
      logger.table('recipe_tag_inputs', count, Date.now() - start);
      total += count;
    }

    return total;
  },
};
