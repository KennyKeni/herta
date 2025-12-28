import { SQL } from 'bun';
import { Kysely } from 'kysely';
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
