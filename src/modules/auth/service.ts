import { Algorithm, hash, verify } from '@node-rs/argon2';
import { betterAuth } from 'better-auth';
import { admin, jwt } from 'better-auth/plugins';
import { config } from '@/config';
import { db } from '@/infrastructure/db';
import { redis } from '@/infrastructure/redis';

const argon2Options = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 1,
};

const secondaryStorage = {
  get: (key: string) => redis.get(key),
  set: async (key: string, value: string, ttl?: number) => {
    if (ttl) {
      await redis.set(key, value, 'EX', ttl);
      return;
    }

    await redis.set(key, value);
  },
  delete: async (key: string) => {
    await redis.del(key);
  },
};

const parseTrustedOrigins = (origins?: string): string[] | undefined => {
  if (!origins) return undefined;
  return origins
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
};

export const auth = betterAuth({
  basePath: '/auth',
  secret: config.auth.BETTER_AUTH_SECRET,
  trustedOrigins: parseTrustedOrigins(config.auth.BETTER_AUTH_TRUSTED_ORIGINS),
  database: {
    db,
    type: 'postgres',
    casing: 'camel',
  },
  secondaryStorage,
  session: {
    expiresIn: config.auth.AUTH_SESSION_EXPIRES_IN,
    updateAge: config.auth.AUTH_SESSION_UPDATE_AGE,
    storeSessionInDatabase: false,
  },
  emailAndPassword: {
    enabled: true,
    password: {
      hash: (password) => hash(password, argon2Options),
      verify: ({ password, hash: hashed }) => verify(hashed, password, argon2Options),
    },
  },
  plugins: [
    jwt({
      jwt: {
        expirationTime: config.auth.AUTH_JWT_EXPIRES_IN,
      },
    }),
    admin(),
  ],
});
