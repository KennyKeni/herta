import { SQL } from 'bun';
import { Kysely, sql } from 'kysely';
import { PostgresJSDialect } from 'kysely-postgres-js';
import { config } from '../../config';
import type { DB } from './types';

const dialect = new PostgresJSDialect({
  postgres: new SQL({
    database: config.postgres.POSTGRES_DB,
    host: config.postgres.POSTGRES_HOST,
    port: config.postgres.POSTGRES_PORT,
    user: config.postgres.POSTGRES_USER,
    password: config.postgres.POSTGRES_PASSWORD,
    max: 10,
  }),
});

export const db = new Kysely<DB>({
  dialect,
});

export async function checkDbConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`.execute(db);
    console.log('[postgres] Connected');
    return true;
  } catch (err) {
    console.error('[postgres] Connection error:', (err as Error).message);
    return false;
  }
}
