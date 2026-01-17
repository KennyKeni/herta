import { type Kysely, sql } from 'kysely';
import { createFuzzyMatcher, type FuzzyMatchOptions, type FuzzyMatchResult } from '@/common/fuzzy';
import type { DB } from '@/infrastructure/db/types';
import type {
  Article,
  ArticleCategory,
  ArticleFilter,
  ArticleImage,
  AttachImageToArticle,
  CreateArticle,
  CreatedArticle,
  IncludeOptions,
  UpdateArticle,
  UpdatedArticle,
} from './domain';

export class ArticlesRepository {
  constructor(private db: Kysely<DB>) {}

  withTransaction(trx: Kysely<DB>): ArticlesRepository {
    return new ArticlesRepository(trx);
  }

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

  async searchArticles(
    filters: ArticleFilter,
    useFuzzy: boolean
  ): Promise<{ data: Article[]; total: number }> {
    let query = this.buildSearchQuery(filters);
    let countQuery = this.buildSearchQuery(filters)
      .clearSelect()
      .select(sql<number>`COUNT(*)`.as('count'));

    if (filters.title) {
      if (useFuzzy) {
        query = query.where(sql<boolean>`title % ${filters.title}`);
        countQuery = countQuery.where(sql<boolean>`title % ${filters.title}`);
        query = query.orderBy(sql`similarity(title, ${filters.title})`, 'desc');
      } else {
        query = query.where('title', 'ilike', `${filters.title}%`);
        countQuery = countQuery.where('title', 'ilike', `${filters.title}%`);
        query = query.orderBy('title');
      }
    } else {
      query = query.orderBy('id');
    }

    query = query.limit(filters.limit ?? 20).offset(filters.offset ?? 0);

    const [rows, countResult] = await Promise.all([
      query.execute(),
      countQuery.executeTakeFirstOrThrow(),
    ]);

    if (rows.length === 0) return { data: [], total: Number(countResult.count) };

    const articleIds = rows.map((r) => r.id);
    const [categories, images] = await Promise.all([
      filters.includeCategories !== false
        ? this.fetchCategories(articleIds)
        : Promise.resolve(new Map<number, ArticleCategory[]>()),
      filters.includeImages !== false
        ? this.fetchImages(articleIds)
        : Promise.resolve(new Map<number, ArticleImage[]>()),
    ]);

    const includeBody = filters.includeBody !== false;
    const data = rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      body: includeBody ? row.body : null,
      ownerId: row.owner_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      categories: categories.get(row.id) ?? [],
      images: images.get(row.id) ?? [],
    }));

    return { data, total: Number(countResult.count) };
  }

  private buildSearchQuery(filters: ArticleFilter) {
    let query = this.db.selectFrom('articles').selectAll();

    if (filters.articleIds?.length) query = query.where('id', 'in', filters.articleIds);
    if (filters.articleSlugs?.length) query = query.where('slug', 'in', filters.articleSlugs);
    if (filters.ownerIds?.length) query = query.where('owner_id', 'in', filters.ownerIds);
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

    const [categories, images] = await Promise.all([
      options.includeCategories !== false
        ? this.fetchCategories([row.id])
        : Promise.resolve(new Map<number, ArticleCategory[]>()),
      options.includeImages !== false
        ? this.fetchImages([row.id])
        : Promise.resolve(new Map<number, ArticleImage[]>()),
    ]);

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      body: options.includeBody !== false ? row.body : null,
      ownerId: row.owner_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      categories: categories.get(row.id) ?? [],
      images: images.get(row.id) ?? [],
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

  private async fetchImages(articleIds: number[]): Promise<Map<number, ArticleImage[]>> {
    if (!articleIds.length) return new Map();

    const rows = await this.db
      .selectFrom('article_images as ai')
      .innerJoin('images as i', 'i.id', 'ai.image_id')
      .select([
        'ai.article_id',
        'ai.image_id',
        'ai.is_cover',
        'ai.sort_order',
        'i.s3_key',
        'i.mime_type',
      ])
      .where('ai.article_id', 'in', articleIds)
      .where('i.status', '=', 'published')
      .orderBy('ai.sort_order')
      .execute();

    const map = new Map<number, ArticleImage[]>();
    for (const row of rows) {
      const arr = map.get(row.article_id) ?? [];
      arr.push({
        imageId: row.image_id,
        s3Key: row.s3_key,
        mimeType: row.mime_type,
        isCover: row.is_cover,
        sortOrder: row.sort_order,
      });
      map.set(row.article_id, arr);
    }
    return map;
  }

  async createArticle(data: CreateArticle, slug: string): Promise<CreatedArticle> {
    return this.db.transaction().execute(async (trx) => {
      const result = await trx
        .insertInto('articles')
        .values({
          slug,
          title: data.title,
          subtitle: data.subtitle ?? null,
          description: data.description ?? null,
          body: data.body,
          owner_id: data.ownerId ?? null,
        })
        .returning(['id', 'slug'])
        .executeTakeFirstOrThrow();

      if (data.categoryIds?.length) {
        await trx
          .insertInto('article_category_map')
          .values(
            data.categoryIds.map((categoryId) => ({
              article_id: result.id,
              category_id: categoryId,
            }))
          )
          .execute();
      }

      return { id: result.id, slug: result.slug };
    });
  }

  async updateArticle(
    identifier: string,
    data: UpdateArticle,
    newSlug?: string
  ): Promise<UpdatedArticle | null> {
    const isId = /^\d+$/.test(identifier);

    return this.db.transaction().execute(async (trx) => {
      const existing = await trx
        .selectFrom('articles')
        .select(['id', 'slug'])
        .where(isId ? 'id' : 'slug', '=', isId ? Number(identifier) : identifier)
        .executeTakeFirst();

      if (!existing) return null;

      const id = existing.id;
      const slug = newSlug ?? existing.slug;

      const updateValues: Record<string, unknown> = {};
      if (newSlug !== undefined) updateValues.slug = newSlug;
      if (data.title !== undefined) updateValues.title = data.title;
      if (data.subtitle !== undefined) updateValues.subtitle = data.subtitle;
      if (data.description !== undefined) updateValues.description = data.description;
      if (data.body !== undefined) updateValues.body = data.body;
      if (data.ownerId !== undefined) updateValues.owner_id = data.ownerId;

      if (Object.keys(updateValues).length > 0) {
        updateValues.updated_at = new Date();
        await trx.updateTable('articles').set(updateValues).where('id', '=', id).execute();
      }

      if (data.categoryIds !== undefined) {
        await trx.deleteFrom('article_category_map').where('article_id', '=', id).execute();
        if (data.categoryIds.length > 0) {
          await trx
            .insertInto('article_category_map')
            .values(
              data.categoryIds.map((categoryId) => ({
                article_id: id,
                category_id: categoryId,
              }))
            )
            .execute();
        }
      }

      return { id, slug };
    });
  }

  async deleteArticle(identifier: string): Promise<boolean> {
    const isId = /^\d+$/.test(identifier);

    return this.db.transaction().execute(async (trx) => {
      const article = await trx
        .selectFrom('articles')
        .select('id')
        .where(isId ? 'id' : 'slug', '=', isId ? Number(identifier) : identifier)
        .executeTakeFirst();

      if (!article) return false;

      await trx.deleteFrom('article_category_map').where('article_id', '=', article.id).execute();
      await trx.deleteFrom('articles').where('id', '=', article.id).execute();

      return true;
    });
  }

  async checkArticleExists(slug: string): Promise<boolean> {
    const result = await this.db
      .selectFrom('articles')
      .select('id')
      .where('slug', '=', slug)
      .executeTakeFirst();
    return !!result;
  }

  async checkArticleSlugConflict(slug: string, excludeId: number): Promise<boolean> {
    const result = await this.db
      .selectFrom('articles')
      .select('id')
      .where('slug', '=', slug)
      .where('id', '!=', excludeId)
      .executeTakeFirst();
    return !!result;
  }

  async getArticleSlugById(id: number): Promise<string | null> {
    const result = await this.db
      .selectFrom('articles')
      .select('slug')
      .where('id', '=', id)
      .executeTakeFirst();
    return result?.slug ?? null;
  }

  async getArticleIdBySlug(slug: string): Promise<number | null> {
    const result = await this.db
      .selectFrom('articles')
      .select('id')
      .where('slug', '=', slug)
      .executeTakeFirst();
    return result?.id ?? null;
  }

  async attachImage(articleId: number, data: AttachImageToArticle): Promise<void> {
    await this.db
      .insertInto('article_images')
      .values({
        article_id: articleId,
        image_id: data.imageId,
        is_cover: data.isCover ?? false,
        sort_order: data.sortOrder ?? 0,
      })
      .execute();
  }

  async detachImage(articleId: number, imageId: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('article_images')
      .where('article_id', '=', articleId)
      .where('image_id', '=', imageId)
      .executeTakeFirst();

    return (result.numDeletedRows ?? 0n) > 0n;
  }

  async updateImageMetadata(
    articleId: number,
    imageId: string,
    data: { isCover?: boolean; sortOrder?: number }
  ): Promise<boolean> {
    const updateValues: Record<string, unknown> = {};
    if (data.isCover !== undefined) updateValues.is_cover = data.isCover;
    if (data.sortOrder !== undefined) updateValues.sort_order = data.sortOrder;

    if (Object.keys(updateValues).length === 0) return true;

    const result = await this.db
      .updateTable('article_images')
      .set(updateValues)
      .where('article_id', '=', articleId)
      .where('image_id', '=', imageId)
      .executeTakeFirst();
    return (result.numUpdatedRows ?? 0n) > 0n;
  }
}
