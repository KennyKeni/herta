import { config } from '@/config';
import { createMaintenanceTasks, MaintenanceScheduler } from '@/infrastructure/maintenance';

if (!config.maintenance.MAINTENANCE_ENABLED) {
  console.log('Maintenance worker is disabled (MAINTENANCE_ENABLED=false)');
  process.exit(0);
}

const scheduler = new MaintenanceScheduler();

for (const task of createMaintenanceTasks()) {
  scheduler.registerTask(task);
}

async function shutdown() {
  console.log('Shutting down maintenance worker...');
  await scheduler.stop();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('Starting maintenance worker...');
scheduler.start();
