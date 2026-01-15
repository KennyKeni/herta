import { SEARCH_CONFIG } from '@/common/config';
import type { PaginatedResponse } from '@/common/pagination';
import type { IncludeOptions, Type, TypeDetail, TypeFilter } from './domain';
import type { TypesRepository } from './repository';

function shouldUseFuzzySearch(name?: string): boolean {
  if (!name || !SEARCH_CONFIG.USE_HYBRID) return true;
  return name.length > SEARCH_CONFIG.FUZZY_THRESHOLD;
}

export class TypesService {
  constructor(private typesRepository: TypesRepository) {}

  async search(filter: TypeFilter): Promise<PaginatedResponse<Type>> {
    const useFuzzy = shouldUseFuzzySearch(filter.name);
    const { data, total } = await this.typesRepository.searchTypes(filter, useFuzzy);
    return {
      data,
      total,
      limit: filter.limit ?? 20,
      offset: filter.offset ?? 0,
    };
  }

  async getByIdentifier(identifier: string, options?: IncludeOptions): Promise<TypeDetail | null> {
    return this.typesRepository.getByIdentifierWithDetails(identifier, options);
  }

  async resolveByNames(names: string[]): Promise<number[]> {
    return this.typesRepository.fuzzyResolve(names);
  }
}
