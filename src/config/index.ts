import { Value } from '@sinclair/typebox/value';
import { t } from 'elysia';

const appSchema = t.Object({
  NODE_ENV: t.Union([t.Literal('development'), t.Literal('production'), t.Literal('test')]),
  PORT: t.Numeric({ minimum: 1 }),
  CORS_ORIGIN: t.String({ minLength: 1 }),
  SWAGGER_ENABLED: t.BooleanString(),
});

const postgresSchema = t.Object({
  POSTGRES_USER: t.String({ minLength: 1 }),
  POSTGRES_PASSWORD: t.String(),
  POSTGRES_DB: t.String({ minLength: 1 }),
  POSTGRES_HOST: t.String({ minLength: 1 }),
  POSTGRES_PORT: t.Numeric({ minLength: 1 }),
});

const redisSchema = t.Object({
  REDIS_HOST: t.String({ minLength: 1 }),
  REDIS_PORT: t.Numeric({ minLength: 1 }),
  REDIS_PASSWORD: t.Optional(t.String()),
});

const kafkaSchema = t.Object({
  KAFKA_BROKERS: t.String({ minLength: 1 }),
});

const outboxSchema = t.Object({
  OUTBOX_POLL_INTERVAL_MS: t.Numeric({ minimum: 1000 }),
  OUTBOX_BATCH_SIZE: t.Numeric({ minimum: 1 }),
  OUTBOX_KAFKA_TOPIC: t.String({ minLength: 1 }),
});

const cacheSchema = t.Object({
  CACHE_MAX_AGE: t.Numeric({ minimum: 0 }),
  CACHE_STALE_WHILE_REVALIDATE: t.Numeric({ minimum: 0 }),
  CACHE_ENABLED: t.BooleanString(),
});

const authSchema = t.Object({
  BETTER_AUTH_SECRET: t.String({ minLength: 32 }),
  BETTER_AUTH_TRUSTED_ORIGINS: t.Optional(t.String()),
  AUTH_SESSION_EXPIRES_IN: t.Numeric({ minimum: 60 }),
  AUTH_SESSION_UPDATE_AGE: t.Numeric({ minimum: 60 }),
  AUTH_JWT_EXPIRES_IN: t.String({ minLength: 1 }),
});

const s3Schema = t.Object({
  S3_ENDPOINT: t.String({ minLength: 1 }),
  S3_REGION: t.String({ minLength: 1 }),
  S3_ACCESS_KEY_ID: t.String({ minLength: 1 }),
  S3_SECRET_ACCESS_KEY: t.String({ minLength: 1 }),
  S3_BUCKET: t.String({ minLength: 1 }),
});

const maintenanceSchema = t.Object({
  MAINTENANCE_ENABLED: t.BooleanString(),
  MAINTENANCE_IMAGE_CLEANUP_ENABLED: t.BooleanString(),
  MAINTENANCE_IMAGE_CLEANUP_INTERVAL_MS: t.Numeric({ minimum: 60000 }),
  MAINTENANCE_IMAGE_CLEANUP_STALE_MINUTES: t.Numeric({ minimum: 1 }),
});

const postgres = Value.Parse(postgresSchema, {
  POSTGRES_DB: 'herta',
  POSTGRES_HOST: 'localhost',
  POSTGRES_PORT: '5432',
  ...process.env,
});

const redis = Value.Parse(redisSchema, {
  REDIS_HOST: 'localhost',
  REDIS_PORT: '6379',
  ...process.env,
});

const kafka = Value.Parse(kafkaSchema, {
  KAFKA_BROKERS: 'localhost:9092',
  ...process.env,
});

const outbox = Value.Parse(outboxSchema, {
  OUTBOX_POLL_INTERVAL_MS: '10000',
  OUTBOX_BATCH_SIZE: '100',
  OUTBOX_KAFKA_TOPIC: 'entity-events',
  ...process.env,
});

const app = Value.Parse(appSchema, {
  NODE_ENV: 'development',
  PORT: '3000',
  CORS_ORIGIN: '*',
  SWAGGER_ENABLED: 'true',
  ...process.env,
});

const cache = Value.Parse(cacheSchema, {
  CACHE_MAX_AGE: '60',
  CACHE_STALE_WHILE_REVALIDATE: '300',
  CACHE_ENABLED: 'true',
  ...process.env,
});

const auth = Value.Parse(authSchema, {
  BETTER_AUTH_SECRET: '',
  AUTH_SESSION_EXPIRES_IN: '604800',
  AUTH_SESSION_UPDATE_AGE: '86400',
  AUTH_JWT_EXPIRES_IN: '1h',
  ...process.env,
});

const s3 = (() => {
  try {
    return Value.Parse(s3Schema, { S3_REGION: 'auto', ...process.env });
  } catch {
    throw new Error(
      'Missing S3 config. Set S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET in .env'
    );
  }
})();

const maintenance = Value.Parse(maintenanceSchema, {
  MAINTENANCE_ENABLED: 'true',
  MAINTENANCE_IMAGE_CLEANUP_ENABLED: 'true',
  MAINTENANCE_IMAGE_CLEANUP_INTERVAL_MS: '300000',
  MAINTENANCE_IMAGE_CLEANUP_STALE_MINUTES: '60',
  ...process.env,
});

export const config = {
  app,
  postgres,
  redis,
  kafka,
  outbox,
  cache,
  auth,
  s3,
  maintenance,
} as const;
