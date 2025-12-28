import { Elysia } from 'elysia';
import { PokemonModel } from './model';
import { pokemonSetup } from '@/infrastructure/setup';

export const pokemon = new Elysia({ prefix: '/pokemon', tags: ['pokemon'] })
  .use(pokemonSetup)
  .get('/search', ({ query, pokemonService }) => pokemonService.search(query), {
    query: PokemonModel.searchQuery,
    response: PokemonModel.searchResponse,
    detail: {
      summary: 'Search Pokemon',
      description: 'Search Pokemon species and forms with filtering by IDs, slugs, types, abilities, moves, and more.',
    },
  });
