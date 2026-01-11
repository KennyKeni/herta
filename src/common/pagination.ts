import { t } from 'elysia';

export const PaginatedResponseSchema = <T extends ReturnType<typeof t.Any>>(dataSchema: T) =>
  t.Object({
    data: t.Array(dataSchema),
    total: t.Number(),
    limit: t.Number(),
    offset: t.Number(),
  });

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  limit: number;
  offset: number;
};
