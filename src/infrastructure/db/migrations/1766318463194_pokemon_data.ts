import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('form_moves')
    .addColumn('form_id', 'integer', (col) => col.notNull().references('forms.id'))
    .addColumn('move_id', 'integer', (col) => col.notNull().references('moves.id'))
    .addColumn('method', 'text', (col) => col.notNull())
    .addColumn('level', 'integer')
    .addPrimaryKeyConstraint('form_moves_pk', ['form_id', 'move_id', 'method'])
    .execute();

  await db.schema
    .createTable('behaviour')
    .addColumn('form_id', 'integer', (col) => col.primaryKey().references('forms.id'))
    .addColumn('data', 'jsonb', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('form_drops')
    .addColumn('form_id', 'integer', (col) => col.primaryKey().references('forms.id'))
    .addColumn('amount', 'integer', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('drop_ranges')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('form_drop_id', 'integer', (col) => col.notNull().references('form_drops.form_id'))
    .addColumn('item_id', 'text', (col) => col.notNull().references('items.id'))
    .addColumn('quantity_min', 'integer', (col) => col.notNull())
    .addColumn('quantity_max', 'integer', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('drop_percentages')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('form_drop_id', 'integer', (col) => col.notNull().references('form_drops.form_id'))
    .addColumn('item_id', 'text', (col) => col.notNull().references('items.id'))
    .addColumn('percentage', 'real', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('form_aspect_combos')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('form_id', 'integer', (col) => col.notNull().references('forms.id'))
    .addColumn('combo_index', 'integer', (col) => col.notNull())
    .addUniqueConstraint('form_aspect_combos_form_combo_idx', ['form_id', 'combo_index'])
    .execute();

  await db.schema
    .createTable('form_aspect_combo_aspects')
    .addColumn('combo_id', 'integer', (col) => col.notNull().references('form_aspect_combos.id'))
    .addColumn('aspect_id', 'integer', (col) => col.notNull().references('aspects.id'))
    .addPrimaryKeyConstraint('form_aspect_combo_aspects_pk', ['combo_id', 'aspect_id'])
    .execute();

  await db.schema
    .createIndex('idx_form_moves_move_id')
    .on('form_moves')
    .column('move_id')
    .execute();
  await db.schema
    .createIndex('idx_drop_ranges_form_drop_id')
    .on('drop_ranges')
    .column('form_drop_id')
    .execute();
  await db.schema
    .createIndex('idx_drop_ranges_item_id')
    .on('drop_ranges')
    .column('item_id')
    .execute();
  await db.schema
    .createIndex('idx_drop_percentages_form_drop_id')
    .on('drop_percentages')
    .column('form_drop_id')
    .execute();
  await db.schema
    .createIndex('idx_drop_percentages_item_id')
    .on('drop_percentages')
    .column('item_id')
    .execute();
  await db.schema
    .createIndex('idx_form_aspect_combos_form_id')
    .on('form_aspect_combos')
    .column('form_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('form_aspect_combo_aspects').execute();
  await db.schema.dropTable('form_aspect_combos').execute();
  await db.schema.dropTable('drop_percentages').execute();
  await db.schema.dropTable('drop_ranges').execute();
  await db.schema.dropTable('form_drops').execute();
  await db.schema.dropTable('behaviour').execute();
  await db.schema.dropTable('form_moves').execute();
}
