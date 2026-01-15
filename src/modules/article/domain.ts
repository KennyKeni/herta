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
  body: string | null;
  author: string | null;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  categories: ArticleCategory[];
  images: ArticleImage[];
}

export type ArticleSearchResponse = PaginatedResponse<Article>;

export interface IncludeOptions {
  includeCategories?: boolean;
  includeImages?: boolean;
  includeBody?: boolean;
}

export interface ArticleFilter extends IncludeOptions {
  title?: string;
  articleIds?: number[];
  articleSlugs?: string[];
  categoryIds?: number[];
  categorySlugs?: string[];
  author?: string;
  ownerIds?: string[];
  limit?: number;
  offset?: number;
}

export interface CreateArticle {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  body: string;
  author?: string | null;
  ownerId?: string | null;
  categoryIds?: number[];
}

export interface UpdateArticle {
  title?: string;
  subtitle?: string | null;
  description?: string | null;
  body?: string;
  author?: string | null;
  ownerId?: string | null;
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

export interface ArticleImage {
  imageId: string;
  s3Key: string;
  mimeType: string | null;
  isCover: boolean;
  sortOrder: number;
}

export interface AttachImageToArticle {
  imageId: string;
  isCover?: boolean;
  sortOrder?: number;
}
