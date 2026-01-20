import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('articles').addColumn('content_html', 'text').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('articles').dropColumn('content_html').execute();
}
