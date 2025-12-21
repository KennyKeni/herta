import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('types')
		.addColumn('id', 'integer', (col) => col.primaryKey())
		.addColumn('slug', 'text', (col) => col.notNull().unique())
		.addColumn('name', 'text', (col) => col.notNull())
		.execute()

	await db.schema
		.createTable('stats')
		.addColumn('id', 'integer', (col) => col.primaryKey())
		.addColumn('name', 'text', (col) => col.notNull())
		.execute()

	await db.schema
		.createTable('move_categories')
		.addColumn('id', 'integer', (col) => col.primaryKey())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('description', 'text')
		.execute()

	await db.schema
		.createTable('move_targets')
		.addColumn('id', 'integer', (col) => col.primaryKey())
		.addColumn('slug', 'text', (col) => col.notNull().unique())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('description', 'text')
		.execute()

	await db.schema
		.createTable('conditions')
		.addColumn('id', 'integer', (col) => col.primaryKey())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('type', 'text', (col) => col.notNull())
		.addColumn('description', 'text')
		.execute()

	await db.schema
		.createTable('experience_groups')
		.addColumn('id', 'integer', (col) => col.primaryKey())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('formula', 'text', (col) => col.notNull())
		.execute()

	await db.schema
		.createTable('egg_groups')
		.addColumn('id', 'integer', (col) => col.primaryKey())
		.addColumn('name', 'text', (col) => col.notNull())
		.execute()

	await db.schema
		.createTable('ability_flag_types')
		.addColumn('id', 'integer', (col) => col.primaryKey())
		.addColumn('slug', 'text', (col) => col.notNull().unique())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('description', 'text')
		.execute()

	await db.schema
		.createTable('move_flag_types')
		.addColumn('id', 'integer', (col) => col.primaryKey())
		.addColumn('slug', 'text', (col) => col.notNull().unique())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('description', 'text')
		.execute()

	await db.schema
		.createTable('effect_types')
		.addColumn('id', 'integer', (col) => col.primaryKey())
		.addColumn('name', 'text', (col) => col.notNull())
		.execute()

	await db.schema
		.createTable('aspect_groups')
		.addColumn('id', 'integer', (col) => col.primaryKey())
		.addColumn('slug', 'text', (col) => col.notNull().unique())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('rule', 'text', (col) => col.notNull())
		.addColumn('description', 'text')
		.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('aspect_groups').execute()
	await db.schema.dropTable('effect_types').execute()
	await db.schema.dropTable('move_flag_types').execute()
	await db.schema.dropTable('ability_flag_types').execute()
	await db.schema.dropTable('egg_groups').execute()
	await db.schema.dropTable('experience_groups').execute()
	await db.schema.dropTable('conditions').execute()
	await db.schema.dropTable('move_targets').execute()
	await db.schema.dropTable('move_categories').execute()
	await db.schema.dropTable('stats').execute()
	await db.schema.dropTable('types').execute()
}
