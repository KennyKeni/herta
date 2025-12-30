import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('item_tag_types')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('items')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('num', 'integer')
    .addColumn('gen', 'integer')
    .addColumn('desc', 'text')
    .addColumn('short_desc', 'text')
    .addColumn('namespace_id', 'integer', (col) => col.references('namespaces.id'))
    .addColumn('implemented', 'boolean', (col) => col.notNull().defaultTo(true))
    .execute();

  await db.schema
    .createTable('item_boosts')
    .addColumn('item_id', 'integer', (col) => col.notNull().references('items.id'))
    .addColumn('stat_id', 'integer', (col) => col.notNull().references('stats.id'))
    .addColumn('stages', 'integer', (col) => col.notNull())
    .addPrimaryKeyConstraint('item_boosts_pk', ['item_id', 'stat_id'])
    .execute();

  await db.schema
    .createTable('item_flags')
    .addColumn('item_id', 'integer', (col) => col.notNull().references('items.id'))
    .addColumn('flag_type_id', 'integer', (col) => col.notNull().references('item_flag_types.id'))
    .addPrimaryKeyConstraint('item_flags_pk', ['item_id', 'flag_type_id'])
    .execute();

  await db.schema
    .createTable('item_tags')
    .addColumn('item_id', 'integer', (col) => col.notNull().references('items.id'))
    .addColumn('tag_id', 'integer', (col) => col.notNull().references('item_tag_types.id'))
    .addPrimaryKeyConstraint('item_tags_pk', ['item_id', 'tag_id'])
    .execute();

  await db.schema
    .createTable('item_tag_hierarchy')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('parent_tag_id', 'integer', (col) => col.notNull().references('item_tag_types.id'))
    .addColumn('child_tag_id', 'integer', (col) => col.notNull().references('item_tag_types.id'))
    .execute();

  await db.schema.createIndex('idx_item_tags_item_id').on('item_tags').column('item_id').execute();
  await db.schema.createIndex('idx_item_tags_tag_id').on('item_tags').column('tag_id').execute();
  await db.schema.createIndex('idx_item_tag_hierarchy_parent').on('item_tag_hierarchy').column('parent_tag_id').execute();
  await db.schema.createIndex('idx_item_tag_hierarchy_child').on('item_tag_hierarchy').column('child_tag_id').execute();
  await db.schema.createIndex('idx_item_tag_types_slug').on('item_tag_types').column('slug').execute();
  await db.schema.createIndex('idx_items_namespace_id').on('items').column('namespace_id').execute();

  await sql`CREATE INDEX idx_items_name_trgm ON items USING gin (name gin_trgm_ops)`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX IF EXISTS idx_items_name_trgm`.execute(db);
  await db.schema.dropTable('item_tag_hierarchy').execute();
  await db.schema.dropTable('item_tags').execute();
  await db.schema.dropTable('item_flags').execute();
  await db.schema.dropTable('item_boosts').execute();
  await db.schema.dropTable('items').execute();
  await db.schema.dropTable('item_tag_types').execute();
}
