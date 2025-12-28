import type { AbilitiesRepository } from '../abilities/repository';
import type { Article } from '../article/domain';
import type { ArticleRepository } from '../article/repository';
import type { MovesRepository } from '../moves/repository';
import type { PokemonFilter } from '../pokemon/domain';
import type { PokemonRepository } from '../pokemon/repository';
import type { TypesRepository } from '../types/repository';
import { mapIncludeFlags, toResponse } from './mapper';
import type { AgentPokemonQuery, AgentPokemonResponse } from './model';

export class AgentService {
  constructor(
    private pokemonRepository: PokemonRepository,
    private typesRepository: TypesRepository,
    private abilitiesRepository: AbilitiesRepository,
    private movesRepository: MovesRepository,
    private articleRepository: ArticleRepository
  ) {}

  async searchPokemon(query: AgentPokemonQuery): Promise<AgentPokemonResponse> {
    const [typeIds, abilityIds, moveIds, eggGroupIds, labelIds, formSlugs] = await Promise.all([
      query.types ? this.typesRepository.fuzzyResolve(query.types) : [],
      query.abilities ? this.abilitiesRepository.fuzzyResolve(query.abilities) : [],
      query.moves ? this.movesRepository.fuzzyResolve(query.moves) : [],
      query.eggGroups ? this.pokemonRepository.fuzzyResolveEggGroups(query.eggGroups) : [],
      query.labels ? this.pokemonRepository.fuzzyResolveLabels(query.labels) : [],
      query.names ? this.pokemonRepository.fuzzyResolveForms(query.names) : [],
    ]);

    const filter: PokemonFilter = {
      typeIds: typeIds.length ? typeIds : undefined,
      abilityIds: abilityIds.length ? abilityIds : undefined,
      moveIds: moveIds.length ? moveIds : undefined,
      eggGroupIds: eggGroupIds.length ? eggGroupIds : undefined,
      labelIds: labelIds.length ? labelIds : undefined,
      formSlugs: formSlugs.length ? formSlugs : undefined,
      generation: Array.isArray(query.generation) ? undefined : query.generation,
      generations: Array.isArray(query.generation) ? query.generation : undefined,
      ...mapIncludeFlags(query),
      limit: query.limit,
      offset: query.offset,
    };

    const results = await this.pokemonRepository.searchPokemon(filter);
    const total = results.reduce((acc, sp) => acc + sp.forms.length, 0);

    return toResponse(results, query, total);
  }

  async getArticle(identifier: string): Promise<Article | null> {
    return this.articleRepository.getByIdentifier(identifier);
  }
}
