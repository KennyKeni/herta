import { Elysia } from 'elysia';
import { AbilitiesRepository } from '@/modules/abilities/repository';
import { AbilitiesService } from '@/modules/abilities/service';
import { AgentService } from '@/modules/agent/service';
import { ArticlesRepository } from '@/modules/article/repository';
import { ArticlesService } from '@/modules/article/service';
import { ItemsRepository } from '@/modules/items/repository';
import { ItemsService } from '@/modules/items/service';
import { MovesRepository } from '@/modules/moves/repository';
import { MovesService } from '@/modules/moves/service';
import { PokemonRepository } from '@/modules/pokemon/repository';
import { PokemonService } from '@/modules/pokemon/service';
import { SpawnRepository } from '@/modules/spawns/repository';
import { SpawnsService } from '@/modules/spawns/service';
import { TypesRepository } from '@/modules/types/repository';
import { TypesService } from '@/modules/types/service';
import { db } from './db';
import { OutboxRepository } from './outbox/repository';
import { OutboxService } from './outbox/service';

const pokemonRepository = new PokemonRepository(db);
const typesRepository = new TypesRepository(db);
const abilitiesRepository = new AbilitiesRepository(db);
const movesRepository = new MovesRepository(db);
const itemsRepository = new ItemsRepository(db);
const articlesRepository = new ArticlesRepository(db);
const spawnRepository = new SpawnRepository(db);
const outboxRepository = new OutboxRepository(db);

const pokemonService = new PokemonService(pokemonRepository);
const typesService = new TypesService(typesRepository);
const abilitiesService = new AbilitiesService(abilitiesRepository);
const movesService = new MovesService(movesRepository);
const itemsService = new ItemsService(itemsRepository);
const articlesService = new ArticlesService(articlesRepository);
const spawnsService = new SpawnsService(spawnRepository);
const agentService = new AgentService(
  pokemonRepository,
  typesRepository,
  abilitiesRepository,
  movesRepository,
  itemsRepository,
  articlesRepository
);
const outboxService = new OutboxService(outboxRepository);

export const pokemonSetup = new Elysia({ name: 'setup:pokemon' }).decorate(
  'pokemonService',
  pokemonService
);

export const typesSetup = new Elysia({ name: 'setup:types' }).decorate(
  'typesService',
  typesService
);

export const abilitiesSetup = new Elysia({ name: 'setup:abilities' }).decorate(
  'abilitiesService',
  abilitiesService
);

export const movesSetup = new Elysia({ name: 'setup:moves' }).decorate(
  'movesService',
  movesService
);

export const itemsSetup = new Elysia({ name: 'setup:items' }).decorate(
  'itemsService',
  itemsService
);

export const articlesSetup = new Elysia({ name: 'setup:articles' }).decorate(
  'articlesService',
  articlesService
);

export const spawnsSetup = new Elysia({ name: 'setup:spawns' }).decorate(
  'spawnsService',
  spawnsService
);

export const agentSetup = new Elysia({ name: 'setup:agent' }).decorate(
  'agentService',
  agentService
);

export const outboxSetup = new Elysia({ name: 'setup:outbox' }).decorate(
  'outboxService',
  outboxService
);

export { outboxService };
