import { swagger } from '@elysiajs/swagger';
import { Elysia } from 'elysia';
import { agent } from '@/modules/agent';
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
  .use(agent)
  .listen(3000);

console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
