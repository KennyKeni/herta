import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await sql`
    CREATE UNIQUE INDEX article_images_single_cover_idx
    ON article_images (article_id)
    WHERE is_cover = true
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('article_images_single_cover_idx').execute();
}
