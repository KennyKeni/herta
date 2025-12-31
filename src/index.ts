import { swagger } from '@elysiajs/swagger';
import { Elysia } from 'elysia';
import { abilities } from '@/modules/abilities';
import { agent } from '@/modules/agent';
import { articles } from '@/modules/article';
import { items } from '@/modules/items';
import { moves } from '@/modules/moves';
import { pokemon } from '@/modules/pokemon';

const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Herta API',
          version: '1.0.0',
          description: 'Pokemon and Cobblemon data API',
        },
        tags: [
          { name: 'pokemon', description: 'Pokemon data endpoints' },
          { name: 'abilities', description: 'Ability data endpoints' },
          { name: 'moves', description: 'Move data endpoints' },
          { name: 'items', description: 'Item data endpoints' },
          { name: 'articles', description: 'Article data endpoints' },
          { name: 'agent', description: 'Simplified API for AI agents' },
        ],
      },
    })
  )
  .onRequest(({ request }) => {
    console.log(`${request.method} ${request.url}`);
  })
  .onError(({ error, request }) => {
    console.error(`${request.method} ${request.url}`, error);
  })
  .get('/', () => 'Hello Elysia')
  .use(pokemon)
  .use(abilities)
  .use(moves)
  .use(items)
  .use(articles)
  .use(agent)
  .listen(3000);

console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
