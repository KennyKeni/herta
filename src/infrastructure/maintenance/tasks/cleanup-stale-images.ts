import { config } from "@/config";
import type { ImagesService } from "@/modules/images/service";
import type { MaintenanceTask } from "../domain";

export class ImageCleanupTask implements MaintenanceTask {
	readonly name = "image-cleanup";
	readonly intervalMs =
		config.maintenance.MAINTENANCE_IMAGE_CLEANUP_INTERVAL_MS;
	readonly enabled = config.maintenance.MAINTENANCE_IMAGE_CLEANUP_ENABLED;

	private staleMinutes =
		config.maintenance.MAINTENANCE_IMAGE_CLEANUP_STALE_MINUTES;

	constructor(private imagesService: ImagesService) {}

	async execute(): Promise<void> {
		const cleaned =
			await this.imagesService.cleanupStalePendingUploads(this.staleMinutes);

		if (cleaned > 0) {
			console.log(`Cleaned ${cleaned} stale images (older than ${this.staleMinutes} minutes)`);
		}
	}
}
