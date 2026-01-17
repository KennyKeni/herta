export interface MaintenanceTask {
  name: string;
  intervalMs: number;
  enabled: boolean;
  execute(): Promise<void>;
}

export type TaskExecution = {
  taskName: string;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  error?: Error;
};
