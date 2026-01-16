import { imagesService } from "@/infrastructure/setup";
import type { MaintenanceTask } from "../domain";
import { ImageCleanupTask } from "./cleanup-stale-images";

export function createMaintenanceTasks(): MaintenanceTask[] {
	return [new ImageCleanupTask(imagesService)];
}
