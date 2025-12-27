import { PokemonFilter, SpeciesWithForms } from './domain';
import { PokemonRepository } from './repository';

export class PokemonService {
  constructor(private pokemonRepository: PokemonRepository) {}

  async search(filter: PokemonFilter): Promise<SpeciesWithForms[]> {
    return this.pokemonRepository.searchPokemon(filter);
  }
}
