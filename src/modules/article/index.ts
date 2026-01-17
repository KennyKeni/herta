import { Elysia, NotFoundError } from 'elysia';
import { articlesSetup } from '@/infrastructure/setup';
import { authModule } from '@/modules/auth';
import { ArticleModel } from './model';

export const articles = new Elysia({ prefix: '/articles', tags: ['articles'] })
  .use(articlesSetup)
  .use(authModule)
  .get('/', ({ query, articlesService }) => articlesService.search(query), {
    query: ArticleModel.searchQuery,
    response: ArticleModel.searchResponse,
    detail: {
      summary: 'List Articles',
      description: 'List articles with optional filtering by IDs, slugs, categories, and owner.',
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
  )
  .put(
    '/:identifier/images/:imageId',
    async ({ params, body, articlesService }) => {
      const attached = await articlesService.attachImage(params.identifier, {
        imageId: params.imageId,
        ...body,
      });
      if (!attached) throw new NotFoundError('Article not found');
      return { success: true };
    },
    {
      auth: true,
      permission: { article: ['update'] },
      body: ArticleModel.attachImageBody,
      response: ArticleModel.successResponse,
      detail: {
        summary: 'Attach Image to Article',
        description: 'Attach an existing image to an article. Requires article:update permission.',
      },
    }
  )
  .delete(
    '/:identifier/images/:imageId',
    async ({ params, articlesService }) => {
      const detached = await articlesService.detachImage(params.identifier, params.imageId);
      if (!detached) throw new NotFoundError('Image not attached to article');
      return { success: true };
    },
    {
      auth: true,
      permission: { article: ['update'] },
      response: ArticleModel.successResponse,
      detail: {
        summary: 'Detach Image from Article',
        description: 'Remove an image from an article. Requires article:update permission.',
      },
    }
  );
