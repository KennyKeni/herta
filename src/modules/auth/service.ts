import { Algorithm, hash, verify } from '@node-rs/argon2';
import { render } from '@react-email/components';
import { betterAuth } from 'better-auth';
import { admin, jwt } from 'better-auth/plugins';
import { config } from '@/config';
import { db } from '@/infrastructure/db';
import { resend } from '@/infrastructure/email';
import { ResetPasswordTemplate } from '@/infrastructure/email/templates/reset-password';
import { VerifyEmailTemplate } from '@/infrastructure/email/templates/verify-email';
import { redis } from '@/infrastructure/redis';

const argon2Options = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 1,
};

const secondaryStorage = {
  get: async (key: string) => {
    return await redis.get(key);
  },
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
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: 'secondary-storage',
    customRules: {
      '/sign-in/*': { window: 60, max: 5 },
      '/sign-up/*': { window: 60, max: 5 },
      '/request-password-reset': { window: 60, max: 3 },
      '/reset-password/*': { window: 60, max: 5 },
      '/send-verification-email': { window: 60, max: 2 },
    },
  },
  session: {
    expiresIn: config.auth.AUTH_SESSION_EXPIRES_IN,
    updateAge: config.auth.AUTH_SESSION_UPDATE_AGE,
    storeSessionInDatabase: false,
  },
  advanced: config.auth.BETTER_AUTH_COOKIE_DOMAIN
    ? {
        useSecureCookies:
          config.auth.BETTER_AUTH_SECURE_COOKIES ?? config.app.NODE_ENV === 'production',
        crossSubDomainCookies: {
          enabled: true,
          domain: config.auth.BETTER_AUTH_COOKIE_DOMAIN,
        },
      }
    : undefined,
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        const html = await render(VerifyEmailTemplate({ url }));
        await resend.emails.send({
          from: config.email.EMAIL_FROM,
          to: user.email,
          subject: 'Verify your email',
          html,
        });
      } catch (error) {
        console.error('Failed to send verification email:', error);
      }
    },
  },
  emailAndPassword: {
    enabled: true,
    password: {
      hash: (password) => hash(password, argon2Options),
      verify: ({ password, hash: hashed }) => verify(hashed, password, argon2Options),
    },
    sendResetPassword: async ({ user, url }) => {
      try {
        const html = await render(ResetPasswordTemplate({ url }));
        await resend.emails.send({
          from: config.email.EMAIL_FROM,
          to: user.email,
          subject: 'Reset your password',
          html,
        });
      } catch (error) {
        console.error('Failed to send password reset email:', error);
      }
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
