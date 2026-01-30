import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('forms')
    .addColumn('image_id', 'uuid', (col) => col.references('images.id').onDelete('set null'))
    .execute();

  await db.schema
    .alterTable('species')
    .addColumn('image_id', 'uuid', (col) => col.references('images.id').onDelete('set null'))
    .execute();

  await sql`
    UPDATE forms
    SET image_id = fi.image_id
    FROM (
      SELECT DISTINCT ON (form_id) form_id, image_id
      FROM form_images
      ORDER BY form_id, is_primary DESC, sort_order ASC
    ) fi
    WHERE fi.form_id = forms.id
  `.execute(db);

  await sql`
    UPDATE species
    SET image_id = si.image_id
    FROM (
      SELECT DISTINCT ON (species_id) species_id, image_id
      FROM species_images
      ORDER BY species_id, is_primary DESC, sort_order ASC
    ) si
    WHERE si.species_id = species.id
  `.execute(db);

  await db.schema.dropTable('form_images').execute();
  await db.schema.dropTable('species_images').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
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

  await sql`
    INSERT INTO species_images (species_id, image_id, is_primary, sort_order)
    SELECT id, image_id, true, 0
    FROM species
    WHERE image_id IS NOT NULL
  `.execute(db);

  await sql`
    INSERT INTO form_images (form_id, image_id, is_primary, sort_order)
    SELECT id, image_id, true, 0
    FROM forms
    WHERE image_id IS NOT NULL
  `.execute(db);

  await db.schema.alterTable('forms').dropColumn('image_id').execute();
  await db.schema.alterTable('species').dropColumn('image_id').execute();
}
