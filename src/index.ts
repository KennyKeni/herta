import { cors } from '@elysiajs/cors';
import { serverTiming } from '@elysiajs/server-timing';
import { swagger } from '@elysiajs/swagger';
import { Elysia } from 'elysia';
import { config } from '@/config';
import { checkDbConnection } from '@/infrastructure/db';
import { abilities } from '@/modules/abilities';
import { agent } from '@/modules/agent';
import { articles } from '@/modules/article';
import { authModule } from '@/modules/auth';
import { images } from '@/modules/images';
import { items } from '@/modules/items';
import { moves } from '@/modules/moves';
import { pokemon } from '@/modules/pokemon';
import { spawns } from '@/modules/spawns';
import { types } from '@/modules/types';

const swaggerPlugin = swagger({
  documentation: {
    info: {
      title: 'Herta API',
      version: '1.0.0',
      description: 'Pokemon and Cobblemon data API',
    },
    tags: [
      { name: 'pokemon', description: 'Pokemon data endpoints' },
      { name: 'types', description: 'Type data endpoints' },
      { name: 'abilities', description: 'Ability data endpoints' },
      { name: 'moves', description: 'Move data endpoints' },
      { name: 'items', description: 'Item data endpoints' },
      { name: 'spawns', description: 'Spawn data endpoints' },
      { name: 'articles', description: 'Article data endpoints' },
      { name: 'images', description: 'Image upload and management endpoints' },
      { name: 'agent', description: 'Simplified API for AI agents' },
    ],
  },
});

const parseOrigins = (origins: string): (string | RegExp)[] =>
  origins.split(',').map((o) => {
    const trimmed = o.trim();
    if (trimmed.startsWith('/') && trimmed.endsWith('/')) {
      return new RegExp(trimmed.slice(1, -1));
    }
    return trimmed;
  });

const app = new Elysia()
  .use(
    cors({
      origin: config.app.CORS_ORIGIN === '*' ? true : parseOrigins(config.app.CORS_ORIGIN),
    })
  )
  .use(serverTiming())
  .use(config.app.SWAGGER_ENABLED ? swaggerPlugin : (app) => app)
  .onRequest(({ request }) => {
    console.log(`[req] ${request.method} ${request.url}`);
  })
  .onAfterHandle(({ request, set }) => {
    if (!config.cache.CACHE_ENABLED) return;
    if (request.method !== 'GET') return;

    const status = Number(set.status ?? 200);
    if (status < 200 || status >= 300) return;

    set.headers['Cache-Control'] =
      `public, max-age=${config.cache.CACHE_MAX_AGE}, stale-while-revalidate=${config.cache.CACHE_STALE_WHILE_REVALIDATE}`;
  })
  .onAfterResponse(({ request, set }) => {
    console.log(`[res] ${request.method} ${request.url} ${set.status ?? 200}`);
  })
  .onError(({ error, request }) => {
    console.error(`[error] ${request.method} ${request.url}`, error);
  })
  .get('/', () => 'Hello Elysia')
  .use(authModule)
  .use(pokemon)
  .use(types)
  .use(abilities)
  .use(moves)
  .use(items)
  .use(spawns)
  .use(articles)
  .use(images)
  .use(agent)
  .listen(config.app.PORT);

checkDbConnection().then(() => {
  console.log(`[app] Ready at ${app.server?.hostname}:${app.server?.port}`);
});
