import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createType('image_status').asEnum(['pending', 'uploaded']).execute();

  await db.schema
    .createTable('article_images')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('article_id', 'integer', (col) =>
      col.notNull().references('articles.id').onDelete('cascade')
    )
    .addColumn('key', 'text', (col) => col.notNull().unique())
    .addColumn('status', sql`image_status`, (col) => col.notNull().defaultTo('pending'))
    .addColumn('content_type', 'text', (col) => col.notNull())
    .addColumn('is_cover', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('confirmed_at', 'timestamptz')
    .execute();

  await db.schema
    .createIndex('article_images_article_id_idx')
    .on('article_images')
    .column('article_id')
    .execute();

  await db.schema
    .createIndex('article_images_status_idx')
    .on('article_images')
    .column('status')
    .where('status', '=', 'pending')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('article_images').execute();
  await db.schema.dropType('image_status').execute();
}
