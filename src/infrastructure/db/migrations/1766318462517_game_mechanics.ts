import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('type_matchups')
    .addColumn('attacking_type_id', 'integer', (col) => col.notNull().references('types.id'))
    .addColumn('defending_type_id', 'integer', (col) => col.notNull().references('types.id'))
    .addColumn('multiplier', 'real', (col) => col.notNull())
    .addPrimaryKeyConstraint('type_matchups_pk', ['attacking_type_id', 'defending_type_id'])
    .execute();

  await db.schema
    .createTable('hidden_power_ivs')
    .addColumn('type_id', 'integer', (col) => col.primaryKey().references('types.id'))
    .addColumn('hp', 'integer', (col) => col.notNull())
    .addColumn('atk', 'integer', (col) => col.notNull())
    .addColumn('def', 'integer', (col) => col.notNull())
    .addColumn('spa', 'integer', (col) => col.notNull())
    .addColumn('spd', 'integer', (col) => col.notNull())
    .addColumn('spe', 'integer', (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex('idx_type_matchups_defending_type_id')
    .on('type_matchups')
    .column('defending_type_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('hidden_power_ivs').execute();
  await db.schema.dropTable('type_matchups').execute();
}
