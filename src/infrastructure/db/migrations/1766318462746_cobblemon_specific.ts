import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('species_lighting')
		.addColumn('species_id', 'integer', (col) => col.primaryKey().references('species.id'))
		.addColumn('light_level', 'integer', (col) => col.notNull())
		.addColumn('liquid_glow_mode', 'text')
		.execute()

	await db.schema
		.createTable('species_riding')
		.addColumn('species_id', 'integer', (col) => col.primaryKey().references('species.id'))
		.addColumn('data', 'jsonb', (col) => col.notNull())
		.execute()

	await db.schema
		.createTable('drop_items')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('source', 'text', (col) => col.notNull())
		.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('drop_items').execute()
	await db.schema.dropTable('species_riding').execute()
	await db.schema.dropTable('species_lighting').execute()
}
