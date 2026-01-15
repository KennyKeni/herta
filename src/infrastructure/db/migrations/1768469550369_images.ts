import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createType('image_status')
    .asEnum(['pending_upload', 'pending_published', 'published', 'deleted'])
    .execute();

  await db.schema
    .createTable('images')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('s3_key', 'text', (col) => col.notNull().unique())
    .addColumn('status', sql`image_status`, (col) => col.notNull().defaultTo('pending_upload'))
    .addColumn('mime_type', 'text')
    .addColumn('width', 'integer')
    .addColumn('height', 'integer')
    .addColumn('file_size', 'bigint')
    .addColumn('uploaded_by', 'text', (col) => col.references('user.id').onDelete('set null'))
    .addColumn('uploaded_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex('images_status_pending_idx')
    .on('images')
    .column('status')
    .where('status', '=', 'pending_upload')
    .execute();

  await db.schema
    .createIndex('images_uploaded_by_idx')
    .on('images')
    .column('uploaded_by')
    .execute();

  await db.schema
    .createTable('article_images')
    .addColumn('article_id', 'integer', (col) =>
      col.notNull().references('articles.id').onDelete('cascade')
    )
    .addColumn('image_id', 'uuid', (col) =>
      col.notNull().references('images.id').onDelete('cascade')
    )
    .addColumn('is_cover', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('sort_order', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addPrimaryKeyConstraint('article_images_pk', ['article_id', 'image_id'])
    .execute();

  await db.schema
    .createIndex('article_images_article_id_idx')
    .on('article_images')
    .column('article_id')
    .execute();

  await db.schema
    .createIndex('article_images_image_id_idx')
    .on('article_images')
    .column('image_id')
    .execute();

  await db.schema
    .createTable('species_images')
    .addColumn('species_id', 'integer', (col) =>
      col.notNull().references('species.id').onDelete('cascade')
    )
    .addColumn('image_id', 'uuid', (col) =>
      col.notNull().references('images.id').onDelete('cascade')
    )
    .addColumn('is_primary', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('sort_order', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addPrimaryKeyConstraint('species_images_pk', ['species_id', 'image_id'])
    .execute();

  await db.schema
    .createIndex('species_images_species_id_idx')
    .on('species_images')
    .column('species_id')
    .execute();

  await db.schema
    .createIndex('species_images_image_id_idx')
    .on('species_images')
    .column('image_id')
    .execute();

  await db.schema
    .createTable('form_images')
    .addColumn('form_id', 'integer', (col) =>
      col.notNull().references('forms.id').onDelete('cascade')
    )
    .addColumn('image_id', 'uuid', (col) =>
      col.notNull().references('images.id').onDelete('cascade')
    )
    .addColumn('is_primary', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('sort_order', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('created_at', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addPrimaryKeyConstraint('form_images_pk', ['form_id', 'image_id'])
    .execute();

  await db.schema
    .createIndex('form_images_form_id_idx')
    .on('form_images')
    .column('form_id')
    .execute();

  await db.schema
    .createIndex('form_images_image_id_idx')
    .on('form_images')
    .column('image_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('form_images').execute();
  await db.schema.dropTable('species_images').execute();
  await db.schema.dropTable('article_images').execute();
  await db.schema.dropTable('images').execute();
  await db.schema.dropType('image_status').execute();
}
