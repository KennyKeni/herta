import { Elysia } from 'elysia';
import { AbilitiesRepository } from '@/modules/abilities/repository';
import { AgentService } from '@/modules/agent/service';
import { ArticleRepository } from '@/modules/article/repository';
import { MovesRepository } from '@/modules/moves/repository';
import { PokemonRepository } from '@/modules/pokemon/repository';
import { PokemonService } from '@/modules/pokemon/service';
import { TypesRepository } from '@/modules/types/repository';
import { db } from './db';

const pokemonRepository = new PokemonRepository(db);
const typesRepository = new TypesRepository(db);
const abilitiesRepository = new AbilitiesRepository(db);
const movesRepository = new MovesRepository(db);
const articleRepository = new ArticleRepository(db);

const pokemonService = new PokemonService(pokemonRepository);
const agentService = new AgentService(
  pokemonRepository,
  typesRepository,
  abilitiesRepository,
  movesRepository,
  articleRepository
);

export const pokemonSetup = new Elysia({ name: 'setup:pokemon' }).decorate(
  'pokemonService',
  pokemonService
);

export const agentSetup = new Elysia({ name: 'setup:agent' }).decorate(
  'agentService',
  agentService
);
