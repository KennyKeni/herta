import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('moves')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('type_id', 'integer', (col) => col.notNull().references('types.id'))
    .addColumn('category_id', 'integer', (col) => col.notNull().references('move_categories.id'))
    .addColumn('target_id', 'integer', (col) => col.references('move_targets.id'))
    .addColumn('power', 'integer')
    .addColumn('accuracy', 'integer')
    .addColumn('pp', 'integer', (col) => col.notNull())
    .addColumn('priority', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('crit_ratio', 'integer')
    .addColumn('min_hits', 'integer')
    .addColumn('max_hits', 'integer')
    .addColumn('drain_percent', 'integer')
    .addColumn('heal_percent', 'integer')
    .addColumn('recoil_percent', 'integer')
    .addColumn('desc', 'text')
    .addColumn('short_desc', 'text')
    .execute();

  await db.schema
    .createTable('move_flags')
    .addColumn('move_id', 'integer', (col) => col.notNull().references('moves.id'))
    .addColumn('flag_id', 'integer', (col) => col.notNull().references('move_flag_types.id'))
    .addPrimaryKeyConstraint('move_flags_pk', ['move_id', 'flag_id'])
    .execute();

  await db.schema
    .createTable('move_boosts')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('move_id', 'integer', (col) => col.notNull().references('moves.id'))
    .addColumn('is_self', 'boolean', (col) => col.notNull())
    .addColumn('stat_id', 'integer', (col) => col.notNull().references('stats.id'))
    .addColumn('stages', 'integer', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('move_effects')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('move_id', 'integer', (col) => col.notNull().references('moves.id'))
    .addColumn('chance', 'integer', (col) => col.notNull())
    .addColumn('is_self', 'boolean', (col) => col.notNull())
    .addColumn('condition_type_id', 'integer', (col) => col.notNull().references('condition_types.id'))
    .addColumn('condition_id', 'integer', (col) => col.references('conditions.id'))
    .execute();

  await db.schema
    .createTable('move_z_data')
    .addColumn('move_id', 'integer', (col) => col.primaryKey().references('moves.id'))
    .addColumn('is_z_exclusive', 'boolean', (col) => col.notNull().defaultTo(false))
    .addColumn('z_crystal', 'text')
    .addColumn('z_power', 'integer')
    .addColumn('z_effect', 'text')
    .execute();

  await db.schema
    .createTable('move_max_power')
    .addColumn('move_id', 'integer', (col) => col.primaryKey().references('moves.id'))
    .addColumn('max_power', 'integer', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('gmax_moves')
    .addColumn('move_id', 'integer', (col) => col.notNull().references('moves.id'))
    .addColumn('species_id', 'integer', (col) => col.notNull().references('species.id'))
    .addPrimaryKeyConstraint('gmax_moves_pk', ['move_id', 'species_id'])
    .execute();

  await db.schema.createIndex('idx_moves_type_id').on('moves').column('type_id').execute();
  await db.schema.createIndex('idx_moves_category_id').on('moves').column('category_id').execute();
  await db.schema
    .createIndex('idx_move_boosts_move_id')
    .on('move_boosts')
    .column('move_id')
    .execute();
  await db.schema
    .createIndex('idx_move_effects_move_id')
    .on('move_effects')
    .column('move_id')
    .execute();
  await db.schema
    .createIndex('idx_gmax_moves_species_id')
    .on('gmax_moves')
    .column('species_id')
    .execute();
  await db.schema.createIndex('idx_moves_slug').on('moves').column('slug').execute();

  await sql`CREATE INDEX idx_moves_name_trgm ON moves USING gin (name gin_trgm_ops)`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX IF EXISTS idx_moves_name_trgm`.execute(db);
  await db.schema.dropTable('gmax_moves').execute();
  await db.schema.dropTable('move_max_power').execute();
  await db.schema.dropTable('move_z_data').execute();
  await db.schema.dropTable('move_effects').execute();
  await db.schema.dropTable('move_boosts').execute();
  await db.schema.dropTable('move_flags').execute();
  await db.schema.dropTable('moves').execute();
}
