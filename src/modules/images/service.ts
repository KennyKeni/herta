import type { S3Service } from '@/infrastructure/s3/service';
import type { Image, UpdateImageMetadata } from './domain';
import type { ImagesRepository } from './repository';

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

export class ImagesService {
  constructor(
    private imagesRepository: ImagesRepository,
    private s3Service: S3Service,
    private s3PublicUrl: string
  ) {}

  async requestUpload(
    contentType: string,
    maxSize?: number,
    keyPrefix?: string,
    uploadedBy?: string
  ): Promise<{
    imageId: string;
    s3Key: string;
    publicUrl: string;
    maxSize: number;
  }> {
    const timestamp = Date.now();
    const extension = this.getExtensionFromMimeType(contentType);
    const prefix = keyPrefix ?? 'uploads';
    const s3Key = `${prefix}/${timestamp}${extension}`;
    const size = maxSize ?? DEFAULT_MAX_SIZE;

    const created = await this.imagesRepository.create({
      s3Key,
      mimeType: contentType,
      uploadedBy,
    });

    const publicUrl = `${this.s3PublicUrl}/${created.s3Key}`;

    return { imageId: created.id, s3Key: created.s3Key, publicUrl, maxSize: size };
  }

  async confirmUpload(imageId: string, metadata?: UpdateImageMetadata): Promise<Image | null> {
    const confirmed = await this.imagesRepository.confirmUpload(imageId, metadata ?? {});
    if (!confirmed) return null;
    return this.imagesRepository.getById(imageId);
  }

  async publish(imageId: string): Promise<boolean> {
    return this.imagesRepository.updateStatus(imageId, 'published');
  }

  async softDelete(imageId: string): Promise<boolean> {
    return this.imagesRepository.softDelete(imageId);
  }

  async hardDelete(imageId: string): Promise<boolean> {
    const image = await this.imagesRepository.getById(imageId);
    if (!image) return false;

    const deleted = await this.imagesRepository.hardDelete(imageId);
    if (deleted) {
      await this.s3Service.deleteObject(image.s3Key);
    }
    return deleted;
  }

  async getById(imageId: string): Promise<Image | null> {
    return this.imagesRepository.getById(imageId);
  }

  async getByIds(imageIds: string[]): Promise<Image[]> {
    return this.imagesRepository.getByIds(imageIds);
  }

  async cleanupStalePendingUploads(olderThanMinutes = 60): Promise<number> {
    const stale = await this.imagesRepository.findPendingUploads(olderThanMinutes);
    let cleaned = 0;
    for (const image of stale) {
      const deleted = await this.hardDelete(image.id);
      if (deleted) cleaned++;
    }
    return cleaned;
  }

  private getExtensionFromMimeType(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
    };
    return map[mimeType] ?? '.bin';
  }
}
