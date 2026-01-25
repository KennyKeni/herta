import { type Kysely, sql } from 'kysely';
import { createFuzzyMatcher, type FuzzyMatchOptions, type FuzzyMatchResult } from '@/common/fuzzy';
import { config } from '@/config';
import type { DB } from '@/infrastructure/db/types';
import {
  type Article,
  type ArticleCategory,
  type ArticleFilter,
  type ArticleImage,
  type CoverImage,
  type CreateArticle,
  type CreatedArticle,
  type IncludeOptions,
  isDocContent,
  type UpdateArticle,
  type UpdatedArticle,
  type UserRef,
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
    const ownerIds = rows.map((r) => r.owner_id);
    const coverImageIds = rows
      .map((r) => r.cover_image_id)
      .filter((id): id is string => id != null);
    const [categories, images, authors, coverImages] = await Promise.all([
      filters.includeCategories !== false
        ? this.fetchCategories(articleIds)
        : Promise.resolve(new Map<number, ArticleCategory[]>()),
      filters.includeImages !== false
        ? this.fetchImages(articleIds)
        : Promise.resolve(new Map<number, ArticleImage[]>()),
      filters.includeAuthor === true
        ? this.fetchAuthors(ownerIds)
        : Promise.resolve(new Map<string, UserRef>()),
      coverImageIds.length > 0
        ? this.fetchCoverImages(coverImageIds)
        : Promise.resolve(new Map<string, CoverImage>()),
    ]);

    const includeContent = filters.includeContent !== false;
    const data = rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      content: includeContent && isDocContent(row.content) ? row.content : null,
      contentHtml: includeContent ? row.content_html : null,
      ownerId: row.owner_id,
      author: row.owner_id ? (authors.get(row.owner_id) ?? null) : null,
      coverImage: row.cover_image_id ? (coverImages.get(row.cover_image_id) ?? null) : null,
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

    const [categories, images, authors, coverImages] = await Promise.all([
      options.includeCategories !== false
        ? this.fetchCategories([row.id])
        : Promise.resolve(new Map<number, ArticleCategory[]>()),
      options.includeImages !== false
        ? this.fetchImages([row.id])
        : Promise.resolve(new Map<number, ArticleImage[]>()),
      row.owner_id
        ? this.fetchAuthors([row.owner_id])
        : Promise.resolve(new Map<string, UserRef>()),
      row.cover_image_id
        ? this.fetchCoverImages([row.cover_image_id])
        : Promise.resolve(new Map<string, CoverImage>()),
    ]);

    const includeContent = options.includeContent !== false;
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      content: includeContent && isDocContent(row.content) ? row.content : null,
      contentHtml: includeContent ? row.content_html : null,
      ownerId: row.owner_id,
      author: row.owner_id ? (authors.get(row.owner_id) ?? null) : null,
      coverImage: row.cover_image_id ? (coverImages.get(row.cover_image_id) ?? null) : null,
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
      .select(['ai.article_id', 'ai.image_id', 'ai.sort_order', 'i.s3_key', 'i.mime_type'])
      .where('ai.article_id', 'in', articleIds)
      .where('i.status', '=', 'published')
      .orderBy('ai.sort_order')
      .execute();

    const map = new Map<number, ArticleImage[]>();
    for (const row of rows) {
      const arr = map.get(row.article_id) ?? [];
      arr.push({
        imageId: row.image_id,
        url: `${config.s3.S3_PUBLIC_URL}/${row.s3_key}`,
        mimeType: row.mime_type,
        sortOrder: row.sort_order,
      });
      map.set(row.article_id, arr);
    }
    return map;
  }

  private async fetchCoverImages(imageIds: string[]): Promise<Map<string, CoverImage>> {
    if (!imageIds.length) return new Map();

    const rows = await this.db
      .selectFrom('images')
      .select(['id', 's3_key', 'mime_type'])
      .where('id', 'in', imageIds)
      .where('status', '=', 'published')
      .execute();

    const map = new Map<string, CoverImage>();
    for (const row of rows) {
      map.set(row.id, {
        imageId: row.id,
        url: `${config.s3.S3_PUBLIC_URL}/${row.s3_key}`,
        mimeType: row.mime_type,
      });
    }
    return map;
  }

  private async fetchAuthors(ownerIds: (string | null)[]): Promise<Map<string, UserRef>> {
    const validIds = ownerIds.filter((id): id is string => id != null);
    if (!validIds.length) return new Map();

    const uniqueIds = [...new Set(validIds)];
    const rows = await this.db
      .selectFrom('user')
      .select(['id', 'name', 'image'])
      .where('id', 'in', uniqueIds)
      .execute();

    const map = new Map<string, UserRef>();
    for (const row of rows) {
      map.set(row.id, { id: row.id, name: row.name, image: row.image });
    }
    return map;
  }

  async createArticle(
    data: CreateArticle,
    slug: string,
    contentHtml: string | null
  ): Promise<CreatedArticle> {
    return this.db.transaction().execute(async (trx) => {
      const result = await trx
        .insertInto('articles')
        .values({
          slug,
          title: data.title,
          subtitle: data.subtitle ?? null,
          description: data.description ?? null,
          content: data.content,
          content_html: contentHtml,
          owner_id: data.ownerId ?? null,
          cover_image_id: data.coverImageId ?? null,
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
    newSlug?: string,
    contentHtml?: string | null
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
      if (data.content !== undefined) updateValues.content = data.content;
      if (contentHtml !== undefined) updateValues.content_html = contentHtml;
      if (data.ownerId !== undefined) updateValues.owner_id = data.ownerId;
      if (data.coverImageId !== undefined) updateValues.cover_image_id = data.coverImageId;

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

  async getAllCategories(): Promise<ArticleCategory[]> {
    const rows = await this.db
      .selectFrom('article_categories')
      .select(['id', 'slug', 'name', 'description'])
      .orderBy('name')
      .execute();

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
    }));
  }
}
