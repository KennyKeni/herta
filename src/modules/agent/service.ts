import type { AbilityFilter } from '../abilities/domain';
import type { AbilitiesService } from '../abilities/service';
import type { ArticleFilter } from '../article/domain';
import type { ArticlesService } from '../article/service';
import type { ItemFilter } from '../items/domain';
import type { ItemsService } from '../items/service';
import type { MoveFilter } from '../moves/domain';
import type { MovesService } from '../moves/service';
import type { PokemonFilter } from '../pokemon/domain';
import type { PokemonService } from '../pokemon/service';
import type { TypesService } from '../types/service';
import {
  mapIncludeFlags,
  toAbilityResponse,
  toAgentArticleResponse,
  toArticleSearchResponse,
  toItemResponse,
  toMoveResponse,
  toResponse,
} from './mapper';
import type {
  AgentAbilityQuery,
  AgentAbilityResponse,
  AgentArticleQuery,
  AgentArticleResponse,
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
    private pokemonService: PokemonService,
    private typesService: TypesService,
    private abilitiesService: AbilitiesService,
    private movesService: MovesService,
    private itemsService: ItemsService,
    private articlesService: ArticlesService
  ) {}

  async searchPokemon(query: AgentPokemonQuery): Promise<AgentPokemonResponse> {
    const [typeIds, abilityIds, moveIds, eggGroupIds, labelIds, dropItemIds] = await Promise.all([
      query.types ? this.typesService.resolveByNames(query.types) : [],
      query.abilities ? this.abilitiesService.resolveByNames(query.abilities) : [],
      query.moves ? this.movesService.resolveByNames(query.moves) : [],
      query.eggGroups ? this.pokemonService.resolveEggGroupsByNames(query.eggGroups) : [],
      query.labels ? this.pokemonService.resolveLabelsByNames(query.labels) : [],
      query.dropsItems ? this.itemsService.resolveByNames(query.dropsItems) : [],
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

    const { data, total } = await this.pokemonService.search(filter);

    return toResponse(data, query, total);
  }

  async getArticle(identifier: string): Promise<AgentArticleResponse> {
    const article = await this.articlesService.getByIdentifier(identifier);
    return toAgentArticleResponse(article);
  }

  async searchAbilities(query: AgentAbilityQuery): Promise<AgentAbilityResponse> {
    const filter: AbilityFilter = {
      name: query.name,
      includeFlags: query.includeFlags,
      limit: query.limit,
      offset: query.offset,
    };

    const { data, total } = await this.abilitiesService.search(filter);
    return toAbilityResponse(data, query, total);
  }

  async searchMoves(query: AgentMoveQuery): Promise<AgentMoveResponse> {
    const [typeIds, categoryIds] = await Promise.all([
      query.types ? this.typesService.resolveByNames(query.types) : [],
      query.categories ? this.movesService.resolveCategoriesByNames(query.categories) : [],
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

    const { data, total } = await this.movesService.search(filter);
    return toMoveResponse(data, query, total);
  }

  async searchItems(query: AgentItemQuery): Promise<AgentItemResponse> {
    const tagIds = query.tags ? await this.itemsService.resolveTagsByNames(query.tags) : [];

    const filter: ItemFilter = {
      name: query.name,
      tagIds: tagIds.length ? tagIds : undefined,
      includeBoosts: query.includeBoosts,
      includeTags: query.includeTags,
      includeRecipes: query.includeRecipes,
      limit: query.limit,
      offset: query.offset,
    };

    const { data, total } = await this.itemsService.search(filter);
    return toItemResponse(data, query, total);
  }

  async searchArticles(query: AgentArticleQuery): Promise<AgentArticleSearchResponse> {
    const categoryIds = query.categories
      ? await this.articlesService.resolveCategoriesByNames(query.categories)
      : [];

    const filter: ArticleFilter = {
      title: query.title,
      categoryIds: categoryIds.length ? categoryIds : undefined,
      includeCategories: query.includeCategories,
      includeContent: query.includeContent,
      limit: query.limit,
      offset: query.offset,
    };

    const { data, total } = await this.articlesService.search(filter);
    return toArticleSearchResponse(data, query, total);
  }
}
