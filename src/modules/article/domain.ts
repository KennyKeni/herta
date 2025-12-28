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
}
