import { type Kysely, sql } from 'kysely';
import type { DB } from '../db/types';
import type { EntityType, Operation, OutboxEvent, OutboxEventInsert } from './domain';

export class OutboxRepository {
  constructor(private db: Kysely<DB>) {}

  async record(entityType: EntityType, entityId: string, operation: Operation): Promise<void> {
    await this.db
      .insertInto('outbox_events')
      .values({
        entity_type: entityType,
        entity_id: entityId,
        operation,
      })
      .execute();
  }

  async recordBatch(events: OutboxEventInsert[]): Promise<number> {
    if (events.length === 0) return 0;

    const rows = events.map((e) => ({
      entity_type: e.entityType,
      entity_id: e.entityId,
      operation: e.operation,
    }));

    await this.db.insertInto('outbox_events').values(rows).execute();
    return events.length;
  }

  async fetchUnprocessed(limit: number): Promise<OutboxEvent[]> {
    const rows = await sql<{
      id: number;
      entity_type: string;
      entity_id: string;
      operation: string;
      created_at: Date;
      processed_at: Date | null;
    }>`
      SELECT id, entity_type, entity_id, operation, created_at, processed_at
      FROM outbox_events
      WHERE processed_at IS NULL
      ORDER BY created_at ASC
      LIMIT ${limit}
      FOR UPDATE SKIP LOCKED
    `.execute(this.db);

    return rows.rows.map((r) => ({
      id: r.id,
      entityType: r.entity_type as EntityType,
      entityId: r.entity_id,
      operation: r.operation as Operation,
      createdAt: r.created_at,
      processedAt: r.processed_at,
    }));
  }

  async markProcessed(ids: number[]): Promise<void> {
    if (ids.length === 0) return;

    await this.db
      .updateTable('outbox_events')
      .set({ processed_at: new Date() })
      .where('id', 'in', ids)
      .execute();
  }
}
