import { SEARCH_CONFIG } from '@/common/config';
import type { PaginatedResponse } from '@/common/pagination';
import type { IncludeOptions, Move, MoveFilter } from './domain';
import type { MovesRepository } from './repository';

function shouldUseFuzzySearch(name?: string): boolean {
  if (!name || !SEARCH_CONFIG.USE_HYBRID) return true;
  return name.length > SEARCH_CONFIG.FUZZY_THRESHOLD;
}

export class MovesService {
  constructor(private movesRepository: MovesRepository) {}

  async search(filter: MoveFilter): Promise<PaginatedResponse<Move>> {
    const useFuzzy = shouldUseFuzzySearch(filter.name);
    const { data, total } = await this.movesRepository.searchMoves(filter, useFuzzy);
    return {
      data,
      total,
      limit: filter.limit ?? 20,
      offset: filter.offset ?? 0,
    };
  }

  async getByIdentifier(identifier: string, options?: IncludeOptions): Promise<Move | null> {
    return this.movesRepository.getByIdentifier(identifier, options);
  }

  async resolveByNames(names: string[]): Promise<number[]> {
    return this.movesRepository.fuzzyResolve(names);
  }

  async resolveCategoriesByNames(names: string[]): Promise<number[]> {
    return this.movesRepository.fuzzyResolveCategories(names);
  }
}
