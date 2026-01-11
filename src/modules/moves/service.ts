import type { PaginatedResponse } from '@/common/pagination';
import type { IncludeOptions, Move, MoveFilter } from './domain';
import type { MovesRepository } from './repository';

export class MovesService {
  constructor(private movesRepository: MovesRepository) {}

  async search(filter: MoveFilter): Promise<PaginatedResponse<Move>> {
    const { data, total } = await this.movesRepository.searchMoves(filter);
    return {
      data,
      total,
      limit: filter.limit ?? 20,
      offset: filter.offset ?? 0,
    };
  }

  async getByIdentifier(identifier: string, options?: IncludeOptions): Promise<Move | null> {
    return this.movesRepository.getByIdentifier(identifier, options);
  }
}
