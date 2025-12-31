import { Elysia, NotFoundError } from 'elysia';
import { pokemonSetup } from '@/infrastructure/setup';
import { PokemonModel } from './model';

export const pokemon = new Elysia({ prefix: '/pokemon', tags: ['pokemon'] })
  .use(pokemonSetup)
  .get('/search', ({ query, pokemonService }) => pokemonService.search(query), {
    query: PokemonModel.searchQuery,
    response: PokemonModel.searchResponse,
    detail: {
      summary: 'Search Pokemon',
      description:
        'Search Pokemon species and forms with filtering by IDs, slugs, types, abilities, moves, and more.',
    },
  })
  .get(
    '/:identifier',
    async ({ params, query, pokemonService }) => {
      const result = await pokemonService.getByIdentifier(params.identifier, query);
      if (!result) throw new NotFoundError('Pokemon not found');
      return result;
    },
    {
      query: PokemonModel.getOneQuery,
      response: PokemonModel.getOneResponse,
      detail: {
        summary: 'Get Pokemon by ID or slug',
        description: 'Get a single Pokemon species with all its forms by species ID or slug.',
      },
    }
  );
