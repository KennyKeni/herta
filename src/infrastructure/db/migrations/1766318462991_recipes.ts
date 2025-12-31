import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('recipes')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('type_id', 'integer', (col) => col.notNull().references('recipe_types.id'))
    .addColumn('result_item_id', 'integer', (col) => col.references('items.id'))
    .addColumn('result_count', 'integer', (col) => col.notNull().defaultTo(1))
    .addColumn('experience', 'real')
    .addColumn('cooking_time', 'integer')
    .execute();

  await db.schema
    .createTable('recipe_slot_types')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('description', 'text')
    .execute();

  await db.schema
    .createTable('recipe_inputs')
    .addColumn('recipe_id', 'integer', (col) => col.notNull().references('recipes.id'))
    .addColumn('item_id', 'integer', (col) => col.notNull().references('items.id'))
    .addColumn('slot', 'integer')
    .addColumn('slot_type_id', 'integer', (col) => col.references('recipe_slot_types.id'))
    .execute();

  await sql`ALTER TABLE recipe_inputs ADD CONSTRAINT recipe_inputs_slot_check CHECK (slot IS NOT NULL OR slot_type_id IS NOT NULL)`.execute(
    db
  );

  await db.schema
    .createTable('recipe_tag_inputs')
    .addColumn('recipe_id', 'integer', (col) => col.notNull().references('recipes.id'))
    .addColumn('tag_id', 'integer', (col) => col.notNull().references('recipe_tag_types.id'))
    .addColumn('slot', 'integer')
    .addColumn('slot_type_id', 'integer', (col) => col.references('recipe_slot_types.id'))
    .execute();

  await sql`ALTER TABLE recipe_tag_inputs ADD CONSTRAINT recipe_tag_inputs_slot_check CHECK (slot IS NOT NULL OR slot_type_id IS NOT NULL)`.execute(
    db
  );

  await db.schema
    .createIndex('idx_recipe_inputs_recipe_id')
    .on('recipe_inputs')
    .column('recipe_id')
    .execute();
  await db.schema
    .createIndex('idx_recipe_tag_inputs_recipe_id')
    .on('recipe_tag_inputs')
    .column('recipe_id')
    .execute();
  await db.schema.createIndex('idx_recipes_type_id').on('recipes').column('type_id').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('recipe_tag_inputs').execute();
  await db.schema.dropTable('recipe_inputs').execute();
  await db.schema.dropTable('recipe_slot_types').execute();
  await db.schema.dropTable('recipes').execute();
}
