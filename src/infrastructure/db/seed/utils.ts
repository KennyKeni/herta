import { type Insertable, type Kysely, sql } from 'kysely';
import type { DB } from '../types';
import type { createLogger } from './logger';

const DATA_PATH = new URL('../data', import.meta.url).pathname;

export async function loadJson<T>(filename: string): Promise<T> {
  const path = `${DATA_PATH}/${filename}`;
  const content = await Bun.file(path).text();
  return JSON.parse(content) as T;
}

export async function batchInsert<T extends keyof DB & string>(
  db: Kysely<DB>,
  table: T,
  records: Insertable<DB[T]>[],
  batchSize = 500
): Promise<number> {
  if (records.length === 0) return 0;

  const chunks = chunk(records, batchSize);
  let inserted = 0;

  for (const batch of chunks) {
    await db.insertInto(table).values(batch).execute();
    inserted += batch.length;
  }

  return inserted;
}

function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export interface Seeder {
  name: string;
  tables: string[];
  seed(db: Kysely<DB>, logger: ReturnType<typeof createLogger>): Promise<number>;
}

export async function runSeeder(
  db: Kysely<DB>,
  seeder: Seeder,
  logger: ReturnType<typeof createLogger>
): Promise<number> {
  logger.phase(seeder.name);
  const count = await seeder.seed(db, logger);
  return count;
}

export async function truncateTables(db: Kysely<DB>, tables: string[]): Promise<void> {
  for (const table of tables) {
    await sql`TRUNCATE TABLE ${sql.ref(table)} CASCADE`.execute(db);
  }
}

export async function resetSequences(db: Kysely<DB>): Promise<void> {
  await sql`
    DO $$
    DECLARE
      r RECORD;
    BEGIN
      FOR r IN
        SELECT
          s.relname AS seq_name,
          t.relname AS table_name,
          a.attname AS column_name
        FROM pg_class s
        JOIN pg_depend d ON d.objid = s.oid
        JOIN pg_class t ON d.refobjid = t.oid
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid
        WHERE s.relkind = 'S'
      LOOP
        EXECUTE format(
          'SELECT setval(%L, COALESCE((SELECT MAX(%I) FROM %I), 1))',
          r.seq_name, r.column_name, r.table_name
        );
      END LOOP;
    END $$
  `.execute(db);
}
