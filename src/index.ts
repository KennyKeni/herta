import { Elysia } from 'elysia';
import { pokemon } from '@/modules/pokemon';

const app = new Elysia()
  .onRequest(({ request }) => {
    console.log(`${request.method} ${request.url}`);
  })
  .onError(({ error, request }) => {
    console.error(`${request.method} ${request.url}`, error);
  })
  .get('/', () => 'Hello Elysia')
  .use(pokemon)
  .listen(3000);

console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
