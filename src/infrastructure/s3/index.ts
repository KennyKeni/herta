import { S3Client } from '@aws-sdk/client-s3';
import { config } from '@/config';

export const s3 = new S3Client({
  region: config.s3.S3_REGION,
  endpoint: config.s3.S3_ENDPOINT,
  credentials: {
    accessKeyId: config.s3.S3_ACCESS_KEY_ID,
    secretAccessKey: config.s3.S3_SECRET_ACCESS_KEY,
  },
});
