import type { Seeder } from '../utils';
import { batchInsert, loadJson } from '../utils';

interface ArticleJson {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  author: string | null;
  body: string;
}

interface ArticleCategoryJson {
  id: number;
  slug: string;
  name: string;
  description: string | null;
}

interface ArticleCategoryMapJson {
  article_id: number;
  category_id: number;
}

export const articlesSeeder: Seeder = {
  name: 'Articles',
  tables: ['article_categories', 'articles', 'article_category_map'],

  async seed(db, logger) {
    const start = Date.now();
    let totalCount = 0;

    const [categories, articles, categoryMap] = await Promise.all([
      loadJson<ArticleCategoryJson[]>('article_categories.json'),
      loadJson<ArticleJson[]>('articles.json'),
      loadJson<ArticleCategoryMapJson[]>('article_category_map.json'),
    ]);

    const categoryRows = categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
    }));
    const categoryCount = await batchInsert(db, 'article_categories', categoryRows);
    logger.table('article_categories', categoryCount, Date.now() - start);
    totalCount += categoryCount;

    const articleRows = articles.map((a) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      subtitle: a.subtitle,
      description: a.description,
      author: a.author,
      body: a.body,
    }));
    const articleCount = await batchInsert(db, 'articles', articleRows);
    logger.table('articles', articleCount, Date.now() - start);
    totalCount += articleCount;

    const mapRows = categoryMap.map((m) => ({
      article_id: m.article_id,
      category_id: m.category_id,
    }));
    const mapCount = await batchInsert(db, 'article_category_map', mapRows);
    logger.table('article_category_map', mapCount, Date.now() - start);
    totalCount += mapCount;

    return totalCount;
  },
};
