import { Elysia, NotFoundError } from 'elysia';
import { movesSetup } from '@/infrastructure/setup';
import { MoveModel } from './model';

export const moves = new Elysia({ prefix: '/moves', tags: ['moves'] })
  .use(movesSetup)
  .get('/', ({ query, movesService }) => movesService.search(query), {
    query: MoveModel.searchQuery,
    response: MoveModel.searchResponse,
    detail: {
      summary: 'List Moves',
      description:
        'List moves with optional filtering by IDs, slugs, types, categories, targets, and flags.',
    },
  })
  .get(
    '/:identifier',
    async ({ params, query, movesService }) => {
      const result = await movesService.getByIdentifier(params.identifier, query);
      if (!result) throw new NotFoundError('Move not found');
      return result;
    },
    {
      query: MoveModel.getOneQuery,
      response: MoveModel.getOneResponse,
      detail: {
        summary: 'Get Move by ID or slug',
        description: 'Get a single move by ID or slug.',
      },
    }
  );
