import type { PaginatedResponse } from '@/common/pagination';
import type { Article, ArticleFilter, IncludeOptions } from './domain';
import type { ArticlesRepository } from './repository';

export class ArticlesService {
  constructor(private articlesRepository: ArticlesRepository) {}

  async search(filter: ArticleFilter): Promise<PaginatedResponse<Article>> {
    const { data, total } = await this.articlesRepository.searchArticles(filter);
    return {
      data,
      total,
      limit: filter.limit ?? 20,
      offset: filter.offset ?? 0,
    };
  }

  async getByIdentifier(identifier: string, options?: IncludeOptions): Promise<Article | null> {
    return this.articlesRepository.getByIdentifier(identifier, options);
  }
}
