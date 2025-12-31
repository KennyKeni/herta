import type { IncludeOptions, Move, MoveFilter } from './domain';
import type { MovesRepository } from './repository';

export class MovesService {
  constructor(private movesRepository: MovesRepository) {}

  async search(filter: MoveFilter): Promise<Move[]> {
    return this.movesRepository.searchMoves(filter);
  }

  async getByIdentifier(identifier: string, options?: IncludeOptions): Promise<Move | null> {
    return this.movesRepository.getByIdentifier(identifier, options);
  }
}
