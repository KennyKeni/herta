import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('species')
		.addColumn('id', 'integer', (col) => col.primaryKey())
		.addColumn('slug', 'text', (col) => col.notNull().unique())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('generation', 'integer', (col) => col.notNull())
		.addColumn('catch_rate', 'integer', (col) => col.notNull())
		.addColumn('base_friendship', 'integer', (col) => col.notNull())
		.addColumn('experience_group_id', 'integer', (col) => col.references('experience_groups.id'))
		.addColumn('egg_cycles', 'integer', (col) => col.notNull())
		.addColumn('male_ratio', 'real')
		.addColumn('base_scale', 'real')
		.addColumn('description', 'text')
		.execute()

	await db.schema
		.createTable('species_hitboxes')
		.addColumn('species_id', 'integer', (col) => col.primaryKey().references('species.id'))
		.addColumn('width', 'real', (col) => col.notNull())
		.addColumn('height', 'real', (col) => col.notNull())
		.addColumn('fixed', 'boolean', (col) => col.notNull().defaultTo(false))
		.execute()

	await db.schema
		.createTable('species_egg_groups')
		.addColumn('species_id', 'integer', (col) => col.notNull().references('species.id'))
		.addColumn('egg_group_id', 'integer', (col) => col.notNull().references('egg_groups.id'))
		.addPrimaryKeyConstraint('species_egg_groups_pk', ['species_id', 'egg_group_id'])
		.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('species_egg_groups').execute()
	await db.schema.dropTable('species_hitboxes').execute()
	await db.schema.dropTable('species').execute()
}
