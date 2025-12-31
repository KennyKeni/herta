import { sql } from 'kysely';
import { db } from '../index';
import { createLogger } from './logger';

const TABLES_TO_CLEAR = [
  // Outbox
  'outbox_events',
  // Articles
  'article_category_map',
  'articles',
  'article_categories',
  // Pokemon Data (depends on forms, moves, items, aspects)
  'form_aspect_combo_aspects',
  'form_aspect_combos',
  'drop_percentages',
  'drop_ranges',
  'form_drops',
  'behaviour',
  'form_moves',
  // Recipes (depends on items)
  'recipe_tag_inputs',
  'recipe_inputs',
  'recipe_slot_types',
  'recipes',
  // Spawn tables (depends on forms, biomes, items)
  'spawn_condition_lure',
  'spawn_condition_position',
  'spawn_condition_sky',
  'spawn_condition_moon_phases',
  'spawn_condition_weather',
  'spawn_condition_time',
  'spawn_condition_biome_tags',
  'spawn_condition_biomes',
  'spawn_presets',
  'spawn_conditions',
  'spawns',
  // Cobblemon Specific (depends on species)
  'riding',
  'lighting',
  // Game Mechanics (depends on types)
  'hidden_power_ivs',
  'type_matchups',
  // Aspects (depends on forms, aspect_groups)
  'form_aspects',
  'aspect_groups_map',
  'aspect_choices',
  'aspects',
  // Items (depends on types, stats)
  'item_tag_hierarchy',
  'item_tags',
  'item_flags',
  'item_boosts',
  'items',
  'item_tag_types',
  // Moves (depends on types, categories, targets, species)
  'gmax_moves',
  'move_max_power',
  'move_z_data',
  'move_effects',
  'move_boosts',
  'move_flags',
  'moves',
  // Forms (depends on species, abilities)
  'form_tags',
  'form_override_egg_groups',
  'form_hitboxes',
  'form_overrides',
  'form_labels',
  'form_abilities',
  'form_types',
  'forms',
  // Species (depends on experience_groups, egg_groups)
  'species_egg_groups',
  'species_hitboxes',
  'species',
  // Abilities (depends on ability_flag_types)
  'ability_flags',
  'abilities',
  // Natures (depends on stats)
  'natures',
  // Base Reference Tables (no dependencies) - reverse order
  'labels',
  'biome_tag_biomes',
  'biomes',
  'biome_tags',
  'recipe_tag_types',
  'form_tag_types',
  'recipe_types',
  'spawn_condition_types',
  'spawn_buckets',
  'spawn_preset_types',
  'spawn_position_types',
  'moon_phases',
  'time_ranges',
  'move_learn_methods',
  'item_flag_types',
  'aspect_types',
  'ability_slots',
  'namespaces',
  'aspect_groups',
  'move_flag_types',
  'ability_flag_types',
  'egg_groups',
  'experience_groups',
  'conditions',
  'condition_types',
  'move_targets',
  'move_categories',
  'stats',
  'types',
];

async function main() {
  const logger = createLogger();

  logger.info('Clearing all seeded data...');
  logger.phase('Truncating Tables');

  try {
    const start = Date.now();

    for (const table of TABLES_TO_CLEAR) {
      const tableStart = Date.now();
      await sql`TRUNCATE TABLE ${sql.ref(table)} CASCADE`.execute(db);
      logger.table(table, 0, Date.now() - tableStart);
    }

    logger.success(`All ${TABLES_TO_CLEAR.length} tables cleared in ${Date.now() - start}ms`);
  } catch (error) {
    logger.error('Clear failed', error as Error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

main();
