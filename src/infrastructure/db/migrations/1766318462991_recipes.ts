import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('recipes')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('type', 'text', (col) => col.notNull())
		.addColumn('result_id', 'text', (col) => col.notNull())
		.addColumn('result_count', 'integer', (col) => col.notNull().defaultTo(1))
		.execute()

	await db.schema
		.createTable('recipe_inputs')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('recipe_id', 'text', (col) => col.notNull().references('recipes.id'))
		.addColumn('slot', 'integer', (col) => col.notNull())
		.addColumn('input_type', 'text', (col) => col.notNull())
		.addColumn('input_namespace', 'text', (col) => col.notNull())
		.addColumn('input_value', 'text', (col) => col.notNull())
		.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('recipe_inputs').execute()
	await db.schema.dropTable('recipes').execute()
}
