import { type Kysely, sql } from 'kysely';
import { createFuzzyMatcher, type FuzzyMatchOptions, type FuzzyMatchResult } from '@/common/fuzzy';
import type { DB } from '@/infrastructure/db/types';
import type { Article, ArticleCategory, ArticleFilter, IncludeOptions } from './domain';

export class ArticlesRepository {
  constructor(private db: Kysely<DB>) {}

  async fuzzyResolve(titles: string[]): Promise<number[]> {
    if (!titles.length) return [];

    const results = await Promise.all(
      titles.map((title) =>
        this.db
          .selectFrom('articles')
          .select(['id'])
          .where(sql<boolean>`title % ${title}`)
          .orderBy(sql`similarity(title, ${title})`, 'desc')
          .limit(1)
          .executeTakeFirst()
      )
    );

    return results.filter((r): r is { id: number } => r != null).map((r) => r.id);
  }

  async fuzzyResolveCategories(names: string[]): Promise<number[]> {
    if (!names.length) return [];

    const results = await Promise.all(
      names.map((name) =>
        this.db
          .selectFrom('article_categories')
          .select(['id'])
          .where(sql<boolean>`name % ${name}`)
          .orderBy(sql`similarity(name, ${name})`, 'desc')
          .limit(1)
          .executeTakeFirst()
      )
    );

    return results.filter((r): r is { id: number } => r != null).map((r) => r.id);
  }

  async fuzzyMatch(query: string, options?: FuzzyMatchOptions): Promise<FuzzyMatchResult[]> {
    return createFuzzyMatcher(this.db, {
      table: 'articles',
      matchColumn: 'title',
      idColumn: 'id',
      nameColumn: 'title',
    })(query, options);
  }

  async fuzzyMatchCategories(
    query: string,
    options?: FuzzyMatchOptions
  ): Promise<FuzzyMatchResult[]> {
    return createFuzzyMatcher(this.db, {
      table: 'article_categories',
      matchColumn: 'name',
      idColumn: 'id',
    })(query, options);
  }

  async searchArticles(filters: ArticleFilter): Promise<Article[]> {
    let query = this.buildSearchQuery(filters);

    if (filters.title) {
      query = query
        .where(sql<boolean>`title % ${filters.title}`)
        .orderBy(sql`similarity(title, ${filters.title})`, 'desc');
    } else {
      query = query.orderBy('id');
    }

    const rows = await query
      .limit(filters.limit ?? 20)
      .offset(filters.offset ?? 0)
      .execute();

    if (rows.length === 0) return [];

    const articleIds = rows.map((r) => r.id);
    const categories =
      filters.includeCategories !== false ? await this.fetchCategories(articleIds) : new Map();

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      body: row.body,
      author: row.author,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      categories: categories.get(row.id) ?? [],
    }));
  }

  private buildSearchQuery(filters: ArticleFilter) {
    let query = this.db.selectFrom('articles').selectAll();

    if (filters.articleIds?.length) query = query.where('id', 'in', filters.articleIds);
    if (filters.articleSlugs?.length) query = query.where('slug', 'in', filters.articleSlugs);
    if (filters.author) query = query.where('author', '=', filters.author);
    if (filters.categoryIds?.length || filters.categorySlugs?.length) {
      query = query.where(
        'id',
        'in',
        this.categorySubquery(filters.categoryIds, filters.categorySlugs)
      );
    }

    return query;
  }

  private categorySubquery(categoryIds?: number[], categorySlugs?: string[]) {
    return this.db
      .selectFrom('article_category_map as acm')
      .innerJoin('article_categories as ac', 'ac.id', 'acm.category_id')
      .select('acm.article_id')
      .where((eb) => {
        const conditions = [];
        if (categoryIds?.length) conditions.push(eb('ac.id', 'in', categoryIds));
        if (categorySlugs?.length) conditions.push(eb('ac.slug', 'in', categorySlugs));
        return conditions.length ? eb.or(conditions) : eb.lit(true);
      });
  }

  async getByIdentifier(identifier: string, options: IncludeOptions = {}): Promise<Article | null> {
    const isId = /^\d+$/.test(identifier);

    const row = await this.db
      .selectFrom('articles')
      .selectAll()
      .where(isId ? 'id' : 'slug', '=', isId ? Number(identifier) : identifier)
      .executeTakeFirst();

    if (!row) return null;

    const categories =
      options.includeCategories !== false ? await this.fetchCategories([row.id]) : new Map();

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      body: row.body,
      author: row.author,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      categories: categories.get(row.id) ?? [],
    };
  }

  private async fetchCategories(articleIds: number[]): Promise<Map<number, ArticleCategory[]>> {
    if (!articleIds.length) return new Map();

    const rows = await this.db
      .selectFrom('article_category_map as acm')
      .innerJoin('article_categories as ac', 'ac.id', 'acm.category_id')
      .select(['acm.article_id', 'ac.id', 'ac.slug', 'ac.name', 'ac.description'])
      .where('acm.article_id', 'in', articleIds)
      .execute();

    const map = new Map<number, ArticleCategory[]>();
    for (const row of rows) {
      const arr = map.get(row.article_id) ?? [];
      arr.push({ id: row.id, slug: row.slug, name: row.name, description: row.description });
      map.set(row.article_id, arr);
    }
    return map;
  }
}
