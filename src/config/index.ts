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

const postgres = Value.Parse(postgresSchema, {
  POSTGRES_DB: 'herta',
  POSTGRES_HOST: 'localhost',
  POSTGRES_PORT: '5432',
  ...Bun.env,
});

const redis = Value.Parse(redisSchema, {
  REDIS_HOST: 'localhost',
  REDIS_PORT: '6379',
  ...Bun.env,
});

const kafka = Value.Parse(kafkaSchema, {
  KAFKA_BROKERS: 'localhost:9092',
  ...Bun.env,
});

const outbox = Value.Parse(outboxSchema, {
  OUTBOX_POLL_INTERVAL_MS: '10000',
  OUTBOX_BATCH_SIZE: '100',
  OUTBOX_KAFKA_TOPIC: 'entity-events',
  ...Bun.env,
});

const app = Value.Parse(appSchema, {
  NODE_ENV: 'development',
  PORT: '3000',
  CORS_ORIGIN: '*',
  SWAGGER_ENABLED: 'true',
  ...Bun.env,
});

export const config = {
  app,
  postgres,
  redis,
  kafka,
  outbox,
} as const;
