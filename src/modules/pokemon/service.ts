import type { PaginatedResponse } from '@/common/pagination';
import type { IncludeOptions, PokemonFilter, SpeciesWithForm, SpeciesWithForms } from './domain';
import type { PokemonRepository } from './repository';

export class PokemonService {
  constructor(private pokemonRepository: PokemonRepository) {}

  async search(filter: PokemonFilter): Promise<PaginatedResponse<SpeciesWithForms>> {
    const { data, total } = await this.pokemonRepository.searchByForm(filter);
    return {
      data,
      total,
      limit: filter.limit ?? 20,
      offset: filter.offset ?? 0,
    };
  }

  async getByIdentifier(
    identifier: string,
    options?: IncludeOptions
  ): Promise<SpeciesWithForms | null> {
    return this.pokemonRepository.getByIdentifier(identifier, options);
  }

  async getFormByIdentifier(
    identifier: string,
    options?: IncludeOptions
  ): Promise<SpeciesWithForm | null> {
    return this.pokemonRepository.getFormByIdentifier(identifier, options);
  }
}
