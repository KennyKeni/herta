import type { IncludeOptions, PokemonFilter, SpeciesWithForm, SpeciesWithForms } from './domain';
import type { PokemonRepository } from './repository';

export class PokemonService {
  constructor(private pokemonRepository: PokemonRepository) {}

  async search(filter: PokemonFilter): Promise<SpeciesWithForms[]> {
    return this.pokemonRepository.searchByForm(filter);
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
