import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('abilities')
		.addColumn('id', 'integer', (col) => col.primaryKey())
		.addColumn('slug', 'text', (col) => col.notNull().unique())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('desc', 'text')
		.addColumn('short_desc', 'text')
		.execute()

	await db.schema
		.createTable('ability_flags')
		.addColumn('ability_id', 'integer', (col) => col.notNull().references('abilities.id'))
		.addColumn('flag_id', 'integer', (col) => col.notNull().references('ability_flag_types.id'))
		.addPrimaryKeyConstraint('ability_flags_pk', ['ability_id', 'flag_id'])
		.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('ability_flags').execute()
	await db.schema.dropTable('abilities').execute()
}
