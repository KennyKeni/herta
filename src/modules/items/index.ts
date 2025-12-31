import { Elysia, NotFoundError } from 'elysia';
import { itemsSetup } from '@/infrastructure/setup';
import { ItemModel } from './model';

export const items = new Elysia({ prefix: '/items', tags: ['items'] })
  .use(itemsSetup)
  .get('/search', ({ query, itemsService }) => itemsService.search(query), {
    query: ItemModel.searchQuery,
    response: ItemModel.searchResponse,
    detail: {
      summary: 'Search Items',
      description: 'Search items with filtering by IDs and tags.',
    },
  })
  .get(
    '/:identifier',
    async ({ params, query, itemsService }) => {
      const result = await itemsService.getByIdentifier(params.identifier, query);
      if (!result) throw new NotFoundError('Item not found');
      return result;
    },
    {
      query: ItemModel.getOneQuery,
      response: ItemModel.getOneResponse,
      detail: {
        summary: 'Get Item by ID or slug',
        description: 'Get a single item by ID or slug.',
      },
    }
  );
