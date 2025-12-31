import type { Kysely } from 'kysely';
import { sql } from 'kysely';

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

  await sql`CREATE INDEX idx_natures_name_trgm ON natures USING gin (name gin_trgm_ops)`.execute(
    db
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX IF EXISTS idx_natures_name_trgm`.execute(db);
  await db.schema.dropTable('natures').execute();
}
