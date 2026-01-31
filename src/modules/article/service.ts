import { SEARCH_CONFIG } from '@/common/config';
import type { PaginatedResponse } from '@/common/pagination';
import { generateUniqueSlug, slugFrom } from '@/common/utils/slug';
import { tiptapToHtml } from '@/common/utils/tiptap';
import { CACHE_KEYS } from '@/infrastructure/cache/keys';
import type { CacheService } from '@/infrastructure/cache/service';
import { withTransaction } from '@/infrastructure/db';
import { EntityType, Operation } from '@/infrastructure/outbox/domain';
import type { OutboxService } from '@/infrastructure/outbox/service';
import type {
  Article,
  ArticleCategory,
  ArticleFilter,
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
    private cacheService: CacheService,
    private outboxService: OutboxService
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
    const result = await withTransaction(async (trx) => {
      const repo = this.articlesRepository.withTransaction(trx);
      const outbox = this.outboxService.withTransaction(trx);
      const created = await repo.createArticle(data, slug, contentHtml);
      await outbox.record(EntityType.ARTICLE, String(created.id), Operation.CREATE);
      return created;
    });
    await this.cacheService.deleteByGroup(CACHE_KEYS.articles.searchGroup);
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
    const result = await withTransaction(async (trx) => {
      const repo = this.articlesRepository.withTransaction(trx);
      const outbox = this.outboxService.withTransaction(trx);
      const updated = await repo.updateArticle(identifier, data, newSlug, contentHtml);
      if (updated) {
        await outbox.record(EntityType.ARTICLE, String(updated.id), Operation.UPDATE);
      }
      return updated;
    });
    if (result) {
      await this.cacheService.deleteByGroup(CACHE_KEYS.articles.searchGroup);
      await this.cacheService.deleteByGroup(CACHE_KEYS.articles.articleGroup(identifier));
    }
    return result;
  }

  async deleteArticle(identifier: string): Promise<boolean> {
    const articleId = await this.resolveArticleId(identifier);
    if (!articleId) return false;

    const result = await withTransaction(async (trx) => {
      const repo = this.articlesRepository.withTransaction(trx);
      const outbox = this.outboxService.withTransaction(trx);
      const deleted = await repo.deleteArticle(identifier);
      if (deleted) {
        await outbox.record(EntityType.ARTICLE, String(articleId), Operation.DELETE);
      }
      return deleted;
    });
    if (result) {
      await this.cacheService.deleteByGroup(CACHE_KEYS.articles.searchGroup);
      await this.cacheService.deleteByGroup(CACHE_KEYS.articles.articleGroup(identifier));
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
