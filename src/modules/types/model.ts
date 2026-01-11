import { t } from 'elysia';
import { PaginatedResponseSchema } from '@/common/pagination';

export const IncludeOptionsSchema = t.Object({
  includeMatchups: t.Optional(t.Boolean()),
  includeHiddenPower: t.Optional(t.Boolean()),
});

const TypeFilterSchema = t.Object({
  name: t.Optional(t.String()),
  typeIds: t.Optional(t.Array(t.Number())),
  typeSlugs: t.Optional(t.Array(t.String())),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
  offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
});

export const TypeSearchQuerySchema = t.Composite([IncludeOptionsSchema, TypeFilterSchema]);

const TypeRefSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  slug: t.String(),
});

const TypeMatchupSchema = t.Object({
  type: TypeRefSchema,
  multiplier: t.Number(),
});

const HiddenPowerIvSchema = t.Object({
  hp: t.Number(),
  atk: t.Number(),
  def: t.Number(),
  spa: t.Number(),
  spd: t.Number(),
  spe: t.Number(),
});

const TypeSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  slug: t.String(),
});

const TypeDetailSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  slug: t.String(),
  offensiveMatchups: t.Array(TypeMatchupSchema),
  defensiveMatchups: t.Array(TypeMatchupSchema),
  hiddenPowerIvs: t.Array(HiddenPowerIvSchema),
});

export const TypeModel = {
  searchQuery: TypeSearchQuerySchema,
  searchResponse: PaginatedResponseSchema(TypeSchema),
  getOneQuery: IncludeOptionsSchema,
  getOneResponse: TypeDetailSchema,
};
