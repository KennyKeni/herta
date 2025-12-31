import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('aspects')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('type_id', 'integer', (col) => col.notNull().references('aspect_types.id'))
    .addColumn('aspect_format', 'text')
    .execute();

  await db.schema
    .createTable('aspect_choices')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('aspect_id', 'integer', (col) => col.notNull().references('aspects.id'))
    .addColumn('value', 'text', (col) => col.notNull())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('aspect_string', 'text')
    .execute();

  await db.schema
    .createTable('aspect_groups_map')
    .addColumn('aspect_id', 'integer', (col) => col.notNull().references('aspects.id'))
    .addColumn('aspect_group_id', 'integer', (col) => col.notNull().references('aspect_groups.id'))
    .addPrimaryKeyConstraint('aspect_groups_map_pk', ['aspect_id', 'aspect_group_id'])
    .execute();

  await db.schema
    .createTable('form_aspects')
    .addColumn('form_id', 'integer', (col) => col.notNull().references('forms.id'))
    .addColumn('aspect_choice_id', 'integer', (col) =>
      col.notNull().references('aspect_choices.id')
    )
    .addPrimaryKeyConstraint('form_aspects_pk', ['form_id', 'aspect_choice_id'])
    .execute();

  await db.schema
    .createIndex('idx_aspect_choices_aspect_id')
    .on('aspect_choices')
    .column('aspect_id')
    .execute();
  await db.schema.createIndex('idx_aspects_slug').on('aspects').column('slug').execute();

  await sql`CREATE INDEX idx_aspects_name_trgm ON aspects USING gin (name gin_trgm_ops)`.execute(
    db
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX IF EXISTS idx_aspects_name_trgm`.execute(db);
  await db.schema.dropTable('form_aspects').execute();
  await db.schema.dropTable('aspect_groups_map').execute();
  await db.schema.dropTable('aspect_choices').execute();
  await db.schema.dropTable('aspects').execute();
}
