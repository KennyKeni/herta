import type { Article, ArticleFilter, IncludeOptions } from './domain';
import type { ArticlesRepository } from './repository';

export class ArticlesService {
  constructor(private articlesRepository: ArticlesRepository) {}

  async search(filter: ArticleFilter): Promise<Article[]> {
    return this.articlesRepository.searchArticles(filter);
  }

  async getByIdentifier(identifier: string, options?: IncludeOptions): Promise<Article | null> {
    return this.articlesRepository.getByIdentifier(identifier, options);
  }
}
