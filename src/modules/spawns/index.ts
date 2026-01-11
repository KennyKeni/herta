import { Elysia } from 'elysia';
import { spawnsSetup } from '@/infrastructure/setup';
import { SpawnModel } from './model';

export const spawns = new Elysia({ prefix: '/spawns', tags: ['spawns'] })
  .use(spawnsSetup)
  .get('/', ({ query, spawnsService }) => spawnsService.search(query), {
    query: SpawnModel.searchQuery,
    response: SpawnModel.searchResponse,
    detail: {
      summary: 'List Spawns',
      description: 'Search spawns with pagination. Filter by form IDs and spawn bucket IDs.',
    },
  });
