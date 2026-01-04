import type { AbilityFilter } from '../abilities/domain';
import type { AbilitiesRepository } from '../abilities/repository';
import type { Article, ArticleFilter } from '../article/domain';
import type { ArticleRepository } from '../article/repository';
import type { ItemFilter } from '../items/domain';
import type { ItemsRepository } from '../items/repository';
import type { MoveFilter } from '../moves/domain';
import type { MovesRepository } from '../moves/repository';
import type { PokemonFilter } from '../pokemon/domain';
import type { PokemonRepository } from '../pokemon/repository';
import type { TypesRepository } from '../types/repository';
import {
  mapIncludeFlags,
  toAbilityResponse,
  toArticleSearchResponse,
  toItemResponse,
  toMoveResponse,
  toResponse,
} from './mapper';
import type {
  AgentAbilityQuery,
  AgentAbilityResponse,
  AgentArticleQuery,
  AgentArticleSearchResponse,
  AgentItemQuery,
  AgentItemResponse,
  AgentMoveQuery,
  AgentMoveResponse,
  AgentPokemonQuery,
  AgentPokemonResponse,
} from './model';

export class AgentService {
  constructor(
    private pokemonRepository: PokemonRepository,
    private typesRepository: TypesRepository,
    private abilitiesRepository: AbilitiesRepository,
    private movesRepository: MovesRepository,
    private itemsRepository: ItemsRepository,
    private articleRepository: ArticleRepository
  ) {}

  async searchPokemon(query: AgentPokemonQuery): Promise<AgentPokemonResponse> {
    const [typeIds, abilityIds, moveIds, eggGroupIds, labelIds, dropItemIds] = await Promise.all([
      query.types ? this.typesRepository.fuzzyResolve(query.types) : [],
      query.abilities ? this.abilitiesRepository.fuzzyResolve(query.abilities) : [],
      query.moves ? this.movesRepository.fuzzyResolve(query.moves) : [],
      query.eggGroups ? this.pokemonRepository.fuzzyResolveEggGroups(query.eggGroups) : [],
      query.labels ? this.pokemonRepository.fuzzyResolveLabels(query.labels) : [],
      query.dropsItems ? this.itemsRepository.fuzzyResolve(query.dropsItems) : [],
    ]);

    const filter: PokemonFilter = {
      name: query.name,
      typeIds: typeIds.length ? typeIds : undefined,
      abilityIds: abilityIds.length ? abilityIds : undefined,
      moveIds: moveIds.length ? moveIds : undefined,
      eggGroupIds: eggGroupIds.length ? eggGroupIds : undefined,
      labelIds: labelIds.length ? labelIds : undefined,
      dropItemIds: dropItemIds.length ? dropItemIds : undefined,
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

  async searchAbilities(query: AgentAbilityQuery): Promise<AgentAbilityResponse> {
    const filter: AbilityFilter = {
      name: query.name,
      includeFlags: query.includeFlags,
      limit: query.limit,
      offset: query.offset,
    };

    const results = await this.abilitiesRepository.searchAbilities(filter);
    return toAbilityResponse(results, query, results.length);
  }

  async searchMoves(query: AgentMoveQuery): Promise<AgentMoveResponse> {
    const [typeIds, categoryIds] = await Promise.all([
      query.types ? this.typesRepository.fuzzyResolve(query.types) : [],
      query.categories ? this.movesRepository.fuzzyResolveCategories(query.categories) : [],
    ]);

    const filter: MoveFilter = {
      name: query.name,
      typeIds: typeIds.length ? typeIds : undefined,
      categoryIds: categoryIds.length ? categoryIds : undefined,
      includeFlags: query.includeFlags,
      includeBoosts: query.includeBoosts,
      includeEffects: query.includeEffects,
      includeZData: query.includeZData,
      limit: query.limit,
      offset: query.offset,
    };

    const results = await this.movesRepository.searchMoves(filter);
    return toMoveResponse(results, query, results.length);
  }

  async searchItems(query: AgentItemQuery): Promise<AgentItemResponse> {
    const tagIds = query.tags ? await this.itemsRepository.fuzzyResolveTags(query.tags) : [];

    const filter: ItemFilter = {
      name: query.name,
      tagIds: tagIds.length ? tagIds : undefined,
      includeBoosts: query.includeBoosts,
      includeTags: query.includeTags,
      includeRecipes: query.includeRecipes,
      limit: query.limit,
      offset: query.offset,
    };

    const results = await this.itemsRepository.searchItems(filter);
    return toItemResponse(results, query, results.length);
  }

  async searchArticles(query: AgentArticleQuery): Promise<AgentArticleSearchResponse> {
    const categoryIds = query.categories
      ? await this.articleRepository.fuzzyResolveCategories(query.categories)
      : [];

    const filter: ArticleFilter = {
      title: query.title,
      categoryIds: categoryIds.length ? categoryIds : undefined,
      includeCategories: query.includeCategories,
      limit: query.limit,
      offset: query.offset,
    };

    const results = await this.articleRepository.searchArticles(filter);
    return toArticleSearchResponse(results, query, results.length);
  }
}
