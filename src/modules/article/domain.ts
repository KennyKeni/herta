import type { PaginatedResponse } from '@/common/pagination';

export interface UserRef {
  id: string;
  name: string;
  image: string | null;
}

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
  content: unknown | null;
  ownerId: string | null;
  author: UserRef | null;
  createdAt: Date;
  updatedAt: Date;
  categories: ArticleCategory[];
  images: ArticleImage[];
}

export type ArticleSearchResponse = PaginatedResponse<Article>;

export interface IncludeOptions {
  includeCategories?: boolean;
  includeImages?: boolean;
  includeContent?: boolean;
  includeAuthor?: boolean;
}

export interface ArticleFilter extends IncludeOptions {
  title?: string;
  articleIds?: number[];
  articleSlugs?: string[];
  categoryIds?: number[];
  categorySlugs?: string[];
  ownerIds?: string[];
  limit?: number;
  offset?: number;
}

export interface CreateArticle {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  content: unknown;
  ownerId?: string | null;
  categoryIds?: number[];
}

export interface UpdateArticle {
  title?: string;
  subtitle?: string | null;
  description?: string | null;
  content?: unknown;
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
