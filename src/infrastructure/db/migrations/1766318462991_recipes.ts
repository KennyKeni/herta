import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('recipes')
		.addColumn('id', 'text', (col) => col.primaryKey())
		.addColumn('type', 'text', (col) => col.notNull())
		.addColumn('result_id', 'text', (col) => col.notNull())
		.addColumn('result_count', 'integer', (col) => col.notNull().defaultTo(1))
		.execute()

	await db.schema
		.createTable('recipe_slot_types')
		.addColumn('id', 'integer', (col) => col.primaryKey())
		.addColumn('name', 'text', (col) => col.notNull().unique())
		.addColumn('description', 'text')
		.execute()

	await db.schema
		.createTable('recipe_inputs')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('recipe_id', 'text', (col) => col.notNull().references('recipes.id'))
		.addColumn('slot', 'integer')
		.addColumn('slot_type_id', 'integer', (col) => col.references('recipe_slot_types.id'))
		.addColumn('input_type', 'text', (col) => col.notNull())
		.addColumn('input_namespace', 'text', (col) => col.notNull())
		.addColumn('input_value', 'text', (col) => col.notNull())
		.execute()

	await sql`ALTER TABLE recipe_inputs ADD CONSTRAINT recipe_inputs_slot_check CHECK (slot IS NOT NULL OR slot_type_id IS NOT NULL)`.execute(
		db
	)
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('recipe_inputs').execute()
	await db.schema.dropTable('recipe_slot_types').execute()
	await db.schema.dropTable('recipes').execute()
}
