import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('aspects')
		.addColumn('id', 'integer', (col) => col.primaryKey())
		.addColumn('slug', 'text', (col) => col.notNull().unique())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('type', 'text', (col) => col.notNull())
		.addColumn('is_cosmetic', 'boolean', (col) => col.notNull())
		.execute()

	await db.schema
		.createTable('aspect_choices')
		.addColumn('id', 'integer', (col) => col.primaryKey())
		.addColumn('aspect_id', 'integer', (col) => col.notNull().references('aspects.id'))
		.addColumn('slug', 'text', (col) => col.notNull())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('aspect_string', 'text', (col) => col.notNull())
		.execute()

	await db.schema
		.createTable('aspect_groups_map')
		.addColumn('aspect_id', 'integer', (col) => col.notNull().references('aspects.id'))
		.addColumn('aspect_group_id', 'integer', (col) => col.notNull().references('aspect_groups.id'))
		.addPrimaryKeyConstraint('aspect_groups_map_pk', ['aspect_id', 'aspect_group_id'])
		.execute()

	await db.schema
		.createTable('form_aspects')
		.addColumn('form_id', 'integer', (col) => col.notNull().references('forms.id'))
		.addColumn('aspect_choice_id', 'integer', (col) => col.notNull().references('aspect_choices.id'))
		.addPrimaryKeyConstraint('form_aspects_pk', ['form_id', 'aspect_choice_id'])
		.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('form_aspects').execute()
	await db.schema.dropTable('aspect_groups_map').execute()
	await db.schema.dropTable('aspect_choices').execute()
	await db.schema.dropTable('aspects').execute()
}
