import { Slug } from '../../../../common/utils/slug'
import type { Seeder } from '../utils'
import { batchInsert, loadJson } from '../utils'

interface FormJson {
	id: number
	speciesId: number
	slug: string
	name: string
	fullName: string
	generation: number | null
	height: number
	weight: number
	baseExperienceYield: number | null
	baseHp: number
	baseAttack: number
	baseDefence: number
	baseSpecialAttack: number
	baseSpecialDefence: number
	baseSpeed: number
	evHp: number | null
	evAttack: number | null
	evDefence: number | null
	evSpecialAttack: number | null
	evSpecialDefence: number | null
	evSpeed: number | null
	description: string | null
}

interface FormTypeJson {
	formId: number
	typeId: number
	slot: number
}

interface FormAbilityJson {
	formId: number
	abilityId: number
	slot: string
}

interface FormLabelJson {
	formId: number
	labelId: number
}

interface FormOverrideJson {
	formId: number
	catchRate: number | null
	baseFriendship: number | null
	eggCycles: number | null
	maleRatio: number | null
	baseScale: number | null
}

interface FormOverrideEggGroupJson {
	formId: number
	eggGroupId: number
}

interface FormHitboxJson {
	formId: number
	width: number
	height: number
	fixed: boolean
}

export const formsSeeder: Seeder = {
	name: 'Forms',
	tables: [
		'forms',
		'form_types',
		'form_abilities',
		'form_labels',
		'form_overrides',
		'form_hitboxes',
		'form_override_egg_groups',
	],

	async seed(db, logger) {
		let total = 0

		const formsData = await loadJson<FormJson[]>('forms.json')

		// forms
		{
			const start = Date.now()
			const rows = formsData.map((f) => ({
				id: f.id,
				species_id: f.speciesId,
				slug: Slug.forPokemon(f.fullName),
				name: f.name,
				full_name: f.fullName,
				generation: f.generation,
				height: f.height,
				weight: f.weight,
				base_experience_yield: f.baseExperienceYield,
				base_hp: f.baseHp,
				base_attack: f.baseAttack,
				base_defence: f.baseDefence,
				base_special_attack: f.baseSpecialAttack,
				base_special_defence: f.baseSpecialDefence,
				base_speed: f.baseSpeed,
				ev_hp: f.evHp,
				ev_attack: f.evAttack,
				ev_defence: f.evDefence,
				ev_special_attack: f.evSpecialAttack,
				ev_special_defence: f.evSpecialDefence,
				ev_speed: f.evSpeed,
				description: f.description,
			}))
			const count = await batchInsert(db, 'forms', rows)
			logger.table('forms', count, Date.now() - start)
			total += count
		}

		// form_types
		{
			const start = Date.now()
			const data = await loadJson<FormTypeJson[]>('form_types.json')
			const rows = data.map((t) => ({
				form_id: t.formId,
				type_id: t.typeId,
				slot: t.slot,
			}))
			const count = await batchInsert(db, 'form_types', rows)
			logger.table('form_types', count, Date.now() - start)
			total += count
		}

		// form_abilities
		{
			const start = Date.now()
			const data = await loadJson<FormAbilityJson[]>('form_abilities.json')
			const rows = data.map((a) => ({
				form_id: a.formId,
				ability_id: a.abilityId,
				slot: a.slot,
			}))
			const count = await batchInsert(db, 'form_abilities', rows)
			logger.table('form_abilities', count, Date.now() - start)
			total += count
		}

		// form_labels
		{
			const start = Date.now()
			const data = await loadJson<FormLabelJson[]>('form_labels.json')
			const rows = data.map((l) => ({
				form_id: l.formId,
				label_id: l.labelId,
			}))
			const count = await batchInsert(db, 'form_labels', rows)
			logger.table('form_labels', count, Date.now() - start)
			total += count
		}

		// form_overrides
		{
			const start = Date.now()
			const data = await loadJson<FormOverrideJson[]>('form_overrides.json')
			const rows = data.map((o) => ({
				form_id: o.formId,
				catch_rate: o.catchRate,
				base_friendship: o.baseFriendship,
				egg_cycles: o.eggCycles,
				male_ratio: o.maleRatio,
				base_scale: o.baseScale,
			}))
			const count = await batchInsert(db, 'form_overrides', rows)
			logger.table('form_overrides', count, Date.now() - start)
			total += count
		}

		// form_override_egg_groups
		{
			const start = Date.now()
			const data = await loadJson<FormOverrideEggGroupJson[]>('form_override_egg_groups.json')
			const rows = data.map((o) => ({
				form_id: o.formId,
				egg_group_id: o.eggGroupId,
			}))
			const count = await batchInsert(db, 'form_override_egg_groups', rows)
			logger.table('form_override_egg_groups', count, Date.now() - start)
			total += count
		}

		// form_hitboxes
		{
			const start = Date.now()
			const data = await loadJson<FormHitboxJson[]>('form_hitboxes.json')
			const rows = data.map((h) => ({
				form_id: h.formId,
				width: h.width,
				height: h.height,
				fixed: h.fixed,
			}))
			const count = await batchInsert(db, 'form_hitboxes', rows)
			logger.table('form_hitboxes', count, Date.now() - start)
			total += count
		}

		return total
	},
}
