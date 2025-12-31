import { db } from '../infrastructure/db';
import { OutboxPoller } from '../infrastructure/outbox/poller';
import { OutboxRepository } from '../infrastructure/outbox/repository';

const repository = new OutboxRepository(db);
const poller = new OutboxPoller(repository);

async function shutdown() {
	console.log('Shutting down outbox poller...');
	await poller.stop();
	process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('Starting outbox poller worker...');
poller.start().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
