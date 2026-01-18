import type { S3Client } from '@aws-sdk/client-s3';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const DEFAULT_EXPIRES_IN = 3600;
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

export class S3Service {
  constructor(
    private client: S3Client,
    private bucket: string
  ) {}

  // NOTE: Image uploads now go through Cloudflare Worker (herta-upload) for validation.
  // This method is kept for potential direct S3 uploads that don't require validation.
  async getUploadUrl(
    key: string,
    contentType: string,
    contentLength = DEFAULT_MAX_SIZE,
    expiresIn = DEFAULT_EXPIRES_IN
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      ContentLength: contentLength,
    });
    return getSignedUrl(this.client, command, {
      expiresIn,
      signableHeaders: new Set(['content-type', 'content-length']),
    });
  }

  async getDownloadUrl(key: string, expiresIn = DEFAULT_EXPIRES_IN): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await this.client.send(command);
  }
}
