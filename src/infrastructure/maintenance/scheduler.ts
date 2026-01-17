import type { MaintenanceTask } from './domain';

export class MaintenanceScheduler {
  private tasks: MaintenanceTask[] = [];
  private timers: Map<string, Timer> = new Map();
  private isStarted = false;

  registerTask(task: MaintenanceTask): void {
    if (this.isStarted) {
      throw new Error('Cannot register tasks after scheduler has started');
    }

    this.tasks.push(task);
    console.log(
      `[maintenance] Registered task: ${task.name} (interval: ${task.intervalMs}ms, enabled: ${task.enabled})`
    );
  }

  start(): void {
    if (this.isStarted) {
      throw new Error('Scheduler already started');
    }

    this.isStarted = true;

    const enabledTasks = this.tasks.filter((task) => task.enabled);
    console.log(`[maintenance] Scheduler started with ${enabledTasks.length} active tasks`);

    for (const task of this.tasks) {
      if (!task.enabled) {
        console.log(`[maintenance] Skipping disabled task: ${task.name}`);
        continue;
      }

      console.log(`[${task.name}] Started (interval: ${task.intervalMs}ms)`);

      const timer = setInterval(() => {
        this.executeTask(task);
      }, task.intervalMs);

      this.timers.set(task.name, timer);
    }
  }

  async stop(): Promise<void> {
    console.log('[maintenance] Scheduler stopping...');

    for (const [taskName, timer] of this.timers) {
      clearInterval(timer);
      console.log(`[${taskName}] Stopped`);
    }

    this.timers.clear();
    this.isStarted = false;

    console.log('[maintenance] Scheduler stopped');
  }

  private async executeTask(task: MaintenanceTask): Promise<void> {
    const startTime = Date.now();

    console.log(`[${task.name}] Starting execution`);

    try {
      await task.execute();

      const durationMs = Date.now() - startTime;
      console.log(`[${task.name}] Completed in ${durationMs}ms`);
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[${task.name}] Failed after ${durationMs}ms: ${errorMsg}`);
    }
  }
}
