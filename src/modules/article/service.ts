import { SEARCH_CONFIG } from '@/common/config';
import { ConflictError } from '@/common/errors';
import type { PaginatedResponse } from '@/common/pagination';
import { slugFrom } from '@/common/utils/slug';
import type { S3Service } from '@/infrastructure/s3/service';
import type {
  Article,
  ArticleFilter,
  ArticleImage,
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
    private s3Service: S3Service
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
    const slug = slugFrom(data.title);
    const exists = await this.articlesRepository.checkArticleExists(slug);
    if (exists) throw new ConflictError(`Article with slug '${slug}' already exists`);

    return this.articlesRepository.createArticle(data, slug);
  }

  async updateArticle(identifier: string, data: UpdateArticle): Promise<UpdatedArticle | null> {
    let newSlug: string | undefined;
    if (data.title) {
      newSlug = slugFrom(data.title);
      const isId = /^\d+$/.test(identifier);
      const currentId = isId
        ? Number(identifier)
        : await this.articlesRepository.getArticleIdBySlug(identifier);
      if (
        currentId &&
        (await this.articlesRepository.checkArticleSlugConflict(newSlug, currentId))
      ) {
        throw new ConflictError(`Article with slug '${newSlug}' already exists`);
      }
    }

    return this.articlesRepository.updateArticle(identifier, data, newSlug);
  }

  async deleteArticle(identifier: string): Promise<boolean> {
    return this.articlesRepository.deleteArticle(identifier);
  }

  async getUploadUrl(
    identifier: string,
    contentType: string,
    isCover?: boolean
  ): Promise<{ url: string; key: string; imageId: number } | null> {
    const isId = /^\d+$/.test(identifier);
    let articleId: number | null;
    let slug: string | null;

    if (isId) {
      articleId = Number(identifier);
      slug = await this.articlesRepository.getArticleSlugById(articleId);
    } else {
      slug = identifier;
      articleId = await this.articlesRepository.getArticleIdBySlug(identifier);
    }

    if (!articleId || !slug) return null;

    const timestamp = Date.now();
    const key = `articles/${slug}/${timestamp}.png`;

    const image = await this.articlesRepository.createArticleImage({
      articleId,
      key,
      contentType,
      isCover,
    });

    const url = await this.s3Service.getUploadUrl(key, contentType);
    return { url, key, imageId: image.id };
  }

  async confirmImage(imageId: number): Promise<ArticleImage | null> {
    const confirmed = await this.articlesRepository.confirmArticleImage(imageId);
    if (!confirmed) return null;

    return this.articlesRepository.getArticleImageById(imageId);
  }

  async deleteImage(imageId: number): Promise<boolean> {
    const image = await this.articlesRepository.getArticleImageById(imageId);
    if (!image) return false;

    const deleted = await this.articlesRepository.deleteArticleImage(imageId);
    if (deleted) {
      await this.s3Service.deleteObject(image.key);
    }
    return deleted;
  }

  async getImage(imageId: number): Promise<ArticleImage | null> {
    return this.articlesRepository.getArticleImageById(imageId);
  }

  async resolveCategoriesByNames(names: string[]): Promise<number[]> {
    return this.articlesRepository.fuzzyResolveCategories(names);
  }
}
