import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('natures')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('plus_stat_id', 'integer', (col) => col.references('stats.id'))
    .addColumn('minus_stat_id', 'integer', (col) => col.references('stats.id'))
    .execute();

  await db.schema.createIndex('idx_natures_slug').on('natures').column('slug').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('natures').execute();
}
