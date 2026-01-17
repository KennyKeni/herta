import { t } from 'elysia';
import { PaginatedResponseSchema } from '@/common/pagination';

const MAX_CONTENT_SIZE = 100 * 1024; // 100KB

const TiptapContentSchema = t
  .Transform(
    t.Object({
      type: t.Literal('doc'),
      content: t.Optional(t.Array(t.Unknown())),
    })
  )
  .Decode((value) => {
    const size = JSON.stringify(value).length;
    if (size > MAX_CONTENT_SIZE) {
      throw new Error(`Content exceeds maximum size of ${MAX_CONTENT_SIZE} bytes`);
    }
    return value;
  })
  .Encode((value) => value);

export const IncludeOptionsSchema = t.Object({
  includeCategories: t.Optional(t.Boolean()),
  includeImages: t.Optional(t.Boolean()),
  includeContent: t.Optional(t.Boolean()),
  includeAuthor: t.Optional(t.Boolean()),
});

const ArticleFilterSchema = t.Object({
  title: t.Optional(t.String()),
  articleIds: t.Optional(t.Array(t.Number())),
  articleSlugs: t.Optional(t.Array(t.String())),
  categoryIds: t.Optional(t.Array(t.Number())),
  categorySlugs: t.Optional(t.Array(t.String())),
  ownerIds: t.Optional(t.Array(t.String())),
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
  imageId: t.String(),
  s3Key: t.String(),
  mimeType: t.Nullable(t.String()),
  isCover: t.Boolean(),
  sortOrder: t.Number(),
});

const UserRefSchema = t.Object({
  id: t.String(),
  name: t.String(),
  image: t.Nullable(t.String()),
});

const ArticleSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
  title: t.String(),
  subtitle: t.Nullable(t.String()),
  description: t.Nullable(t.String()),
  content: t.Nullable(TiptapContentSchema),
  ownerId: t.Nullable(t.String()),
  author: t.Nullable(UserRefSchema),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  categories: t.Array(ArticleCategorySchema),
  images: t.Array(ArticleImageSchema),
});

const CreateArticleBodySchema = t.Object({
  title: t.String({ minLength: 1 }),
  subtitle: t.Optional(t.Nullable(t.String())),
  description: t.Optional(t.Nullable(t.String())),
  content: TiptapContentSchema,
  categoryIds: t.Optional(t.Array(t.Number())),
});

const UpdateArticleBodySchema = t.Object({
  title: t.Optional(t.String({ minLength: 1 })),
  subtitle: t.Optional(t.Nullable(t.String())),
  description: t.Optional(t.Nullable(t.String())),
  content: t.Optional(TiptapContentSchema),
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

const AttachImageBodySchema = t.Object({
  isCover: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Number()),
});

const SuccessResponseSchema = t.Object({
  success: t.Boolean(),
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
  attachImageBody: AttachImageBodySchema,
  successResponse: SuccessResponseSchema,
};
