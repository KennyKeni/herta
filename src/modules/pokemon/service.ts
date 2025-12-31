import type { IncludeOptions, PokemonFilter, SpeciesWithForms } from './domain';
import type { PokemonRepository } from './repository';

export class PokemonService {
  constructor(private pokemonRepository: PokemonRepository) {}

  async search(filter: PokemonFilter): Promise<SpeciesWithForms[]> {
    return this.pokemonRepository.searchPokemon(filter);
  }

  async getByIdentifier(
    identifier: string,
    options?: IncludeOptions
  ): Promise<SpeciesWithForms | null> {
    return this.pokemonRepository.getByIdentifier(identifier, options);
  }
}
