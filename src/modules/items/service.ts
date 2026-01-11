import type { PaginatedResponse } from '@/common/pagination';
import type { IncludeOptions, Item, ItemFilter } from './domain';
import type { ItemsRepository } from './repository';

export class ItemsService {
  constructor(private itemsRepository: ItemsRepository) {}

  async search(filter: ItemFilter): Promise<PaginatedResponse<Item>> {
    const { data, total } = await this.itemsRepository.searchItems(filter);
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
}
