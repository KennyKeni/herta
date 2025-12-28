import type { PokemonFilter, SpeciesWithForms } from './domain';
import type { PokemonRepository } from './repository';

export class PokemonService {
  constructor(private pokemonRepository: PokemonRepository) {}

  async search(filter: PokemonFilter): Promise<SpeciesWithForms[]> {
    return this.pokemonRepository.searchPokemon(filter);
  }
}
