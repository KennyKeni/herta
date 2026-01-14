import { Elysia, NotFoundError } from 'elysia';
import { articlesSetup } from '@/infrastructure/setup';
import { ArticleModel } from './model';

export const articles = new Elysia({ prefix: '/articles', tags: ['articles'] })
  .use(articlesSetup)
  .get('/', ({ query, articlesService }) => articlesService.search(query), {
    query: ArticleModel.searchQuery,
    response: ArticleModel.searchResponse,
    detail: {
      summary: 'List Articles',
      description: 'List articles with optional filtering by IDs, slugs, categories, and author.',
    },
  })
  .post('/', ({ body, articlesService }) => articlesService.createArticle(body), {
    body: ArticleModel.createBody,
    response: ArticleModel.createResponse,
    detail: {
      summary: 'Create Article',
      description: 'Create a new article.',
    },
  })
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
      body: ArticleModel.updateBody,
      response: ArticleModel.updateResponse,
      detail: {
        summary: 'Update Article',
        description: 'Update an existing article by ID or slug.',
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
      detail: {
        summary: 'Delete Article',
        description: 'Delete an article by ID or slug.',
      },
    }
  )
  .post(
    '/:identifier/upload-url',
    async ({ params, body, articlesService }) => {
      const result = await articlesService.getUploadUrl(
        params.identifier,
        body.contentType,
        body.isCover
      );
      if (!result) throw new NotFoundError('Article not found');
      return result;
    },
    {
      body: ArticleModel.uploadUrlBody,
      response: ArticleModel.uploadUrlResponse,
      detail: {
        summary: 'Get Article Image Upload URL',
        description:
          'Get a presigned URL to upload an article image. Creates a pending image record.',
      },
    }
  )
  .post(
    '/images/:imageId/confirm',
    async ({ params, articlesService }) => {
      const result = await articlesService.confirmImage(Number(params.imageId));
      if (!result) throw new NotFoundError('Image not found or already confirmed');
      return result;
    },
    {
      response: ArticleModel.imageResponse,
      detail: {
        summary: 'Confirm Image Upload',
        description: 'Confirm that an image has been uploaded to S3.',
      },
    }
  )
  .delete(
    '/images/:imageId',
    async ({ params, articlesService }) => {
      const deleted = await articlesService.deleteImage(Number(params.imageId));
      if (!deleted) throw new NotFoundError('Image not found');
      return { success: true };
    },
    {
      detail: {
        summary: 'Delete Image',
        description: 'Delete an article image.',
      },
    }
  );
