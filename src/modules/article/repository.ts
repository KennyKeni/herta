import type { Kysely } from 'kysely';
import type { DB } from '@/infrastructure/db/types';
import type { Article } from './domain';

export class ArticleRepository {
  constructor(private db: Kysely<DB>) {}

  async getByIdentifier(identifier: string): Promise<Article | null> {
    const isId = /^\d+$/.test(identifier);

    const row = await this.db
      .selectFrom('articles')
      .selectAll()
      .where(isId ? 'id' : 'slug', '=', isId ? Number(identifier) : identifier)
      .executeTakeFirst();

    if (!row) return null;

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
    };
  }
}
