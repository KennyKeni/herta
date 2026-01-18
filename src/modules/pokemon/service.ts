import { ConflictError } from '@/common/errors';
import type { PaginatedResponse } from '@/common/pagination';
import { shouldUseFuzzySearch, slugForPokemon } from '@/common/utils';
import { CACHE_KEYS } from '@/infrastructure/cache/keys';
import type { CacheService } from '@/infrastructure/cache/service';
import type {
  AttachImageToForm,
  AttachImageToSpecies,
  CreatedForm,
  CreatedSpecies,
  CreateForm,
  CreateSpecies,
  IncludeOptions,
  PokemonFilter,
  SpeciesWithForm,
  SpeciesWithForms,
  UpdatedForm,
  UpdatedSpecies,
  UpdateForm,
  UpdateSpecies,
} from './domain';
import type { PokemonRepository } from './repository';

export class PokemonService {
  constructor(
    private pokemonRepository: PokemonRepository,
    private cacheService: CacheService
  ) {}

  async search(filter: PokemonFilter): Promise<PaginatedResponse<SpeciesWithForms>> {
    const useFuzzy = shouldUseFuzzySearch(filter.name);
    const { data, total } = await this.pokemonRepository.searchByForm(filter, useFuzzy);
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

  async createSpecies(data: CreateSpecies): Promise<CreatedSpecies> {
    const slug = slugForPokemon(data.name);
    const { idExists, slugExists } = await this.pokemonRepository.checkSpeciesExists(data.id, slug);
    if (idExists) throw new ConflictError(`Species with id ${data.id} already exists`);
    if (slugExists) throw new ConflictError(`Species with slug '${slug}' already exists`);

    const result = await this.pokemonRepository.createSpecies(data, slug);
    await this.cacheService.deleteByPrefix(CACHE_KEYS.pokemon.search);
    return result;
  }

  async updateSpecies(identifier: string, data: UpdateSpecies): Promise<UpdatedSpecies | null> {
    let newSlug: string | undefined;
    if (data.name) {
      newSlug = slugForPokemon(data.name);
      const isId = /^\d+$/.test(identifier);
      const currentId = isId
        ? Number(identifier)
        : await this.pokemonRepository.getSpeciesIdBySlug(identifier);
      if (
        currentId &&
        (await this.pokemonRepository.checkSpeciesSlugConflict(newSlug, currentId))
      ) {
        throw new ConflictError(`Species with slug '${newSlug}' already exists`);
      }
    }

    const result = await this.pokemonRepository.updateSpecies(identifier, data, newSlug);
    if (result) {
      await this.cacheService.deleteByPrefix(CACHE_KEYS.pokemon.search);
      await this.cacheService.delete(CACHE_KEYS.pokemon.species(identifier));
    }
    return result;
  }

  async attachImageToSpecies(identifier: string, data: AttachImageToSpecies): Promise<boolean> {
    const speciesId = await this.resolveSpeciesId(identifier);
    if (!speciesId) return false;

    await this.pokemonRepository.attachImageToSpecies(speciesId, data);
    await this.cacheService.delete(CACHE_KEYS.pokemon.species(identifier));
    return true;
  }

  async detachImageFromSpecies(identifier: string, imageId: string): Promise<boolean> {
    const speciesId = await this.resolveSpeciesId(identifier);
    if (!speciesId) return false;

    const result = await this.pokemonRepository.detachImageFromSpecies(speciesId, imageId);
    if (result) {
      await this.cacheService.delete(CACHE_KEYS.pokemon.species(identifier));
    }
    return result;
  }

  private async resolveSpeciesId(identifier: string): Promise<number | null> {
    const isId = /^\d+$/.test(identifier);
    if (isId) return Number(identifier);
    return this.pokemonRepository.getSpeciesIdBySlug(identifier);
  }

  async createForm(data: CreateForm): Promise<CreatedForm> {
    const slug = slugForPokemon(data.name);
    const { idExists, slugExists } = await this.pokemonRepository.checkFormExists(data.id, slug);
    if (idExists) throw new ConflictError(`Form with id ${data.id} already exists`);
    if (slugExists) throw new ConflictError(`Form with slug '${slug}' already exists`);

    const result = await this.pokemonRepository.createForm(data, slug);
    await this.cacheService.deleteByPrefix(CACHE_KEYS.pokemon.search);
    return result;
  }

  async updateForm(identifier: string, data: UpdateForm): Promise<UpdatedForm | null> {
    let newSlug: string | undefined;
    if (data.name) {
      newSlug = slugForPokemon(data.name);
      const isId = /^\d+$/.test(identifier);
      const currentId = isId
        ? Number(identifier)
        : await this.pokemonRepository.getFormIdBySlug(identifier);
      if (currentId && (await this.pokemonRepository.checkFormSlugConflict(newSlug, currentId))) {
        throw new ConflictError(`Form with slug '${newSlug}' already exists`);
      }
    }

    const result = await this.pokemonRepository.updateForm(identifier, data, newSlug);
    if (result) {
      await this.cacheService.deleteByPrefix(CACHE_KEYS.pokemon.search);
      await this.cacheService.delete(CACHE_KEYS.pokemon.form(identifier));
    }
    return result;
  }

  async attachImageToForm(identifier: string, data: AttachImageToForm): Promise<boolean> {
    const formId = await this.resolveFormId(identifier);
    if (!formId) return false;

    await this.pokemonRepository.attachImageToForm(formId, data);
    await this.cacheService.delete(CACHE_KEYS.pokemon.form(identifier));
    return true;
  }

  async detachImageFromForm(identifier: string, imageId: string): Promise<boolean> {
    const formId = await this.resolveFormId(identifier);
    if (!formId) return false;

    const result = await this.pokemonRepository.detachImageFromForm(formId, imageId);
    if (result) {
      await this.cacheService.delete(CACHE_KEYS.pokemon.form(identifier));
    }
    return result;
  }

  private async resolveFormId(identifier: string): Promise<number | null> {
    const isId = /^\d+$/.test(identifier);
    if (isId) return Number(identifier);
    return this.pokemonRepository.getFormIdBySlug(identifier);
  }

  async deleteSpecies(identifier: string): Promise<boolean> {
    const result = await this.pokemonRepository.deleteSpecies(identifier);
    if (result) {
      await this.cacheService.deleteByPrefix(CACHE_KEYS.pokemon.search);
      await this.cacheService.delete(CACHE_KEYS.pokemon.species(identifier));
    }
    return result;
  }

  async deleteForm(identifier: string): Promise<boolean> {
    const result = await this.pokemonRepository.deleteForm(identifier);
    if (result) {
      await this.cacheService.deleteByPrefix(CACHE_KEYS.pokemon.search);
      await this.cacheService.delete(CACHE_KEYS.pokemon.form(identifier));
    }
    return result;
  }

  async resolveEggGroupsByNames(names: string[]): Promise<number[]> {
    return this.pokemonRepository.fuzzyResolveEggGroups(names);
  }

  async resolveLabelsByNames(names: string[]): Promise<number[]> {
    return this.pokemonRepository.fuzzyResolveLabels(names);
  }
}
