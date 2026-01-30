import { promises as fs } from 'node:fs';
import path from 'node:path';
import { SQL } from 'bun';
import { FileMigrationProvider, Kysely, Migrator } from 'kysely';
import { PostgresJSDialect } from 'kysely-postgres-js';
import pg from 'pg';

const TEST_DB = `${process.env.POSTGRES_DB}_test`;

process.env.POSTGRES_DB = TEST_DB;

const adminClient = new pg.Client({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  database: 'postgres',
});

await adminClient.connect();
await adminClient.query(`DROP DATABASE IF EXISTS "${TEST_DB}"`);
await adminClient.query(`CREATE DATABASE "${TEST_DB}"`);
await adminClient.end();

const testDb = new Kysely<Record<string, never>>({
  dialect: new PostgresJSDialect({
    postgres: new SQL({
      database: TEST_DB,
      host: process.env.POSTGRES_HOST ?? 'localhost',
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      max: 5,
    }),
  }),
});

const migrator = new Migrator({
  db: testDb,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.resolve(import.meta.dir, '../infrastructure/db/migrations'),
  }),
});

const { error } = await migrator.migrateToLatest();

if (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}

await testDb.destroy();
