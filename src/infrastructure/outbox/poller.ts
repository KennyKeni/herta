import { config } from '../../config';
import { producer } from '../kafka';
import type { OutboxEvent } from './domain';
import type { OutboxRepository } from './repository';

const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(level: string, message: string): void {
  const timestamp = new Date().toISOString();
  console.log(`${COLORS.dim}[${timestamp}]${COLORS.reset} ${level} ${message}`);
}

function groupBy<T, K extends string>(items: T[], keyFn: (item: T) => K): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keyFn(item);
    result[key] = result[key] ?? [];
    result[key].push(item);
  }
  return result;
}

async function sendToKafka(events: OutboxEvent[]): Promise<void> {
  const grouped = groupBy(events, (e) => e.entityType);

  const messages = Object.entries(grouped).flatMap(([entityType, batch]) =>
    batch.map((event) => ({
      key: `${entityType}:${event.entityId}`,
      value: JSON.stringify({
        entityType: event.entityType,
        entityId: event.entityId,
        operation: event.operation,
      }),
    }))
  );

  await producer.send({
    topic: config.outbox.OUTBOX_KAFKA_TOPIC,
    messages,
  });
}

async function processOutbox(repository: OutboxRepository): Promise<number> {
  const events = await repository.fetchUnprocessed(config.outbox.OUTBOX_BATCH_SIZE);

  if (events.length === 0) return 0;

  log(`${COLORS.cyan}[outbox]${COLORS.reset}`, `Processing ${events.length} events`);

  try {
    await sendToKafka(events);
    await repository.markProcessed(events.map((e) => e.id));
    log(`${COLORS.green}[outbox]${COLORS.reset}`, `Processed ${events.length} events`);
    return events.length;
  } catch (error) {
    log(`${COLORS.red}[outbox]${COLORS.reset}`, `Failed: ${error}`);
    throw error;
  }
}

export class OutboxPoller {
  private intervalId: Timer | null = null;
  private isRunning = false;

  constructor(private repository: OutboxRepository) {}

  async start(): Promise<void> {
    if (this.isRunning) return;

    log(`${COLORS.cyan}[outbox]${COLORS.reset}`, 'Connecting to Kafka...');
    await producer.connect();
    log(`${COLORS.green}[outbox]${COLORS.reset}`, 'Kafka connected');

    this.isRunning = true;
    this.poll();

    log(
      `${COLORS.cyan}[outbox]${COLORS.reset}`,
      `Poller started (interval: ${config.outbox.OUTBOX_POLL_INTERVAL_MS}ms)`
    );
  }

  private poll(): void {
    this.intervalId = setInterval(async () => {
      try {
        await processOutbox(this.repository);
      } catch (error) {
        log(`${COLORS.red}[outbox]${COLORS.reset}`, `Poll cycle failed: ${error}`);
      }
    }, config.outbox.OUTBOX_POLL_INTERVAL_MS);
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    await producer.disconnect();
    this.isRunning = false;
    log(`${COLORS.yellow}[outbox]${COLORS.reset}`, 'Poller stopped');
  }
}
