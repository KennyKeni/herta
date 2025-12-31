import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`.execute(db);

  await db.schema
    .createTable('types')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('stats')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('move_categories')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('description', 'text')
    .execute();

  await db.schema
    .createTable('move_targets')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('description', 'text')
    .execute();

  await db.schema
    .createTable('condition_types')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('conditions')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('type_id', 'integer', (col) => col.notNull().references('condition_types.id'))
    .addColumn('description', 'text')
    .execute();

  await db.schema
    .createTable('experience_groups')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('formula', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('egg_groups')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('ability_flag_types')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('description', 'text')
    .execute();

  await db.schema
    .createTable('move_flag_types')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('description', 'text')
    .execute();

  await db.schema
    .createTable('aspect_groups')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('rule', 'text', (col) => col.notNull())
    .addColumn('description', 'text')
    .execute();

  await db.schema
    .createTable('namespaces')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('ability_slots')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('aspect_types')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('item_flag_types')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('move_learn_methods')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('time_ranges')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('moon_phases')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('spawn_position_types')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('spawn_preset_types')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('spawn_buckets')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('spawn_condition_types')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('recipe_types')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('form_tag_types')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('recipe_tag_types')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('biome_tags')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('namespace_id', 'integer', (col) => col.references('namespaces.id'))
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('biomes')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('namespace_id', 'integer', (col) => col.references('namespaces.id'))
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('biome_tag_biomes')
    .addColumn('biome_id', 'integer', (col) => col.notNull().references('biomes.id'))
    .addColumn('biome_tag_id', 'integer', (col) => col.notNull().references('biome_tags.id'))
    .addPrimaryKeyConstraint('biome_tag_biomes_pk', ['biome_id', 'biome_tag_id'])
    .execute();

  await db.schema.createIndex('idx_types_slug').on('types').column('slug').execute();
  await db.schema
    .createIndex('idx_move_categories_slug')
    .on('move_categories')
    .column('slug')
    .execute();
  await db.schema.createIndex('idx_move_targets_slug').on('move_targets').column('slug').execute();
  await db.schema
    .createIndex('idx_ability_flag_types_slug')
    .on('ability_flag_types')
    .column('slug')
    .execute();
  await db.schema
    .createIndex('idx_move_flag_types_slug')
    .on('move_flag_types')
    .column('slug')
    .execute();
  await db.schema
    .createIndex('idx_aspect_groups_slug')
    .on('aspect_groups')
    .column('slug')
    .execute();
  await db.schema.createIndex('idx_egg_groups_slug').on('egg_groups').column('slug').execute();
  await db.schema
    .createIndex('idx_experience_groups_slug')
    .on('experience_groups')
    .column('slug')
    .execute();
  await db.schema
    .createIndex('idx_form_tag_types_slug')
    .on('form_tag_types')
    .column('slug')
    .execute();
  await db.schema
    .createIndex('idx_recipe_tag_types_slug')
    .on('recipe_tag_types')
    .column('slug')
    .execute();
  await db.schema
    .createIndex('idx_spawn_buckets_slug')
    .on('spawn_buckets')
    .column('slug')
    .execute();
  await db.schema.createIndex('idx_biome_tags_slug').on('biome_tags').column('slug').execute();
  await db.schema.createIndex('idx_biomes_slug').on('biomes').column('slug').execute();

  await sql`CREATE INDEX idx_types_name_trgm ON types USING gin (name gin_trgm_ops)`.execute(db);
  await sql`CREATE INDEX idx_move_categories_name_trgm ON move_categories USING gin (name gin_trgm_ops)`.execute(
    db
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX IF EXISTS idx_move_categories_name_trgm`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_types_name_trgm`.execute(db);

  await db.schema.dropTable('biome_tag_biomes').execute();
  await db.schema.dropTable('biomes').execute();
  await db.schema.dropTable('biome_tags').execute();
  await db.schema.dropTable('recipe_tag_types').execute();
  await db.schema.dropTable('form_tag_types').execute();
  await db.schema.dropTable('recipe_types').execute();
  await db.schema.dropTable('spawn_buckets').execute();
  await db.schema.dropTable('spawn_condition_types').execute();
  await db.schema.dropTable('spawn_preset_types').execute();
  await db.schema.dropTable('spawn_position_types').execute();
  await db.schema.dropTable('moon_phases').execute();
  await db.schema.dropTable('time_ranges').execute();
  await db.schema.dropTable('move_learn_methods').execute();
  await db.schema.dropTable('item_flag_types').execute();
  await db.schema.dropTable('aspect_types').execute();
  await db.schema.dropTable('ability_slots').execute();
  await db.schema.dropTable('namespaces').execute();
  await db.schema.dropTable('aspect_groups').execute();
  await db.schema.dropTable('move_flag_types').execute();
  await db.schema.dropTable('ability_flag_types').execute();
  await db.schema.dropTable('egg_groups').execute();
  await db.schema.dropTable('experience_groups').execute();
  await db.schema.dropTable('conditions').execute();
  await db.schema.dropTable('condition_types').execute();
  await db.schema.dropTable('move_targets').execute();
  await db.schema.dropTable('move_categories').execute();
  await db.schema.dropTable('stats').execute();
  await db.schema.dropTable('types').execute();

  await sql`DROP EXTENSION IF EXISTS pg_trgm CASCADE`.execute(db);
}
