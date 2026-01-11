import type { PaginatedResponse } from '@/common/pagination';
import type { Spawn, SpawnFilter } from './domain';
import type { SpawnRepository } from './repository';

export class SpawnsService {
  constructor(private spawnRepository: SpawnRepository) {}

  async search(filter: SpawnFilter): Promise<PaginatedResponse<Spawn>> {
    if (!filter.formIds?.length) {
      return {
        data: [],
        total: 0,
        limit: filter.limit ?? 20,
        offset: filter.offset ?? 0,
      };
    }

    const { data, total } = await this.spawnRepository.searchSpawns(filter);

    return {
      data,
      total,
      limit: filter.limit ?? 20,
      offset: filter.offset ?? 0,
    };
  }
}
