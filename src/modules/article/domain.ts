import type { JSONContent } from '@tiptap/core';
import type { PaginatedResponse } from '@/common/pagination';

export interface DocContent extends JSONContent {
  type: 'doc';
}

export function isDocContent(value: unknown): value is DocContent {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return obj.type === 'doc';
}

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

export interface ImageRef {
  imageId: string;
  url: string;
  mimeType: string | null;
}

export type CoverImage = ImageRef;

export interface Article {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  content: DocContent | null;
  contentHtml: string | null;
  ownerId: string | null;
  author: UserRef | null;
  coverImage: ImageRef | null;
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
  content: DocContent;
  ownerId?: string | null;
  categoryIds?: number[];
  coverImageId?: string | null;
}

export interface UpdateArticle {
  title?: string;
  subtitle?: string | null;
  description?: string | null;
  content?: DocContent;
  ownerId?: string | null;
  categoryIds?: number[];
  coverImageId?: string | null;
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
  url: string;
  mimeType: string | null;
  sortOrder: number;
}
