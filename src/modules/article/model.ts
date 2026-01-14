import { t } from 'elysia';
import { PaginatedResponseSchema } from '@/common/pagination';

export const IncludeOptionsSchema = t.Object({
  includeCategories: t.Optional(t.Boolean()),
  includeImages: t.Optional(t.Boolean()),
});

const ArticleFilterSchema = t.Object({
  title: t.Optional(t.String()),
  articleIds: t.Optional(t.Array(t.Number())),
  articleSlugs: t.Optional(t.Array(t.String())),
  categoryIds: t.Optional(t.Array(t.Number())),
  categorySlugs: t.Optional(t.Array(t.String())),
  author: t.Optional(t.String()),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
  offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
});

export const ArticleSearchQuerySchema = t.Composite([IncludeOptionsSchema, ArticleFilterSchema]);

const ArticleCategorySchema = t.Object({
  id: t.Number(),
  slug: t.String(),
  name: t.String(),
  description: t.Nullable(t.String()),
});

const ArticleImageSchema = t.Object({
  id: t.Number(),
  key: t.String(),
  contentType: t.String(),
  isCover: t.Boolean(),
});

const ArticleSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
  title: t.String(),
  subtitle: t.Nullable(t.String()),
  description: t.Nullable(t.String()),
  body: t.String(),
  author: t.Nullable(t.String()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  categories: t.Array(ArticleCategorySchema),
  images: t.Array(ArticleImageSchema),
});

const CreateArticleBodySchema = t.Object({
  title: t.String({ minLength: 1 }),
  subtitle: t.Optional(t.Nullable(t.String())),
  description: t.Optional(t.Nullable(t.String())),
  body: t.String({ minLength: 1 }),
  author: t.Optional(t.Nullable(t.String())),
  categoryIds: t.Optional(t.Array(t.Number())),
});

const UpdateArticleBodySchema = t.Object({
  title: t.Optional(t.String({ minLength: 1 })),
  subtitle: t.Optional(t.Nullable(t.String())),
  description: t.Optional(t.Nullable(t.String())),
  body: t.Optional(t.String({ minLength: 1 })),
  author: t.Optional(t.Nullable(t.String())),
  categoryIds: t.Optional(t.Array(t.Number())),
});

const CreatedArticleSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
});

const UpdatedArticleSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
});

const UploadUrlBodySchema = t.Object({
  contentType: t.String(),
  isCover: t.Optional(t.Boolean()),
});

const UploadUrlResponseSchema = t.Object({
  url: t.String(),
  key: t.String(),
  imageId: t.Number(),
});

const ArticleImageDetailSchema = t.Object({
  id: t.Number(),
  articleId: t.Number(),
  key: t.String(),
  status: t.Union([t.Literal('pending'), t.Literal('uploaded')]),
  contentType: t.String(),
  isCover: t.Boolean(),
  createdAt: t.Date(),
  confirmedAt: t.Nullable(t.Date()),
});

export const ArticleModel = {
  searchQuery: ArticleSearchQuerySchema,
  searchResponse: PaginatedResponseSchema(ArticleSchema),
  getOneQuery: IncludeOptionsSchema,
  getOneResponse: ArticleSchema,
  createBody: CreateArticleBodySchema,
  createResponse: CreatedArticleSchema,
  updateBody: UpdateArticleBodySchema,
  updateResponse: UpdatedArticleSchema,
  uploadUrlBody: UploadUrlBodySchema,
  uploadUrlResponse: UploadUrlResponseSchema,
  imageResponse: ArticleImageDetailSchema,
};
