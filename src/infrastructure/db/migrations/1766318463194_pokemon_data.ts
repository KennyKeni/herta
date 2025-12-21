import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('pokemon_moves')
		.addColumn('form_id', 'integer', (col) => col.notNull().references('forms.id'))
		.addColumn('move_id', 'integer', (col) => col.notNull().references('moves.id'))
		.addColumn('method', 'text', (col) => col.notNull())
		.addColumn('level', 'integer')
		.addPrimaryKeyConstraint('pokemon_moves_pk', ['form_id', 'move_id', 'method'])
		.execute()

	await db.schema
		.createTable('pokemon_tags')
		.addColumn('form_id', 'integer', (col) => col.notNull().references('forms.id'))
		.addColumn('tag', 'text', (col) => col.notNull())
		.addPrimaryKeyConstraint('pokemon_tags_pk', ['form_id', 'tag'])
		.execute()

	await db.schema
		.createTable('behaviour')
		.addColumn('form_id', 'integer', (col) => col.primaryKey().references('forms.id'))
		.addColumn('data', 'jsonb', (col) => col.notNull())
		.execute()

	await db.schema
		.createTable('form_drops')
		.addColumn('form_id', 'integer', (col) => col.primaryKey().references('forms.id'))
		.addColumn('amount', 'integer', (col) => col.notNull())
		.execute()

	await db.schema
		.createTable('drop_ranges')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('form_id', 'integer', (col) => col.notNull().references('forms.id'))
		.addColumn('item_id', 'text', (col) => col.notNull().references('items.id'))
		.addColumn('quantity_min', 'integer', (col) => col.notNull())
		.addColumn('quantity_max', 'integer', (col) => col.notNull())
		.execute()

	await db.schema
		.createTable('drop_percentages')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('form_id', 'integer', (col) => col.notNull().references('forms.id'))
		.addColumn('item_id', 'text', (col) => col.notNull().references('items.id'))
		.addColumn('percentage', 'real', (col) => col.notNull())
		.execute()

	await db.schema
		.createTable('form_variant_combos')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('form_id', 'integer', (col) => col.notNull().references('forms.id'))
		.addColumn('combo_index', 'integer', (col) => col.notNull())
		.addUniqueConstraint('form_variant_combos_form_combo_idx', ['form_id', 'combo_index'])
		.execute()

	await db.schema
		.createTable('form_variant_combo_aspects')
		.addColumn('combo_id', 'integer', (col) => col.notNull().references('form_variant_combos.id'))
		.addColumn('aspect_id', 'integer', (col) => col.notNull().references('aspects.id'))
		.addPrimaryKeyConstraint('form_variant_combo_aspects_pk', ['combo_id', 'aspect_id'])
		.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('form_variant_combo_aspects').execute()
	await db.schema.dropTable('form_variant_combos').execute()
	await db.schema.dropTable('drop_percentages').execute()
	await db.schema.dropTable('drop_ranges').execute()
	await db.schema.dropTable('form_drops').execute()
	await db.schema.dropTable('behaviour').execute()
	await db.schema.dropTable('pokemon_tags').execute()
	await db.schema.dropTable('pokemon_moves').execute()
}
