import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE INDEX idx_forms_name_trgm ON forms USING gin (name gin_trgm_ops)`.execute(db);
  await sql`CREATE INDEX idx_species_name_trgm ON species USING gin (name gin_trgm_ops)`.execute(
    db
  );
  await sql`CREATE INDEX idx_moves_name_trgm ON moves USING gin (name gin_trgm_ops)`.execute(db);
  await sql`CREATE INDEX idx_items_name_trgm ON items USING gin (name gin_trgm_ops)`.execute(db);
  await sql`CREATE INDEX idx_abilities_name_trgm ON abilities USING gin (name gin_trgm_ops)`.execute(
    db
  );
  await sql`CREATE INDEX idx_aspects_name_trgm ON aspects USING gin (name gin_trgm_ops)`.execute(
    db
  );
  await sql`CREATE INDEX idx_types_name_trgm ON types USING gin (name gin_trgm_ops)`.execute(db);
  await sql`CREATE INDEX idx_natures_name_trgm ON natures USING gin (name gin_trgm_ops)`.execute(
    db
  );
  await sql`CREATE INDEX idx_move_categories_name_trgm ON move_categories USING gin (name gin_trgm_ops)`.execute(
    db
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX IF EXISTS idx_move_categories_name_trgm`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_natures_name_trgm`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_types_name_trgm`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_aspects_name_trgm`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_abilities_name_trgm`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_items_name_trgm`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_moves_name_trgm`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_species_name_trgm`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_forms_name_trgm`.execute(db);
}
