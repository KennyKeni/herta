import { Slug } from '../../../../common/utils/slug'
import type { Seeder } from '../utils'
import { batchInsert, loadJson } from '../utils'

interface TypeJson {
	id: number
	slug: string
	name: string
}

interface StatJson {
	id: number
	name: string
}

interface MoveCategoryJson {
	id: string
	name: string
	description: string
	num: number
}

interface MoveTargetJson {
	id: number
	slug: string
	name: string
	description: string
}

interface ConditionJson {
	id: number
	name: string
	type: string
	description: string
}

interface ExperienceGroupJson {
	id: number
	name: string
	formula: string
}

interface FlagTypeJson {
	id: number
	slug: string
	name: string
	description: string
}

interface EffectTypeJson {
	id: number
	name: string
}

interface AspectGroupJson {
	id: number
	slug: string
	name: string
	rule: string
	description: string
}

interface LabelJson {
	id: number
	slug: string
	name: string
}

interface EggGroupJson {
	id: number
	name: string
}

export const baseReferenceSeeder: Seeder = {
	name: 'Base Reference Tables',
	tables: [
		'types',
		'stats',
		'move_categories',
		'move_targets',
		'conditions',
		'experience_groups',
		'egg_groups',
		'ability_flag_types',
		'move_flag_types',
		'effect_types',
		'aspect_groups',
		'labels',
	],

	async seed(db, logger) {
		let total = 0

		// types
		{
			const start = Date.now()
			const data = await loadJson<TypeJson[]>('types.json')
			const rows = data.map((t) => ({
				id: t.id,
				slug: Slug.forPokemon(t.name),
				name: t.name,
			}))
			const count = await batchInsert(db, 'types', rows)
			logger.table('types', count, Date.now() - start)
			total += count
		}

		// stats
		{
			const start = Date.now()
			const data = await loadJson<StatJson[]>('stats.json')
			const rows = data.map((s) => ({
				id: s.id,
				name: s.name,
			}))
			const count = await batchInsert(db, 'stats', rows)
			logger.table('stats', count, Date.now() - start)
			total += count
		}

		// move_categories
		{
			const start = Date.now()
			const data = await loadJson<MoveCategoryJson[]>('move_categories.json')
			const rows = data.map((c) => ({
				id: c.num,
				name: c.name,
				description: c.description,
			}))
			const count = await batchInsert(db, 'move_categories', rows)
			logger.table('move_categories', count, Date.now() - start)
			total += count
		}

		// move_targets
		{
			const start = Date.now()
			const data = await loadJson<MoveTargetJson[]>('move_targets.json')
			const rows = data.map((t) => ({
				id: t.id,
				slug: Slug.forPokemon(t.name),
				name: t.name,
				description: t.description,
			}))
			const count = await batchInsert(db, 'move_targets', rows)
			logger.table('move_targets', count, Date.now() - start)
			total += count
		}

		// conditions
		{
			const start = Date.now()
			const data = await loadJson<ConditionJson[]>('conditions.json')
			const rows = data.map((c) => ({
				id: c.id,
				name: c.name,
				type: c.type,
				description: c.description || null,
			}))
			const count = await batchInsert(db, 'conditions', rows)
			logger.table('conditions', count, Date.now() - start)
			total += count
		}

		// experience_groups
		{
			const start = Date.now()
			const data = await loadJson<ExperienceGroupJson[]>('experience_groups.json')
			const rows = data.map((e) => ({
				id: e.id,
				name: e.name,
				formula: e.formula,
			}))
			const count = await batchInsert(db, 'experience_groups', rows)
			logger.table('experience_groups', count, Date.now() - start)
			total += count
		}

		// egg_groups
		{
			const start = Date.now()
			const data = await loadJson<EggGroupJson[]>('egg_groups.json')
			const rows = data.map((e) => ({
				id: e.id,
				name: e.name,
			}))
			const count = await batchInsert(db, 'egg_groups', rows)
			logger.table('egg_groups', count, Date.now() - start)
			total += count
		}

		// ability_flag_types
		{
			const start = Date.now()
			const data = await loadJson<FlagTypeJson[]>('ability_flag_types.json')
			const rows = data.map((f) => ({
				id: f.id,
				slug: Slug.forPokemon(f.name),
				name: f.name,
				description: f.description || null,
			}))
			const count = await batchInsert(db, 'ability_flag_types', rows)
			logger.table('ability_flag_types', count, Date.now() - start)
			total += count
		}

		// move_flag_types
		{
			const start = Date.now()
			const data = await loadJson<FlagTypeJson[]>('move_flag_types.json')
			const rows = data.map((f) => ({
				id: f.id,
				slug: Slug.forPokemon(f.name),
				name: f.name,
				description: f.description || null,
			}))
			const count = await batchInsert(db, 'move_flag_types', rows)
			logger.table('move_flag_types', count, Date.now() - start)
			total += count
		}

		// effect_types
		{
			const start = Date.now()
			const data = await loadJson<EffectTypeJson[]>('effect_types.json')
			const rows = data.map((e) => ({
				id: e.id,
				name: e.name,
			}))
			const count = await batchInsert(db, 'effect_types', rows)
			logger.table('effect_types', count, Date.now() - start)
			total += count
		}

		// aspect_groups
		{
			const start = Date.now()
			const data = await loadJson<AspectGroupJson[]>('aspect_groups.json')
			const rows = data.map((g) => ({
				id: g.id,
				slug: Slug.forPokemon(g.name),
				name: g.name,
				rule: g.rule,
				description: g.description || null,
			}))
			const count = await batchInsert(db, 'aspect_groups', rows)
			logger.table('aspect_groups', count, Date.now() - start)
			total += count
		}

		// labels
		{
			const start = Date.now()
			const data = await loadJson<LabelJson[]>('labels.json')
			const rows = data.map((l) => ({
				id: l.id,
				slug: Slug.forPokemon(l.name),
				name: l.name,
			}))
			const count = await batchInsert(db, 'labels', rows)
			logger.table('labels', count, Date.now() - start)
			total += count
		}

		return total
	},
}
