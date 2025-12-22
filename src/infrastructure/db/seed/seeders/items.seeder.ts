import { Slug } from '../../../../common/utils/slug'
import type { Seeder } from '../utils'
import { batchInsert, loadJson } from '../utils'

interface ItemJson {
	id: string
	name: string
	num: number | null
	gen: number | null
	desc: string
	short_desc: string
	fling_power?: number
	fling_effect?: string | null
	natural_gift_type?: string
	natural_gift_power?: number
	source: string
	implemented: boolean
}

interface ItemBoostJson {
	itemId: string
	statId: number
	stages: number
}

interface ItemFlagJson {
	item_id: string
	flag: string
}

interface ItemTagJson {
	item_id: string
	tag: string
	namespace: string
}

interface TagHierarchyJson {
	tag: string
	references: string
}

export const itemsSeeder: Seeder = {
	name: 'Items',
	tables: ['items', 'item_boosts', 'item_flags', 'item_tags', 'tag_hierarchy'],

	async seed(db, logger) {
		let total = 0

		// Build type name -> id map
		const typeMap = new Map<string, number>()
		const types = await db.selectFrom('types').select(['id', 'name']).execute()
		for (const t of types) {
			typeMap.set(t.name.toLowerCase(), t.id)
		}

		// items
		{
			const start = Date.now()
			const data = await loadJson<ItemJson[]>('items.json')
			const rows = data.map((i) => ({
				id: i.id,
				name: i.name,
				gen: i.gen,
				desc: i.desc || null,
				short_desc: i.short_desc || null,
				fling_power: i.fling_power ?? null,
				fling_effect: i.fling_effect ?? null,
				natural_gift_type_id: i.natural_gift_type
					? typeMap.get(i.natural_gift_type.toLowerCase()) ?? null
					: null,
				natural_gift_power: i.natural_gift_power ?? null,
				source: i.source,
				implemented: i.implemented,
			}))
			const count = await batchInsert(db, 'items', rows)
			logger.table('items', count, Date.now() - start)
			total += count
		}

		// item_boosts
		{
			const start = Date.now()
			const data = await loadJson<ItemBoostJson[]>('item_boosts.json')
			const rows = data.map((b) => ({
				item_id: b.itemId,
				stat_id: b.statId,
				stages: b.stages,
			}))
			const count = await batchInsert(db, 'item_boosts', rows)
			logger.table('item_boosts', count, Date.now() - start)
			total += count
		}

		// item_flags
		{
			const start = Date.now()
			const data = await loadJson<ItemFlagJson[]>('item_flags.json')
			const rows = data.map((f) => ({
				item_id: f.item_id,
				flag: f.flag,
			}))
			const count = await batchInsert(db, 'item_flags', rows)
			logger.table('item_flags', count, Date.now() - start)
			total += count
		}

		// item_tags
		{
			const start = Date.now()
			const data = await loadJson<ItemTagJson[]>('item_tags.json')
			const rows = data.map((t) => ({
				item_id: t.item_id,
				tag: t.tag,
				namespace: t.namespace,
			}))
			const count = await batchInsert(db, 'item_tags', rows)
			logger.table('item_tags', count, Date.now() - start)
			total += count
		}

		// tag_hierarchy
		{
			const start = Date.now()
			const data = await loadJson<TagHierarchyJson[]>('tag_hierarchy.json')
			const rows = data.map((h) => ({
				parent_tag: h.tag,
				child_tag: h.references,
			}))
			const count = await batchInsert(db, 'tag_hierarchy', rows)
			logger.table('tag_hierarchy', count, Date.now() - start)
			total += count
		}

		return total
	},
}
