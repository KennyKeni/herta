import { Elysia } from 'elysia';
import { PokemonModel } from './model';
import { setup } from '@/infrastructure/setup';

export const pokemon = new Elysia({ prefix: '/pokemon' })
  .use(setup)
  .get('/search', ({ query, pokemonService }) => pokemonService.search(query), {
    query: PokemonModel.searchQuery,
    response: PokemonModel.searchResponse,
  });
