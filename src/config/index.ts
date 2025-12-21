import { t } from "elysia"
import { Value } from '@sinclair/typebox/value'

const postgresSchema = t.Object({
  POSTGRES_USER: t.String({ minLength: 1 }),
  POSTGRES_PASSWORD: t.String(),
  POSTGRES_DB: t.String({ minLength: 1 }),
  POSTGRES_HOST: t.String({ minLength: 1 }),
  POSTGRES_PORT: t.Numeric({ minLength: 1 }),
})

const redisSchema = t.Object({
  REDIS_PORT: t.String({ minLength: 1 }),
})

const postgres = Value.Parse(postgresSchema, {
  POSTGRES_DB: 'herta',
  POSTGRES_HOST: 'localhost',
  POSTGRES_PORT: '5432',
  ...Bun.env,
})

const redis = Value.Parse(redisSchema, {
  REDIS_PORT: '6379',
  ...Bun.env,
})

export const config = {
  postgres,
  redis,
} as const