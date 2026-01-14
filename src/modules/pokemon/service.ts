import { ConflictError } from '@/common/errors';
import type { PaginatedResponse } from '@/common/pagination';
import { shouldUseFuzzySearch, slugForPokemon } from '@/common/utils';
import type { S3Service } from '@/infrastructure/s3/service';
import type {
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
    private s3Service: S3Service
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

    return this.pokemonRepository.createSpecies(data, slug);
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

    return this.pokemonRepository.updateSpecies(identifier, data, newSlug);
  }

  async getSpeciesUploadUrl(
    identifier: string,
    contentType: string
  ): Promise<{ url: string; key: string } | null> {
    const isId = /^\d+$/.test(identifier);
    let slug: string | null;

    if (isId) {
      slug = await this.pokemonRepository.getSpeciesSlugById(Number(identifier));
    } else {
      slug = identifier;
    }

    if (!slug) return null;

    const key = `pokemon/${slug}/sprite.png`;
    const url = await this.s3Service.getUploadUrl(key, contentType);
    return { url, key };
  }

  async createForm(data: CreateForm): Promise<CreatedForm> {
    const slug = slugForPokemon(data.name);
    const { idExists, slugExists } = await this.pokemonRepository.checkFormExists(data.id, slug);
    if (idExists) throw new ConflictError(`Form with id ${data.id} already exists`);
    if (slugExists) throw new ConflictError(`Form with slug '${slug}' already exists`);

    return this.pokemonRepository.createForm(data, slug);
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

    return this.pokemonRepository.updateForm(identifier, data, newSlug);
  }

  async getFormUploadUrl(
    identifier: string,
    contentType: string
  ): Promise<{ url: string; key: string } | null> {
    const result = await this.pokemonRepository.getFormWithSpeciesSlug(identifier);
    if (!result) return null;

    const key = `pokemon/${result.speciesSlug}/${result.formSlug}/sprite.png`;
    const url = await this.s3Service.getUploadUrl(key, contentType);
    return { url, key };
  }

  async deleteSpecies(identifier: string): Promise<boolean> {
    return this.pokemonRepository.deleteSpecies(identifier);
  }

  async deleteForm(identifier: string): Promise<boolean> {
    return this.pokemonRepository.deleteForm(identifier);
  }
}
