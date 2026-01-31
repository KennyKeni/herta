import type { Kysely } from 'kysely';
import type { DB } from '../db/types';
import type { EntityType, Operation, OutboxEventInsert } from './domain';
import type { OutboxRepository } from './repository';

export class OutboxService {
  constructor(private outboxRepository: OutboxRepository) {}

  withTransaction(trx: Kysely<DB>): OutboxService {
    return new OutboxService(this.outboxRepository.withTransaction(trx));
  }

  async record(entityType: EntityType, entityId: string, operation: Operation): Promise<void> {
    await this.outboxRepository.record(entityType, entityId, operation);
  }

  async recordBatch(events: OutboxEventInsert[]): Promise<number> {
    return this.outboxRepository.recordBatch(events);
  }

  async recordBatchForEntity(
    entityType: EntityType,
    entityIds: string[],
    operation: Operation
  ): Promise<number> {
    const events = entityIds.map((entityId) => ({ entityType, entityId, operation }));
    return this.outboxRepository.recordBatch(events);
  }
}
