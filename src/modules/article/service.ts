import { SEARCH_CONFIG } from '@/common/config';
import type { PaginatedResponse } from '@/common/pagination';
import { generateUniqueSlug, slugFrom } from '@/common/utils/slug';
import type {
  Article,
  ArticleFilter,
  AttachImageToArticle,
  CreateArticle,
  CreatedArticle,
  IncludeOptions,
  UpdateArticle,
  UpdatedArticle,
} from './domain';
import type { ArticlesRepository } from './repository';

function shouldUseFuzzySearch(text?: string): boolean {
  if (!text || !SEARCH_CONFIG.USE_HYBRID) return true;
  return text.length > SEARCH_CONFIG.FUZZY_THRESHOLD;
}

export class ArticlesService {
  constructor(private articlesRepository: ArticlesRepository) {}

  async search(filter: ArticleFilter): Promise<PaginatedResponse<Article>> {
    const useFuzzy = shouldUseFuzzySearch(filter.title);
    const { data, total } = await this.articlesRepository.searchArticles(filter, useFuzzy);
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

  async createArticle(data: CreateArticle): Promise<CreatedArticle> {
    const baseSlug = slugFrom(data.title);
    const slug = await generateUniqueSlug(baseSlug, (s) =>
      this.articlesRepository.checkArticleExists(s)
    );

    return this.articlesRepository.createArticle(data, slug);
  }

  async updateArticle(identifier: string, data: UpdateArticle): Promise<UpdatedArticle | null> {
    let newSlug: string | undefined;
    if (data.title) {
      const baseSlug = slugFrom(data.title);
      const isId = /^\d+$/.test(identifier);
      const currentId = isId
        ? Number(identifier)
        : await this.articlesRepository.getArticleIdBySlug(identifier);

      if (currentId) {
        newSlug = await generateUniqueSlug(baseSlug, (s) =>
          this.articlesRepository.checkArticleSlugConflict(s, currentId)
        );
      }
    }

    return this.articlesRepository.updateArticle(identifier, data, newSlug);
  }

  async deleteArticle(identifier: string): Promise<boolean> {
    return this.articlesRepository.deleteArticle(identifier);
  }

  async attachImage(identifier: string, data: AttachImageToArticle): Promise<boolean> {
    const articleId = await this.resolveArticleId(identifier);
    if (!articleId) return false;

    await this.articlesRepository.attachImage(articleId, data);
    return true;
  }

  async detachImage(identifier: string, imageId: string): Promise<boolean> {
    const articleId = await this.resolveArticleId(identifier);
    if (!articleId) return false;

    return this.articlesRepository.detachImage(articleId, imageId);
  }

  private async resolveArticleId(identifier: string): Promise<number | null> {
    const isId = /^\d+$/.test(identifier);
    if (isId) return Number(identifier);
    return this.articlesRepository.getArticleIdBySlug(identifier);
  }

  async resolveCategoriesByNames(names: string[]): Promise<number[]> {
    return this.articlesRepository.fuzzyResolveCategories(names);
  }
}
