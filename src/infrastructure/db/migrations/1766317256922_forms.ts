import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('forms')
		.addColumn('id', 'integer', (col) => col.primaryKey())
		.addColumn('species_id', 'integer', (col) => col.notNull().references('species.id'))
		.addColumn('slug', 'text', (col) => col.notNull().unique())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('full_name', 'text', (col) => col.notNull())
		.addColumn('generation', 'integer')
		.addColumn('height', 'integer', (col) => col.notNull())
		.addColumn('weight', 'integer', (col) => col.notNull())
		.addColumn('base_experience_yield', 'integer')
		.addColumn('base_hp', 'integer', (col) => col.notNull())
		.addColumn('base_attack', 'integer', (col) => col.notNull())
		.addColumn('base_defence', 'integer', (col) => col.notNull())
		.addColumn('base_special_attack', 'integer', (col) => col.notNull())
		.addColumn('base_special_defence', 'integer', (col) => col.notNull())
		.addColumn('base_speed', 'integer', (col) => col.notNull())
		.addColumn('ev_hp', 'integer')
		.addColumn('ev_attack', 'integer')
		.addColumn('ev_defence', 'integer')
		.addColumn('ev_special_attack', 'integer')
		.addColumn('ev_special_defence', 'integer')
		.addColumn('ev_speed', 'integer')
		.addColumn('description', 'text')
		.execute()

	await db.schema
		.createTable('labels')
		.addColumn('id', 'integer', (col) => col.primaryKey())
		.addColumn('slug', 'text', (col) => col.notNull().unique())
		.addColumn('name', 'text', (col) => col.notNull())
		.execute()

	await db.schema
		.createTable('form_labels')
		.addColumn('form_id', 'integer', (col) => col.notNull().references('forms.id'))
		.addColumn('label_id', 'integer', (col) => col.notNull().references('labels.id'))
		.addPrimaryKeyConstraint('form_labels_pk', ['form_id', 'label_id'])
		.execute()

	await db.schema
		.createTable('form_types')
		.addColumn('form_id', 'integer', (col) => col.notNull().references('forms.id'))
		.addColumn('type_id', 'integer', (col) => col.notNull().references('types.id'))
		.addColumn('slot', 'integer', (col) => col.notNull())
		.addPrimaryKeyConstraint('form_types_pk', ['form_id', 'slot'])
		.execute()

	await db.schema
		.createTable('form_abilities')
		.addColumn('form_id', 'integer', (col) => col.notNull().references('forms.id'))
		.addColumn('ability_id', 'integer', (col) => col.notNull().references('abilities.id'))
		.addColumn('slot', 'text', (col) => col.notNull())
		.addPrimaryKeyConstraint('form_abilities_pk', ['form_id', 'slot'])
		.execute()

	await db.schema
		.createTable('form_overrides')
		.addColumn('form_id', 'integer', (col) => col.primaryKey().references('forms.id'))
		.addColumn('catch_rate', 'integer')
		.addColumn('base_friendship', 'integer')
		.addColumn('egg_cycles', 'integer')
		.addColumn('male_ratio', 'real')
		.addColumn('base_scale', 'real')
		.execute()

	await db.schema
		.createTable('form_hitboxes')
		.addColumn('form_id', 'integer', (col) => col.primaryKey().references('forms.id'))
		.addColumn('width', 'real', (col) => col.notNull())
		.addColumn('height', 'real', (col) => col.notNull())
		.addColumn('fixed', 'boolean', (col) => col.notNull().defaultTo(false))
		.execute()

	await db.schema
		.createTable('form_override_egg_groups')
		.addColumn('form_id', 'integer', (col) => col.notNull().references('forms.id'))
		.addColumn('egg_group_id', 'integer', (col) => col.notNull().references('egg_groups.id'))
		.addPrimaryKeyConstraint('form_override_egg_groups_pk', ['form_id', 'egg_group_id'])
		.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('form_override_egg_groups').execute()
	await db.schema.dropTable('form_hitboxes').execute()
	await db.schema.dropTable('form_overrides').execute()
	await db.schema.dropTable('form_abilities').execute()
	await db.schema.dropTable('form_types').execute()
	await db.schema.dropTable('form_labels').execute()
	await db.schema.dropTable('labels').execute()
	await db.schema.dropTable('forms').execute()
}
