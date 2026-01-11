import { t } from 'elysia';
import { PaginatedResponseSchema } from '@/common/pagination';

export const IncludeOptionsSchema = t.Object({
  includeCategories: t.Optional(t.Boolean()),
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
});

export const ArticleModel = {
  searchQuery: ArticleSearchQuerySchema,
  searchResponse: PaginatedResponseSchema(ArticleSchema),
  getOneQuery: IncludeOptionsSchema,
  getOneResponse: ArticleSchema,
};
