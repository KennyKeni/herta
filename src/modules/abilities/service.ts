import { SEARCH_CONFIG } from '@/common/config';
import type { PaginatedResponse } from '@/common/pagination';
import type { Ability, AbilityFilter, IncludeOptions } from './domain';
import type { AbilitiesRepository } from './repository';

function shouldUseFuzzySearch(name?: string): boolean {
  if (!name || !SEARCH_CONFIG.USE_HYBRID) return true;
  return name.length > SEARCH_CONFIG.FUZZY_THRESHOLD;
}

export class AbilitiesService {
  constructor(private abilitiesRepository: AbilitiesRepository) {}

  async search(filter: AbilityFilter): Promise<PaginatedResponse<Ability>> {
    const useFuzzy = shouldUseFuzzySearch(filter.name);
    const { data, total } = await this.abilitiesRepository.searchAbilities(filter, useFuzzy);
    return {
      data,
      total,
      limit: filter.limit ?? 20,
      offset: filter.offset ?? 0,
    };
  }

  async getByIdentifier(identifier: string, options?: IncludeOptions): Promise<Ability | null> {
    return this.abilitiesRepository.getByIdentifier(identifier, options);
  }

  async resolveByNames(names: string[]): Promise<number[]> {
    return this.abilitiesRepository.fuzzyResolve(names);
  }
}
