import type { PaginatedResponse } from '@/common/pagination';
import type { Ability, AbilityFilter, IncludeOptions } from './domain';
import type { AbilitiesRepository } from './repository';

export class AbilitiesService {
  constructor(private abilitiesRepository: AbilitiesRepository) {}

  async search(filter: AbilityFilter): Promise<PaginatedResponse<Ability>> {
    const { data, total } = await this.abilitiesRepository.searchAbilities(filter);
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
}
