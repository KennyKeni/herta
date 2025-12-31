import type { EntityType, Operation, OutboxEventInsert } from './domain';
import type { OutboxRepository } from './repository';

export class OutboxService {
  constructor(private outboxRepository: OutboxRepository) {}

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
