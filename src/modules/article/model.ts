import { t } from 'elysia';
import { PaginatedResponseSchema } from '@/common/pagination';

const MAX_CONTENT_SIZE = 100 * 1024; // 100KB

const DocContentSchema = t.Object({
  type: t.Literal('doc'),
  content: t.Optional(t.Array(t.Unknown())),
});

const TiptapContentSchema = t
  .Transform(DocContentSchema)
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
  limit: t.Optional(t.Number({ minimum: 1, default: 20 })),
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
  url: t.String(),
  mimeType: t.Nullable(t.String()),
  sortOrder: t.Number(),
});

const ImageRefSchema = t.Object({
  imageId: t.String(),
  url: t.String(),
  mimeType: t.Nullable(t.String()),
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
  content: t.Nullable(DocContentSchema),
  contentHtml: t.Nullable(t.String()),
  ownerId: t.Nullable(t.String()),
  author: t.Nullable(UserRefSchema),
  coverImage: t.Nullable(ImageRefSchema),
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
  coverImageId: t.Optional(t.Nullable(t.String())),
});

const UpdateArticleBodySchema = t.Object({
  title: t.Optional(t.String({ minLength: 1 })),
  subtitle: t.Optional(t.Nullable(t.String())),
  description: t.Optional(t.Nullable(t.String())),
  content: t.Optional(TiptapContentSchema),
  categoryIds: t.Optional(t.Array(t.Number())),
  coverImageId: t.Optional(t.Nullable(t.String())),
});

const CreateArticleResponseSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
});

const UpdateArticleResponseSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
});

const SuccessResponseSchema = t.Object({
  success: t.Boolean(),
});

const CategoriesResponseSchema = t.Array(ArticleCategorySchema);

export const ArticleModel = {
  searchQuery: ArticleSearchQuerySchema,
  searchResponse: PaginatedResponseSchema(ArticleSchema),
  getOneQuery: IncludeOptionsSchema,
  getOneResponse: ArticleSchema,
  createBody: CreateArticleBodySchema,
  createResponse: CreateArticleResponseSchema,
  updateBody: UpdateArticleBodySchema,
  updateResponse: UpdateArticleResponseSchema,
  successResponse: SuccessResponseSchema,
  categoriesResponse: CategoriesResponseSchema,
};
