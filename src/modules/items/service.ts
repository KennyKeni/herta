import { SEARCH_CONFIG } from '@/common/config';
import type { PaginatedResponse } from '@/common/pagination';
import type { IncludeOptions, Item, ItemFilter } from './domain';
import type { ItemsRepository } from './repository';

function shouldUseFuzzySearch(name?: string): boolean {
  if (!name || !SEARCH_CONFIG.USE_HYBRID) return true;
  return name.length > SEARCH_CONFIG.FUZZY_THRESHOLD;
}

export class ItemsService {
  constructor(private itemsRepository: ItemsRepository) {}

  async search(filter: ItemFilter): Promise<PaginatedResponse<Item>> {
    const useFuzzy = shouldUseFuzzySearch(filter.name);
    const { data, total } = await this.itemsRepository.searchItems(filter, useFuzzy);
    return {
      data,
      total,
      limit: filter.limit ?? 20,
      offset: filter.offset ?? 0,
    };
  }

  async getByIdentifier(identifier: string, options?: IncludeOptions): Promise<Item | null> {
    return this.itemsRepository.getByIdentifier(identifier, options);
  }

  async resolveByNames(names: string[]): Promise<number[]> {
    return this.itemsRepository.fuzzyResolve(names);
  }

  async resolveTagsByNames(names: string[]): Promise<number[]> {
    return this.itemsRepository.fuzzyResolveTags(names);
  }
}
