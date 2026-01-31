import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { ConflictError } from '@/common/errors';
import { createMockCacheService } from '@/test/mocks/cache-service';
import { createMockOutboxService } from '@/test/mocks/outbox-service';
import type { PokemonRepository } from '../repository';
import { PokemonService } from '../service';

function createMockRepository(overrides: Partial<PokemonRepository> = {}): PokemonRepository {
  const repo = {
    searchByForm: mock(async () => ({ data: [], total: 0 })),
    getByIdentifier: mock(async () => null),
    getFormByIdentifier: mock(async () => null),
    checkSpeciesExists: mock(async () => ({ idExists: false, slugExists: false })),
    checkFormExists: mock(async () => ({ idExists: false, slugExists: false })),
    checkSpeciesSlugConflict: mock(async () => false),
    checkFormSlugConflict: mock(async () => false),
    createSpecies: mock(async () => ({ id: 1, slug: 'bulbasaur' })),
    createForm: mock(async () => ({ id: 1, slug: 'bulbasaur' })),
    updateSpecies: mock(async () => ({ id: 1, slug: 'bulbasaur' })),
    updateForm: mock(async () => ({ id: 1, slug: 'bulbasaur' })),
    setSpeciesImage: mock(async () => true),
    setFormImage: mock(async () => true),
    deleteSpecies: mock(async () => true),
    deleteForm: mock(async () => true),
    getSpeciesIdBySlug: mock(async () => 1),
    getFormIdBySlug: mock(async () => 1),
    fuzzyResolveEggGroups: mock(async () => []),
    fuzzyResolveLabels: mock(async () => []),
    ...overrides,
  } as unknown as PokemonRepository;
  repo.withTransaction = mock(() => repo);
  return repo;
}

describe('PokemonService', () => {
  let service: PokemonService;
  let mockRepo: PokemonRepository;
  let mockCache: ReturnType<typeof createMockCacheService>;

  beforeEach(() => {
    mockRepo = createMockRepository();
    mockCache = createMockCacheService();
    service = new PokemonService(mockRepo, mockCache, createMockOutboxService());
  });

  describe('search', () => {
    it('returns paginated response with defaults', async () => {
      const result = await service.search({});
      expect(result).toEqual({ data: [], total: 0, limit: 20, offset: 0 });
    });

    it('uses provided limit and offset', async () => {
      const result = await service.search({ limit: 10, offset: 5 });
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(5);
    });

    it('passes filter to repository', async () => {
      await service.search({ generation: 1, limit: 5 });
      expect(mockRepo.searchByForm).toHaveBeenCalledTimes(1);
    });
  });

  describe('getByIdentifier', () => {
    it('delegates to repository', async () => {
      await service.getByIdentifier('bulbasaur');
      expect(mockRepo.getByIdentifier).toHaveBeenCalledWith('bulbasaur', undefined);
    });
  });

  describe('getFormByIdentifier', () => {
    it('delegates to repository', async () => {
      await service.getFormByIdentifier('bulbasaur', { includeTypes: true });
      expect(mockRepo.getFormByIdentifier).toHaveBeenCalledWith('bulbasaur', {
        includeTypes: true,
      });
    });
  });

  describe('createSpecies', () => {
    it('creates species with generated slug', async () => {
      const result = await service.createSpecies({
        id: 1,
        name: 'Bulbasaur',
        generation: 1,
        catchRate: 45,
        baseFriendship: 50,
        eggCycles: 20,
      });
      expect(result).toEqual({ id: 1, slug: 'bulbasaur' });
      expect(mockRepo.createSpecies).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictError when species id exists', async () => {
      mockRepo = createMockRepository({
        checkSpeciesExists: mock(async () => ({ idExists: true, slugExists: false })),
      });
      service = new PokemonService(mockRepo, mockCache, createMockOutboxService());

      expect(
        service.createSpecies({
          id: 1,
          name: 'Bulbasaur',
          generation: 1,
          catchRate: 45,
          baseFriendship: 50,
          eggCycles: 20,
        })
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it('throws ConflictError when species slug exists', async () => {
      mockRepo = createMockRepository({
        checkSpeciesExists: mock(async () => ({ idExists: false, slugExists: true })),
      });
      service = new PokemonService(mockRepo, mockCache, createMockOutboxService());

      expect(
        service.createSpecies({
          id: 2,
          name: 'Bulbasaur',
          generation: 1,
          catchRate: 45,
          baseFriendship: 50,
          eggCycles: 20,
        })
      ).rejects.toBeInstanceOf(ConflictError);
    });
  });

  describe('updateSpecies', () => {
    it('returns null when species not found', async () => {
      mockRepo = createMockRepository({
        updateSpecies: mock(async () => null),
      });
      service = new PokemonService(mockRepo, mockCache, createMockOutboxService());

      const result = await service.updateSpecies('999', { generation: 2 });
      expect(result).toBeNull();
    });

    it('updates species without slug change', async () => {
      const result = await service.updateSpecies('1', { generation: 2 });
      expect(result).toEqual({ id: 1, slug: 'bulbasaur' });
    });

    it('throws ConflictError on slug conflict when renaming', async () => {
      mockRepo = createMockRepository({
        checkSpeciesSlugConflict: mock(async () => true),
      });
      service = new PokemonService(mockRepo, mockCache, createMockOutboxService());

      expect(service.updateSpecies('1', { name: 'Ivysaur' })).rejects.toBeInstanceOf(ConflictError);
    });
  });

  describe('createForm', () => {
    it('creates form with generated slug', async () => {
      const result = await service.createForm({
        id: 1,
        speciesId: 1,
        name: 'Bulbasaur',
        formName: 'Normal',
        height: 7,
        weight: 69,
        baseHp: 45,
        baseAttack: 49,
        baseDefence: 49,
        baseSpecialAttack: 65,
        baseSpecialDefence: 65,
        baseSpeed: 45,
      });
      expect(result).toEqual({ id: 1, slug: 'bulbasaur' });
    });

    it('throws ConflictError when form id exists', async () => {
      mockRepo = createMockRepository({
        checkFormExists: mock(async () => ({ idExists: true, slugExists: false })),
      });
      service = new PokemonService(mockRepo, mockCache, createMockOutboxService());

      expect(
        service.createForm({
          id: 1,
          speciesId: 1,
          name: 'Bulbasaur',
          formName: 'Normal',
          height: 7,
          weight: 69,
          baseHp: 45,
          baseAttack: 49,
          baseDefence: 49,
          baseSpecialAttack: 65,
          baseSpecialDefence: 65,
          baseSpeed: 45,
        })
      ).rejects.toBeInstanceOf(ConflictError);
    });
  });

  describe('updateForm', () => {
    it('returns null when form not found', async () => {
      mockRepo = createMockRepository({
        updateForm: mock(async () => null),
      });
      service = new PokemonService(mockRepo, mockCache, createMockOutboxService());

      const result = await service.updateForm('999', { height: 10 });
      expect(result).toBeNull();
    });

    it('throws ConflictError on slug conflict when renaming', async () => {
      mockRepo = createMockRepository({
        checkFormSlugConflict: mock(async () => true),
      });
      service = new PokemonService(mockRepo, mockCache, createMockOutboxService());

      expect(service.updateForm('1', { name: 'Ivysaur' })).rejects.toBeInstanceOf(ConflictError);
    });
  });

  describe('setSpeciesImage', () => {
    it('sets image by numeric id', async () => {
      const result = await service.setSpeciesImage('1', 'img-123');
      expect(result).toBe(true);
      expect(mockRepo.setSpeciesImage).toHaveBeenCalledWith(1, 'img-123');
    });

    it('resolves slug to id before setting image', async () => {
      const result = await service.setSpeciesImage('bulbasaur', 'img-123');
      expect(result).toBe(true);
      expect(mockRepo.getSpeciesIdBySlug).toHaveBeenCalledWith('bulbasaur');
    });

    it('returns false when slug not found', async () => {
      mockRepo = createMockRepository({
        getSpeciesIdBySlug: mock(async () => null),
      });
      service = new PokemonService(mockRepo, mockCache, createMockOutboxService());

      const result = await service.setSpeciesImage('nonexistent', 'img-123');
      expect(result).toBe(false);
    });
  });

  describe('setFormImage', () => {
    it('sets image by numeric id', async () => {
      const result = await service.setFormImage('1', 'img-123');
      expect(result).toBe(true);
      expect(mockRepo.setFormImage).toHaveBeenCalledWith(1, 'img-123');
    });

    it('returns false when slug not found', async () => {
      mockRepo = createMockRepository({
        getFormIdBySlug: mock(async () => null),
      });
      service = new PokemonService(mockRepo, mockCache, createMockOutboxService());

      const result = await service.setFormImage('nonexistent', 'img-123');
      expect(result).toBe(false);
    });
  });

  describe('deleteSpecies', () => {
    it('delegates to repository', async () => {
      const result = await service.deleteSpecies('bulbasaur');
      expect(result).toBe(true);
      expect(mockRepo.deleteSpecies).toHaveBeenCalledWith('bulbasaur');
    });

    it('returns false when not found', async () => {
      mockRepo = createMockRepository({
        deleteSpecies: mock(async () => false),
      });
      service = new PokemonService(mockRepo, mockCache, createMockOutboxService());

      const result = await service.deleteSpecies('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('deleteForm', () => {
    it('delegates to repository', async () => {
      const result = await service.deleteForm('bulbasaur');
      expect(result).toBe(true);
      expect(mockRepo.deleteForm).toHaveBeenCalledWith('bulbasaur');
    });

    it('returns false when not found', async () => {
      mockRepo = createMockRepository({
        deleteForm: mock(async () => false),
      });
      service = new PokemonService(mockRepo, mockCache, createMockOutboxService());

      const result = await service.deleteForm('nonexistent');
      expect(result).toBe(false);
    });
  });
});
