import { sql, type Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('outbox_events')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('entity_type', 'text', (col) => col.notNull())
    .addColumn('entity_id', 'text', (col) => col.notNull())
    .addColumn('operation', 'text', (col) => col.notNull())
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('processed_at', 'timestamptz')
    .execute();

  await sql`ALTER TABLE outbox_events ADD CONSTRAINT outbox_events_entity_type_check CHECK (entity_type IN ('species', 'form', 'move', 'ability', 'item', 'article'))`.execute(
    db
  );
  await sql`ALTER TABLE outbox_events ADD CONSTRAINT outbox_events_operation_check CHECK (operation IN ('CREATE', 'UPDATE', 'DELETE'))`.execute(
    db
  );

  await sql`CREATE INDEX idx_outbox_events_unprocessed ON outbox_events (created_at) WHERE processed_at IS NULL`.execute(
    db
  );
  await sql`CREATE INDEX idx_outbox_events_entity ON outbox_events (entity_type, entity_id)`.execute(
    db
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('outbox_events').execute();
}
