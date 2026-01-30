import type { CacheService } from '@/infrastructure/cache/service';

export function createMockCacheService(): CacheService {
  return {
    get: async () => null,
    set: async () => {},
    getOrSet: async <T>(_key: string, fn: () => Promise<T>) => fn(),
    delete: async () => false,
    deleteByPrefix: async () => 0,
    deleteByGroup: async () => 0,
  } as unknown as CacheService;
}
