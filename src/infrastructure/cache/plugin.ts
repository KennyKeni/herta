import { Elysia } from 'elysia';
import { cacheService } from '../setup';

export type CacheConfig = {
  key: string;
  group?: string;
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
      if (config.group) {
        set.headers['X-Cache-Group'] = buildCacheKey(config.group, params ?? {}, {});
      }
    },
    async afterHandle({ response, set }) {
      const key = set.headers['X-Cache-Key'];
      if (typeof key === 'string' && set.headers['X-Cache'] === 'MISS') {
        const group = set.headers['X-Cache-Group'];
        await cacheService.set(
          key,
          response,
          config.ttl,
          typeof group === 'string' ? group : undefined
        );
        delete set.headers['X-Cache-Key'];
        delete set.headers['X-Cache-Group'];
      }
    },
  }),
});
