export interface ArticleCategory {
  id: number;
  slug: string;
  name: string;
  description: string | null;
}

export interface Article {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  body: string;
  author: string | null;
  createdAt: Date;
  updatedAt: Date;
  categories: ArticleCategory[];
}

export interface IncludeOptions {
  includeCategories?: boolean;
}

export interface ArticleFilter extends IncludeOptions {
  title?: string;
  articleIds?: number[];
  articleSlugs?: string[];
  categoryIds?: number[];
  categorySlugs?: string[];
  author?: string;
  limit?: number;
  offset?: number;
}
