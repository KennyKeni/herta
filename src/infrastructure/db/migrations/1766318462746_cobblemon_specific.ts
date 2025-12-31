import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('lighting')
    .addColumn('species_id', 'integer', (col) => col.primaryKey().references('species.id'))
    .addColumn('light_level', 'integer', (col) => col.notNull())
    .addColumn('liquid_glow_mode', 'text')
    .execute();

  await db.schema
    .createTable('riding')
    .addColumn('species_id', 'integer', (col) => col.primaryKey().references('species.id'))
    .addColumn('data', 'jsonb', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('spawns')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('bucket_id', 'integer', (col) => col.notNull().references('spawn_buckets.id'))
    .addColumn('position_type_id', 'integer', (col) =>
      col.notNull().references('spawn_position_types.id')
    )
    .addColumn('level_min', 'integer', (col) => col.notNull())
    .addColumn('level_max', 'integer', (col) => col.notNull())
    .addColumn('weight', 'real', (col) => col.notNull())
    .addColumn('form_id', 'integer', (col) => col.notNull().references('forms.id'))
    .execute();

  await db.schema
    .createTable('spawn_conditions')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('spawn_id', 'integer', (col) => col.notNull().references('spawns.id'))
    .addColumn('condition_type', 'text', (col) => col.notNull())
    .addColumn('multiplier', 'real')
    .execute();

  await db.schema
    .createTable('spawn_presets')
    .addColumn('spawn_id', 'integer', (col) => col.notNull().references('spawns.id'))
    .addColumn('preset_type_id', 'integer', (col) =>
      col.notNull().references('spawn_preset_types.id')
    )
    .addPrimaryKeyConstraint('spawn_presets_pk', ['spawn_id', 'preset_type_id'])
    .execute();

  await db.schema
    .createTable('spawn_condition_biomes')
    .addColumn('condition_id', 'integer', (col) => col.notNull().references('spawn_conditions.id'))
    .addColumn('biome_id', 'integer', (col) => col.notNull().references('biomes.id'))
    .addPrimaryKeyConstraint('spawn_condition_biomes_pk', ['condition_id', 'biome_id'])
    .execute();

  await db.schema
    .createTable('spawn_condition_biome_tags')
    .addColumn('condition_id', 'integer', (col) => col.notNull().references('spawn_conditions.id'))
    .addColumn('biome_tag_id', 'integer', (col) => col.notNull().references('biome_tags.id'))
    .addPrimaryKeyConstraint('spawn_condition_biome_tags_pk', ['condition_id', 'biome_tag_id'])
    .execute();

  await db.schema
    .createTable('spawn_condition_time')
    .addColumn('condition_id', 'integer', (col) => col.notNull().references('spawn_conditions.id'))
    .addColumn('time_range_id', 'integer', (col) => col.notNull().references('time_ranges.id'))
    .addPrimaryKeyConstraint('spawn_condition_time_pk', ['condition_id', 'time_range_id'])
    .execute();

  await db.schema
    .createTable('spawn_condition_weather')
    .addColumn('condition_id', 'integer', (col) =>
      col.primaryKey().references('spawn_conditions.id')
    )
    .addColumn('is_raining', 'boolean')
    .addColumn('is_thundering', 'boolean')
    .execute();

  await db.schema
    .createTable('spawn_condition_moon_phases')
    .addColumn('condition_id', 'integer', (col) => col.notNull().references('spawn_conditions.id'))
    .addColumn('moon_phase_id', 'integer', (col) => col.notNull().references('moon_phases.id'))
    .addPrimaryKeyConstraint('spawn_condition_moon_phases_pk', ['condition_id', 'moon_phase_id'])
    .execute();

  await db.schema
    .createTable('spawn_condition_sky')
    .addColumn('condition_id', 'integer', (col) =>
      col.primaryKey().references('spawn_conditions.id')
    )
    .addColumn('can_see_sky', 'boolean')
    .addColumn('min_sky_light', 'integer')
    .addColumn('max_sky_light', 'integer')
    .execute();

  await db.schema
    .createTable('spawn_condition_position')
    .addColumn('condition_id', 'integer', (col) =>
      col.primaryKey().references('spawn_conditions.id')
    )
    .addColumn('min_y', 'integer')
    .addColumn('max_y', 'integer')
    .execute();

  await db.schema
    .createTable('spawn_condition_lure')
    .addColumn('condition_id', 'integer', (col) =>
      col.primaryKey().references('spawn_conditions.id')
    )
    .addColumn('min_lure_level', 'integer')
    .addColumn('max_lure_level', 'integer')
    .execute();

  await db.schema.createIndex('idx_spawns_form_id').on('spawns').column('form_id').execute();
  await db.schema.createIndex('idx_spawns_bucket_id').on('spawns').column('bucket_id').execute();
  await db.schema
    .createIndex('idx_spawn_conditions_spawn_id')
    .on('spawn_conditions')
    .column('spawn_id')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('spawn_condition_lure').execute();
  await db.schema.dropTable('spawn_condition_position').execute();
  await db.schema.dropTable('spawn_condition_sky').execute();
  await db.schema.dropTable('spawn_condition_moon_phases').execute();
  await db.schema.dropTable('spawn_condition_weather').execute();
  await db.schema.dropTable('spawn_condition_time').execute();
  await db.schema.dropTable('spawn_condition_biome_tags').execute();
  await db.schema.dropTable('spawn_condition_biomes').execute();
  await db.schema.dropTable('spawn_presets').execute();
  await db.schema.dropTable('spawn_conditions').execute();
  await db.schema.dropTable('spawns').execute();
  await db.schema.dropTable('riding').execute();
  await db.schema.dropTable('lighting').execute();
}
