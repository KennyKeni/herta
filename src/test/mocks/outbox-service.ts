import type { OutboxService } from '@/infrastructure/outbox/service';

export function createMockOutboxService(): OutboxService {
  const service = {
    record: async () => {},
    recordBatch: async () => 0,
    recordBatchForEntity: async () => 0,
    withTransaction: () => service,
  } as unknown as OutboxService;
  return service;
}
