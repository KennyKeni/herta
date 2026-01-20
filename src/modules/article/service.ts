import { SEARCH_CONFIG } from '@/common/config';
import type { PaginatedResponse } from '@/common/pagination';
import { generateUniqueSlug, slugFrom } from '@/common/utils/slug';
import { tiptapToHtml } from '@/common/utils/tiptap';
import { CACHE_KEYS } from '@/infrastructure/cache/keys';
import type { CacheService } from '@/infrastructure/cache/service';
import type {
  Article,
  ArticleCategory,
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
  constructor(
    private articlesRepository: ArticlesRepository,
    private cacheService: CacheService
  ) {}

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

    const contentHtml = data.content ? tiptapToHtml(data.content) : null;
    const result = await this.articlesRepository.createArticle(data, slug, contentHtml);
    await this.cacheService.deleteByPrefix(CACHE_KEYS.articles.search);
    return result;
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

    const contentHtml = data.content ? tiptapToHtml(data.content) : undefined;
    const result = await this.articlesRepository.updateArticle(
      identifier,
      data,
      newSlug,
      contentHtml
    );
    if (result) {
      await this.cacheService.deleteByPrefix(CACHE_KEYS.articles.search);
      await this.cacheService.delete(CACHE_KEYS.articles.article(identifier));
    }
    return result;
  }

  async deleteArticle(identifier: string): Promise<boolean> {
    const result = await this.articlesRepository.deleteArticle(identifier);
    if (result) {
      await this.cacheService.deleteByPrefix(CACHE_KEYS.articles.search);
      await this.cacheService.delete(CACHE_KEYS.articles.article(identifier));
    }
    return result;
  }

  async attachImage(identifier: string, data: AttachImageToArticle): Promise<boolean> {
    const articleId = await this.resolveArticleId(identifier);
    if (!articleId) return false;

    await this.articlesRepository.attachImage(articleId, data);
    await this.cacheService.delete(CACHE_KEYS.articles.article(identifier));
    return true;
  }

  async detachImage(identifier: string, imageId: string): Promise<boolean> {
    const articleId = await this.resolveArticleId(identifier);
    if (!articleId) return false;

    const result = await this.articlesRepository.detachImage(articleId, imageId);
    if (result) {
      await this.cacheService.delete(CACHE_KEYS.articles.article(identifier));
    }
    return result;
  }

  private async resolveArticleId(identifier: string): Promise<number | null> {
    const isId = /^\d+$/.test(identifier);
    if (isId) return Number(identifier);
    return this.articlesRepository.getArticleIdBySlug(identifier);
  }

  async resolveCategoriesByNames(names: string[]): Promise<number[]> {
    return this.articlesRepository.fuzzyResolveCategories(names);
  }

  async getAllCategories(): Promise<ArticleCategory[]> {
    return this.articlesRepository.getAllCategories();
  }
}
