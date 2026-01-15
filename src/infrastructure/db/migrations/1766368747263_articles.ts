import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('article_categories')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('description', 'text')
    .execute();

  await db.schema
    .createTable('articles')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('slug', 'text', (col) => col.notNull().unique())
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('subtitle', 'text')
    .addColumn('description', 'text')
    .addColumn('body', 'text', (col) => col.notNull())
    .addColumn('author', 'text')
    .addColumn('owner_id', 'text', (col) => col.references('user.id').onDelete('set null'))
    .addColumn('created_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamptz', (col) => col.defaultTo(sql`now()`).notNull())
    .execute();

  await db.schema
    .createTable('article_category_map')
    .addColumn('article_id', 'integer', (col) =>
      col.notNull().references('articles.id').onDelete('cascade')
    )
    .addColumn('category_id', 'integer', (col) =>
      col.notNull().references('article_categories.id').onDelete('cascade')
    )
    .addPrimaryKeyConstraint('article_category_map_pk', ['article_id', 'category_id'])
    .execute();

  await sql`CREATE INDEX idx_articles_slug ON articles (slug)`.execute(db);
  await sql`CREATE INDEX idx_articles_owner_id ON articles (owner_id)`.execute(db);
  await sql`CREATE INDEX idx_articles_title_trgm ON articles USING gin (title gin_trgm_ops)`.execute(
    db
  );
  await db.schema
    .createIndex('idx_article_categories_slug')
    .on('article_categories')
    .column('slug')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('article_category_map').execute();
  await db.schema.dropTable('articles').execute();
  await db.schema.dropTable('article_categories').execute();
}
