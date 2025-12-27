import { sql, type Kysely, type Insertable } from 'kysely';
import type { DB } from '../types';
import { createLogger } from './logger';

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
