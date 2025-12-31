import type { Ability, AbilityFilter, IncludeOptions } from './domain';
import type { AbilitiesRepository } from './repository';

export class AbilitiesService {
  constructor(private abilitiesRepository: AbilitiesRepository) {}

  async search(filter: AbilityFilter): Promise<Ability[]> {
    return this.abilitiesRepository.searchAbilities(filter);
  }

  async getByIdentifier(identifier: string, options?: IncludeOptions): Promise<Ability | null> {
    return this.abilitiesRepository.getByIdentifier(identifier, options);
  }
}
