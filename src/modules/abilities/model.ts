import { t } from 'elysia';
import { PaginatedResponseSchema } from '@/common/pagination';

export const IncludeOptionsSchema = t.Object({
  includeFlags: t.Optional(t.Boolean()),
});

const AbilityFilterSchema = t.Object({
  name: t.Optional(t.String()),
  abilityIds: t.Optional(t.Array(t.Number())),
  abilitySlugs: t.Optional(t.Array(t.String())),
  flagIds: t.Optional(t.Array(t.Number())),
  flagSlugs: t.Optional(t.Array(t.String())),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
  offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
});

export const AbilitySearchQuerySchema = t.Composite([IncludeOptionsSchema, AbilityFilterSchema]);

const AbilityFlagTypeSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  slug: t.String(),
  description: t.Nullable(t.String()),
});

const AbilitySchema = t.Object({
  id: t.Number(),
  name: t.String(),
  slug: t.String(),
  desc: t.Nullable(t.String()),
  shortDesc: t.Nullable(t.String()),
  flags: t.Array(AbilityFlagTypeSchema),
});

export const AbilityModel = {
  searchQuery: AbilitySearchQuerySchema,
  searchResponse: PaginatedResponseSchema(AbilitySchema),
  getOneQuery: IncludeOptionsSchema,
  getOneResponse: AbilitySchema,
};
