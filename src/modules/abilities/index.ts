import { Elysia, NotFoundError } from 'elysia';
import { abilitiesSetup } from '@/infrastructure/setup';
import { AbilityModel } from './model';

export const abilities = new Elysia({ prefix: '/abilities', tags: ['abilities'] })
  .use(abilitiesSetup)
  .get('/search', ({ query, abilitiesService }) => abilitiesService.search(query), {
    query: AbilityModel.searchQuery,
    response: AbilityModel.searchResponse,
    detail: {
      summary: 'Search Abilities',
      description: 'Search abilities with filtering by IDs, slugs, and flags.',
    },
  })
  .get(
    '/:identifier',
    async ({ params, query, abilitiesService }) => {
      const result = await abilitiesService.getByIdentifier(params.identifier, query);
      if (!result) throw new NotFoundError('Ability not found');
      return result;
    },
    {
      query: AbilityModel.getOneQuery,
      response: AbilityModel.getOneResponse,
      detail: {
        summary: 'Get Ability by ID or slug',
        description: 'Get a single ability by ID or slug.',
      },
    }
  );
