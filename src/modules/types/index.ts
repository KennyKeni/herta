import { Elysia, NotFoundError } from 'elysia';
import { typesSetup } from '@/infrastructure/setup';
import { TypeModel } from './model';

export const types = new Elysia({ prefix: '/types', tags: ['types'] })
  .use(typesSetup)
  .get('/', ({ query, typesService }) => typesService.search(query), {
    query: TypeModel.searchQuery,
    response: TypeModel.searchResponse,
    detail: {
      summary: 'List Types',
      description: 'List types with optional filtering by IDs, slugs, and name.',
    },
  })
  .get(
    '/:identifier',
    async ({ params, query, typesService }) => {
      const result = await typesService.getByIdentifier(params.identifier, query);
      if (!result) throw new NotFoundError('Type not found');
      return result;
    },
    {
      query: TypeModel.getOneQuery,
      response: TypeModel.getOneResponse,
      detail: {
        summary: 'Get Type by ID or slug',
        description: 'Get a single type by ID or slug, with offensive/defensive matchups.',
      },
    }
  );
