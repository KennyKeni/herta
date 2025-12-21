import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('items')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('gen', 'integer')
		.addColumn('desc', 'text')
		.addColumn('short_desc', 'text')
		.addColumn('fling_power', 'integer')
		.addColumn('fling_effect', 'text')
		.addColumn('natural_gift_type_id', 'integer', (col) => col.references('types.id'))
		.addColumn('natural_gift_power', 'integer')
		.addColumn('source', 'text', (col) => col.notNull())
		.addColumn('implemented', 'boolean', (col) => col.notNull().defaultTo(true))
		.execute()

	await db.schema
		.createTable('item_boosts')
		.addColumn('item_id', 'text', (col) => col.notNull().references('items.id'))
		.addColumn('stat_id', 'integer', (col) => col.notNull().references('stats.id'))
		.addColumn('stages', 'integer', (col) => col.notNull())
		.addPrimaryKeyConstraint('item_boosts_pk', ['item_id', 'stat_id'])
		.execute()

	await db.schema
		.createTable('item_flags')
		.addColumn('item_id', 'text', (col) => col.notNull().references('items.id'))
		.addColumn('flag', 'text', (col) => col.notNull())
		.addPrimaryKeyConstraint('item_flags_pk', ['item_id', 'flag'])
		.execute()

	await db.schema
		.createTable('item_tags')
		.addColumn('item_id', 'text', (col) => col.notNull())
		.addColumn('tag', 'text', (col) => col.notNull())
		.addColumn('namespace', 'text', (col) => col.notNull())
		.addPrimaryKeyConstraint('item_tags_pk', ['item_id', 'tag', 'namespace'])
		.execute()

	await db.schema
		.createTable('tag_hierarchy')
		.addColumn('parent_tag', 'text', (col) => col.notNull())
		.addColumn('child_tag', 'text', (col) => col.notNull())
		.addPrimaryKeyConstraint('tag_hierarchy_pk', ['parent_tag', 'child_tag'])
		.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('tag_hierarchy').execute()
	await db.schema.dropTable('item_tags').execute()
	await db.schema.dropTable('item_flags').execute()
	await db.schema.dropTable('item_boosts').execute()
	await db.schema.dropTable('items').execute()
}
