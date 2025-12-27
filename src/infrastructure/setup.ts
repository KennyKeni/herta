import { Elysia } from 'elysia';
import { db } from './db';
import { PokemonRepository } from '@/modules/pokemon/repository';
import { PokemonService } from '@/modules/pokemon/service';

const pokemonRepository = new PokemonRepository(db);
const pokemonService = new PokemonService(pokemonRepository);

export const setup = new Elysia({ name: 'setup' }).decorate('pokemonService', pokemonService);
