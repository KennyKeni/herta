import { Elysia, NotFoundError } from 'elysia';
import { articleSetup } from '@/infrastructure/setup';
import { ArticleModel } from './model';

export const articles = new Elysia({ prefix: '/articles', tags: ['articles'] })
  .use(articleSetup)
  .get('/', ({ query, articleService }) => articleService.search(query), {
    query: ArticleModel.searchQuery,
    response: ArticleModel.searchResponse,
    detail: {
      summary: 'List Articles',
      description: 'List articles with optional filtering by IDs, slugs, categories, and author.',
    },
  })
  .get(
    '/:identifier',
    async ({ params, query, articleService }) => {
      const result = await articleService.getByIdentifier(params.identifier, query);
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
  );
