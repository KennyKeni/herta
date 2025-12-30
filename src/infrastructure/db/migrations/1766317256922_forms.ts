import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('forms')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('species_id', 'integer', (col) => col.notNull().references('species.id'))
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('form_name', 'text', (col) => col.notNull())
    .addColumn('name', 'text', (col) => col.notNull())
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
    .addColumn('ev_hp', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('ev_attack', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('ev_defence', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('ev_special_attack', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('ev_special_defence', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('ev_speed', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('description', 'text')
    .execute();

  await db.schema
    .createTable('labels')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('form_labels')
    .addColumn('form_id', 'integer', (col) => col.notNull().references('forms.id'))
    .addColumn('label_id', 'integer', (col) => col.notNull().references('labels.id'))
    .addPrimaryKeyConstraint('form_labels_pk', ['form_id', 'label_id'])
    .execute();

  await db.schema
    .createTable('form_types')
    .addColumn('form_id', 'integer', (col) => col.notNull().references('forms.id'))
    .addColumn('type_id', 'integer', (col) => col.notNull().references('types.id'))
    .addColumn('slot', 'integer', (col) => col.notNull())
    .addPrimaryKeyConstraint('form_types_pk', ['form_id', 'slot'])
    .execute();

  await db.schema
    .createTable('form_abilities')
    .addColumn('form_id', 'integer', (col) => col.notNull().references('forms.id'))
    .addColumn('ability_id', 'integer', (col) => col.notNull().references('abilities.id'))
    .addColumn('slot_id', 'integer', (col) => col.notNull().references('ability_slots.id'))
    .addPrimaryKeyConstraint('form_abilities_pk', ['form_id', 'slot_id'])
    .execute();

  await db.schema
    .createTable('form_overrides')
    .addColumn('form_id', 'integer', (col) => col.primaryKey().references('forms.id'))
    .addColumn('catch_rate', 'integer')
    .addColumn('base_friendship', 'integer')
    .addColumn('egg_cycles', 'integer')
    .addColumn('male_ratio', 'real')
    .addColumn('base_scale', 'real')
    .execute();

  await db.schema
    .createTable('form_hitboxes')
    .addColumn('form_id', 'integer', (col) => col.primaryKey().references('forms.id'))
    .addColumn('width', 'real', (col) => col.notNull())
    .addColumn('height', 'real', (col) => col.notNull())
    .addColumn('fixed', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute();

  await db.schema
    .createTable('form_override_egg_groups')
    .addColumn('form_id', 'integer', (col) => col.notNull().references('forms.id'))
    .addColumn('egg_group_id', 'integer', (col) => col.notNull().references('egg_groups.id'))
    .addPrimaryKeyConstraint('form_override_egg_groups_pk', ['form_id', 'egg_group_id'])
    .execute();

  await db.schema
    .createTable('form_tags')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('form_id', 'integer', (col) => col.notNull().references('forms.id'))
    .addColumn('tag_id', 'integer', (col) => col.notNull().references('form_tag_types.id'))
    .execute();

  await db.schema.createIndex('idx_forms_species_id').on('forms').column('species_id').execute();
  await db.schema.createIndex('idx_form_types_type_id').on('form_types').column('type_id').execute();
  await db.schema.createIndex('idx_form_abilities_ability_id').on('form_abilities').column('ability_id').execute();
  await db.schema.createIndex('idx_form_labels_label_id').on('form_labels').column('label_id').execute();
  await db.schema.createIndex('idx_forms_slug').on('forms').column('slug').execute();
  await db.schema.createIndex('idx_labels_slug').on('labels').column('slug').execute();
  await db.schema.createIndex('idx_form_tags_form_id').on('form_tags').column('form_id').execute();
  await db.schema.createIndex('idx_form_tags_tag_id').on('form_tags').column('tag_id').execute();

  await sql`CREATE INDEX idx_forms_name_trgm ON forms USING gin (name gin_trgm_ops)`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX IF EXISTS idx_forms_name_trgm`.execute(db);
  await db.schema.dropTable('form_tags').execute();
  await db.schema.dropTable('form_override_egg_groups').execute();
  await db.schema.dropTable('form_hitboxes').execute();
  await db.schema.dropTable('form_overrides').execute();
  await db.schema.dropTable('form_abilities').execute();
  await db.schema.dropTable('form_types').execute();
  await db.schema.dropTable('form_labels').execute();
  await db.schema.dropTable('labels').execute();
  await db.schema.dropTable('forms').execute();
}
