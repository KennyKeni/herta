import type { IncludeOptions, Item, ItemFilter } from './domain';
import type { ItemsRepository } from './repository';

export class ItemsService {
  constructor(private itemsRepository: ItemsRepository) {}

  async search(filter: ItemFilter): Promise<Item[]> {
    return this.itemsRepository.searchItems(filter);
  }

  async getByIdentifier(identifier: string, options?: IncludeOptions): Promise<Item | null> {
    return this.itemsRepository.getByIdentifier(identifier, options);
  }
}
