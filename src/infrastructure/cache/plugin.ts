import { Elysia } from 'elysia';
import { cacheService } from '../setup';

export type CacheConfig = {
  key: string;
  ttl?: number;
};

function buildCacheKey(
  pattern: string,
  params: Record<string, string>,
  query: Record<string, unknown>
): string {
  let key = pattern;

  for (const [name, value] of Object.entries(params)) {
    key = key.replace(`{${name}}`, String(value));
  }

  const queryString = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  if (queryString) {
    key = `${key}?${queryString}`;
  }

  return key;
}

export const cachePlugin = new Elysia({ name: 'plugin:cache' }).macro({
  cache: (config: CacheConfig) => ({
    async beforeHandle({ params, query, set }) {
      const key = buildCacheKey(config.key, params ?? {}, query ?? {});

      const cached = await cacheService.get(key);
      if (cached !== null) {
        console.log(`[cache] HIT ${key}`);
        set.headers['X-Cache'] = 'HIT';
        return cached;
      }

      console.log(`[cache] MISS ${key}`);
      set.headers['X-Cache'] = 'MISS';
      set.headers['X-Cache-Key'] = key;
    },
    async afterHandle({ response, set }) {
      const key = set.headers['X-Cache-Key'];
      if (typeof key === 'string' && set.headers['X-Cache'] === 'MISS') {
        await cacheService.set(key, response, config.ttl);
        delete set.headers['X-Cache-Key'];
      }
    },
  }),
});
