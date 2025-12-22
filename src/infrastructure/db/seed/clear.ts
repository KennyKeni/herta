import { sql } from 'kysely'
import { db } from '../index'
import { createLogger } from './logger'

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
	'form_tags',
	'form_moves',
	// Recipes (depends on items)
	'recipe_inputs',
	'recipe_slot_types',
	'recipes',
	// Cobblemon Specific (depends on species, items)
	'drop_items',
	'species_riding',
	'species_lighting',
	// Game Mechanics (depends on types)
	'hidden_power_ivs',
	'type_matchups',
	// Aspects (depends on forms, aspect_groups)
	'form_aspects',
	'aspect_groups_map',
	'aspect_choices',
	'aspects',
	// Items (depends on types, stats)
	'tag_hierarchy',
	'item_tags',
	'item_flags',
	'item_boosts',
	'items',
	// Moves (depends on types, categories, targets, species)
	'gmax_moves',
	'move_max_power',
	'move_z_data',
	'move_effects',
	'move_boosts',
	'move_flags',
	'moves',
	// Forms (depends on species, abilities)
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
	// Base Reference Tables (no dependencies)
	'labels',
	'aspect_groups',
	'effect_types',
	'move_flag_types',
	'ability_flag_types',
	'egg_groups',
	'experience_groups',
	'conditions',
	'move_targets',
	'move_categories',
	'stats',
	'types',
]

async function main() {
	const logger = createLogger()

	logger.info('Clearing all seeded data...')
	logger.phase('Truncating Tables')

	try {
		const start = Date.now()

		for (const table of TABLES_TO_CLEAR) {
			const tableStart = Date.now()
			await sql`TRUNCATE TABLE ${sql.ref(table)} CASCADE`.execute(db)
			logger.table(table, 0, Date.now() - tableStart)
		}

		logger.success(`All ${TABLES_TO_CLEAR.length} tables cleared in ${Date.now() - start}ms`)
	} catch (error) {
		logger.error('Clear failed', error as Error)
		process.exit(1)
	} finally {
		await db.destroy()
	}
}

main()
