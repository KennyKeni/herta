import { t } from 'elysia';
import { PaginatedResponseSchema } from '@/common/pagination';

export const IncludeOptionsSchema = t.Object({
  includeFlags: t.Optional(t.Boolean()),
  includeBoosts: t.Optional(t.Boolean()),
  includeEffects: t.Optional(t.Boolean()),
  includeZData: t.Optional(t.Boolean()),
  includeGmaxSpecies: t.Optional(t.Boolean()),
});

const MoveFilterSchema = t.Object({
  name: t.Optional(t.String()),
  moveIds: t.Optional(t.Array(t.Number())),
  moveSlugs: t.Optional(t.Array(t.String())),
  typeIds: t.Optional(t.Array(t.Number())),
  typeSlugs: t.Optional(t.Array(t.String())),
  categoryIds: t.Optional(t.Array(t.Number())),
  categorySlugs: t.Optional(t.Array(t.String())),
  targetIds: t.Optional(t.Array(t.Number())),
  targetSlugs: t.Optional(t.Array(t.String())),
  flagIds: t.Optional(t.Array(t.Number())),
  flagSlugs: t.Optional(t.Array(t.String())),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
  offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
});

export const MoveSearchQuerySchema = t.Composite([IncludeOptionsSchema, MoveFilterSchema]);

const TypeRefSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  slug: t.String(),
});

const SpeciesRefSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  slug: t.String(),
});

const MoveCategorySchema = t.Object({
  id: t.Number(),
  slug: t.String(),
  name: t.String(),
  description: t.Nullable(t.String()),
});

const MoveTargetSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  slug: t.String(),
  description: t.Nullable(t.String()),
});

const MoveFlagTypeSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  slug: t.String(),
  description: t.Nullable(t.String()),
});

const StatSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
  name: t.String(),
});

const MoveBoostSchema = t.Object({
  stat: StatSchema,
  stages: t.Number(),
  isSelf: t.Boolean(),
});

const ConditionTypeSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
  name: t.String(),
});

const ConditionSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
  name: t.String(),
  type: ConditionTypeSchema,
  description: t.Nullable(t.String()),
});

const MoveEffectSchema = t.Object({
  conditionType: ConditionTypeSchema,
  condition: t.Nullable(ConditionSchema),
  chance: t.Number(),
  isSelf: t.Boolean(),
});

const MoveZDataSchema = t.Object({
  zPower: t.Nullable(t.Number()),
  zEffect: t.Nullable(t.String()),
  zCrystal: t.Nullable(t.String()),
  isZExclusive: t.Boolean(),
});

const MoveSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  slug: t.String(),
  desc: t.Nullable(t.String()),
  shortDesc: t.Nullable(t.String()),
  type: TypeRefSchema,
  category: MoveCategorySchema,
  target: t.Nullable(MoveTargetSchema),
  power: t.Nullable(t.Number()),
  accuracy: t.Nullable(t.Number()),
  pp: t.Number(),
  priority: t.Number(),
  critRatio: t.Nullable(t.Number()),
  minHits: t.Nullable(t.Number()),
  maxHits: t.Nullable(t.Number()),
  drainPercent: t.Nullable(t.Number()),
  healPercent: t.Nullable(t.Number()),
  recoilPercent: t.Nullable(t.Number()),
  flags: t.Array(MoveFlagTypeSchema),
  boosts: t.Array(MoveBoostSchema),
  effects: t.Array(MoveEffectSchema),
  maxPower: t.Nullable(t.Number()),
  zData: t.Nullable(MoveZDataSchema),
  gmaxSpecies: t.Array(SpeciesRefSchema),
});

export const MoveModel = {
  searchQuery: MoveSearchQuerySchema,
  searchResponse: PaginatedResponseSchema(MoveSchema),
  getOneQuery: IncludeOptionsSchema,
  getOneResponse: MoveSchema,
};
