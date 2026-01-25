import { Elysia, NotFoundError } from 'elysia';
import { CACHE_KEYS } from '@/infrastructure/cache/keys';
import { cachePlugin } from '@/infrastructure/cache/plugin';
import { articlesSetup } from '@/infrastructure/setup';
import { authModule } from '@/modules/auth';
import { ArticleModel } from './model';

export const articles = new Elysia({ prefix: '/articles', tags: ['articles'] })
  .use(articlesSetup)
  .use(authModule)
  .use(cachePlugin)
  .get('/', ({ query, articlesService }) => articlesService.search(query), {
    cache: { key: CACHE_KEYS.articles.search, group: CACHE_KEYS.articles.searchGroup },
    query: ArticleModel.searchQuery,
    response: ArticleModel.searchResponse,
    detail: {
      summary: 'List Articles',
      description: 'List articles with optional filtering by IDs, slugs, categories, and owner.',
    },
  })
  .get('/categories', ({ articlesService }) => articlesService.getAllCategories(), {
    cache: { key: 'articles:categories', group: 'group:articles:categories' },
    response: ArticleModel.categoriesResponse,
    detail: {
      summary: 'List Categories',
      description: 'List all article categories.',
    },
  })
  .post(
    '/',
    ({ body, user, articlesService }) =>
      articlesService.createArticle({ ...body, ownerId: user.id }),
    {
      auth: true,
      permission: { article: ['create'] },
      body: ArticleModel.createBody,
      response: ArticleModel.createResponse,
      detail: {
        summary: 'Create Article',
        description: 'Create a new article. Requires article:create permission.',
      },
    }
  )
  .get(
    '/:identifier',
    async ({ params, query, articlesService }) => {
      const result = await articlesService.getByIdentifier(params.identifier, query);
      if (!result) throw new NotFoundError('Article not found');
      return result;
    },
    {
      cache: {
        key: CACHE_KEYS.articles.article('{identifier}'),
        group: CACHE_KEYS.articles.articleGroup('{identifier}'),
      },
      query: ArticleModel.getOneQuery,
      response: ArticleModel.getOneResponse,
      detail: {
        summary: 'Get Article by ID or slug',
        description: 'Get a single article by ID or slug.',
      },
    }
  )
  .patch(
    '/:identifier',
    async ({ params, body, articlesService }) => {
      const result = await articlesService.updateArticle(params.identifier, body);
      if (!result) throw new NotFoundError('Article not found');
      return result;
    },
    {
      auth: true,
      permission: { article: ['update'] },
      body: ArticleModel.updateBody,
      response: ArticleModel.updateResponse,
      detail: {
        summary: 'Update Article',
        description:
          'Update an existing article by ID or slug. Requires article:update permission.',
      },
    }
  )
  .delete(
    '/:identifier',
    async ({ params, articlesService }) => {
      const deleted = await articlesService.deleteArticle(params.identifier);
      if (!deleted) throw new NotFoundError('Article not found');
      return { success: true };
    },
    {
      auth: true,
      permission: { article: ['delete'] },
      detail: {
        summary: 'Delete Article',
        description: 'Delete an article by ID or slug. Requires article:delete permission.',
      },
    }
  );
