import type { Article, ArticleFilter, IncludeOptions } from './domain';
import type { ArticleRepository } from './repository';

export class ArticleService {
  constructor(private articleRepository: ArticleRepository) {}

  async search(filter: ArticleFilter): Promise<Article[]> {
    return this.articleRepository.searchArticles(filter);
  }

  async getByIdentifier(identifier: string, options?: IncludeOptions): Promise<Article | null> {
    return this.articleRepository.getByIdentifier(identifier, options);
  }
}
