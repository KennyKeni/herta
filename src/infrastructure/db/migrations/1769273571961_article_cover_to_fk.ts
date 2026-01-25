import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('articles')
    .addColumn('cover_image_id', 'uuid', (col) => col.references('images.id').onDelete('set null'))
    .execute();

  await sql`
    UPDATE articles
    SET cover_image_id = ai.image_id
    FROM article_images ai
    WHERE ai.article_id = articles.id AND ai.is_cover = true
  `.execute(db);

  await db.schema.dropIndex('article_images_single_cover_idx').execute();

  await db.deleteFrom('article_images').where('is_cover', '=', true).execute();

  await db.schema.alterTable('article_images').dropColumn('is_cover').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('article_images')
    .addColumn('is_cover', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute();

  await sql`
    INSERT INTO article_images (article_id, image_id, is_cover, sort_order)
    SELECT id, cover_image_id, true, 0
    FROM articles
    WHERE cover_image_id IS NOT NULL
    ON CONFLICT (article_id, image_id) DO UPDATE SET is_cover = true
  `.execute(db);

  await sql`
    CREATE UNIQUE INDEX article_images_single_cover_idx
    ON article_images (article_id)
    WHERE is_cover = true
  `.execute(db);

  await db.schema.alterTable('articles').dropColumn('cover_image_id').execute();
}
