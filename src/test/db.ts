import { SQL } from 'bun';
import { Kysely } from 'kysely';
import { PostgresJSDialect } from 'kysely-postgres-js';
import type { DB } from '../infrastructure/db/types';

export const testDb = new Kysely<DB>({
  dialect: new PostgresJSDialect({
    postgres: new SQL({
      database: process.env.POSTGRES_DB,
      host: process.env.POSTGRES_HOST ?? 'localhost',
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      max: 5,
    }),
  }),
});
