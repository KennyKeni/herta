import type { PaginatedResponse } from '@/common/pagination';
import type { IncludeOptions, Type, TypeDetail, TypeFilter } from './domain';
import type { TypesRepository } from './repository';

export class TypesService {
  constructor(private typesRepository: TypesRepository) {}

  async search(filter: TypeFilter): Promise<PaginatedResponse<Type>> {
    const { data, total } = await this.typesRepository.searchTypes(filter);
    return {
      data,
      total,
      limit: filter.limit ?? 20,
      offset: filter.offset ?? 0,
    };
  }

  async getByIdentifier(identifier: string, options?: IncludeOptions): Promise<TypeDetail | null> {
    return this.typesRepository.getByIdentifierWithDetails(identifier, options);
  }
}
