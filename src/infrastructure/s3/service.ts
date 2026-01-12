import type { S3Client } from '@aws-sdk/client-s3';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const DEFAULT_EXPIRES_IN = 3600;

export class S3Service {
  constructor(
    private client: S3Client,
    private bucket: string
  ) {}

  async getUploadUrl(
    key: string,
    contentType: string,
    expiresIn = DEFAULT_EXPIRES_IN
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, { expiresIn });
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
