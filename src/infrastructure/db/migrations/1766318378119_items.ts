import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('item_tag_types')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('items')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('gen', 'integer')
    .addColumn('desc', 'text')
    .addColumn('short_desc', 'text')
    .addColumn('fling_power', 'integer')
    .addColumn('fling_effect', 'text')
    .addColumn('natural_gift_type_id', 'integer', (col) => col.references('types.id'))
    .addColumn('natural_gift_power', 'integer')
    .addColumn('source', 'text', (col) => col.notNull())
    .addColumn('implemented', 'boolean', (col) => col.notNull().defaultTo(true))
    .execute();

  await db.schema
    .createTable('item_boosts')
    .addColumn('item_id', 'text', (col) => col.notNull().references('items.id'))
    .addColumn('stat_id', 'integer', (col) => col.notNull().references('stats.id'))
    .addColumn('stages', 'integer', (col) => col.notNull())
    .addPrimaryKeyConstraint('item_boosts_pk', ['item_id', 'stat_id'])
    .execute();

  await db.schema
    .createTable('item_flags')
    .addColumn('item_id', 'text', (col) => col.notNull().references('items.id'))
    .addColumn('flag', 'text', (col) => col.notNull())
    .addPrimaryKeyConstraint('item_flags_pk', ['item_id', 'flag'])
    .execute();

  await db.schema
    .createTable('item_tags')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('item_id', 'text', (col) => col.notNull().references('items.id'))
    .addColumn('tag_id', 'integer', (col) => col.notNull().references('item_tag_types.id'))
    .execute();

  await db.schema
    .createTable('item_tag_hierarchy')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('parent_tag_id', 'integer', (col) => col.notNull().references('item_tag_types.id'))
    .addColumn('child_tag_id', 'integer', (col) => col.notNull().references('item_tag_types.id'))
    .execute();

  await db.schema.createIndex('idx_item_tags_item_id').on('item_tags').column('item_id').execute();
  await db.schema.createIndex('idx_item_tags_tag_id').on('item_tags').column('tag_id').execute();
  await db.schema
    .createIndex('idx_item_tag_hierarchy_parent')
    .on('item_tag_hierarchy')
    .column('parent_tag_id')
    .execute();
  await db.schema
    .createIndex('idx_item_tag_hierarchy_child')
    .on('item_tag_hierarchy')
    .column('child_tag_id')
    .execute();
  await db.schema
    .createIndex('idx_item_tag_types_slug')
    .on('item_tag_types')
    .column('slug')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('item_tag_hierarchy').execute();
  await db.schema.dropTable('item_tags').execute();
  await db.schema.dropTable('item_flags').execute();
  await db.schema.dropTable('item_boosts').execute();
  await db.schema.dropTable('items').execute();
  await db.schema.dropTable('item_tag_types').execute();
}
