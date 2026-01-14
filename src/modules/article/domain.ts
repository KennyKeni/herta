import type { PaginatedResponse } from '@/common/pagination';

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
  images: ArticleImage[];
}

export type ArticleSearchResponse = PaginatedResponse<Article>;

export interface IncludeOptions {
  includeCategories?: boolean;
  includeImages?: boolean;
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

export interface CreateArticle {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  body: string;
  author?: string | null;
  categoryIds?: number[];
}

export interface UpdateArticle {
  title?: string;
  subtitle?: string | null;
  description?: string | null;
  body?: string;
  author?: string | null;
  categoryIds?: number[];
}

export interface CreatedArticle {
  id: number;
  slug: string;
}

export interface UpdatedArticle {
  id: number;
  slug: string;
}

export type ImageStatus = 'pending' | 'uploaded';

export interface ArticleImage {
  id: number;
  articleId: number;
  key: string;
  status: ImageStatus;
  contentType: string;
  isCover: boolean;
  createdAt: Date;
  confirmedAt: Date | null;
}

export interface CreateArticleImage {
  articleId: number;
  key: string;
  contentType: string;
  isCover?: boolean;
}

export interface CreatedArticleImage {
  id: number;
  key: string;
}
