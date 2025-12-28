/**
 * The purpose of this module is to accomdate a different usage for Agentic applications.
 * This would mean destructuring the "species" and "form" layers into one as well as omitting
 * certain data that would normally be commited to the data for the frotnend.
 *
 * This will currently be an HTTP endpoint first before MCP capabilities. The purpose is to keep
 * a lot of the agentic optimizations such as fuzzy searching names etc. in here rather than the
 * end service defining the tools.
 *
 * These endpoints are removed from the original features to not mix CRUD purposes from agentic ones.
 */

import { Elysia } from 'elysia';
import { agentSetup } from '@/infrastructure/setup';
import { AgentPokemonQuerySchema, AgentPokemonResponseSchema } from './model';

export const agent = new Elysia({ prefix: '/agent', tags: ['agent'] })
  .use(agentSetup)
  .get(
    '/pokemon',
    async ({ agentService, query }) => {
      return agentService.searchPokemon(query);
    },
    {
      query: AgentPokemonQuerySchema,
      response: AgentPokemonResponseSchema,
      detail: {
        summary: 'Search Pokemon',
        description:
          'Search Pokemon with fuzzy name matching and granular include flags. Optimized for AI agents with minimal default response.',
      },
    }
  );

/**
 * TODO:
 * Endpoints:
 * Prefix: /agents
 * /pokemon
 * - Fuzzy search form name
 * - Search by id
 * - Limit, Offset
 *
 * - Filter
 *  - Stats: GT, LT (Per Field), Total Stats
 *  - Evs Yield: TBD
 *  - Egg Groups: Simple List
 *  - Height, Weight
 *  - Moves (Contains)
 *  - Abilities (Contains)
 *  - Pokedex number
 *  - Generation
 *  - Form Types
 *    - Gmax, Mega, etc via Aspects
 *
 * - Include Flags (Enum): Stats, Moves, Etc. # TODO Include all
 *  - Minimal info shown for Moves (No Desc just name)
 *  - We will just not return certain form info, like hitbox etc
 * - Limit, Offset
 *
 *
 * /move
 * - Fuzzy Search move name
 * - Search by Id
 *
 * - Filter
 *  - Power
 *  - Category
 *  - Type
 *  - Type: Gmax / Max / Z-move
 *  - Limit, Offset
 *
 * /abilities
 * - Fuzzy Search ability name
 * - Search by Id
 * - Limit, Offset
 *
 * /items
 * - Fuzzy search item name
 * - Limit, Offset
 *
 * /natures
 * - Fuzzy search nature name
 * - No id
 * - Limit, Offset
 *
 * /article
 * - Fuzzy search article title
 * - No id
 */
