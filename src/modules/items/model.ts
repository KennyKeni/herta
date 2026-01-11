import { t } from 'elysia';
import { PaginatedResponseSchema } from '@/common/pagination';

export const IncludeOptionsSchema = t.Object({
  includeBoosts: t.Optional(t.Boolean()),
  includeFlags: t.Optional(t.Boolean()),
  includeTags: t.Optional(t.Boolean()),
  includeRecipes: t.Optional(t.Boolean()),
});

const ItemFilterSchema = t.Object({
  name: t.Optional(t.String()),
  itemIds: t.Optional(t.Array(t.Number())),
  tagIds: t.Optional(t.Array(t.Number())),
  tagSlugs: t.Optional(t.Array(t.String())),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
  offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
});

export const ItemSearchQuerySchema = t.Composite([IncludeOptionsSchema, ItemFilterSchema]);

const NamespaceRefSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
  name: t.String(),
});

const StatRefSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
  name: t.String(),
});

const ItemBoostSchema = t.Object({
  stat: StatRefSchema,
  stages: t.Number(),
});

const ItemFlagSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
  name: t.String(),
});

const ItemTagSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
  name: t.String(),
});

const ItemRefSchema = t.Object({
  id: t.Number(),
  name: t.String(),
});

const RecipeTypeSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
  name: t.String(),
});

const RecipeSlotTypeSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
  name: t.String(),
  description: t.Nullable(t.String()),
});

const RecipeInputSchema = t.Object({
  item: ItemRefSchema,
  slot: t.Nullable(t.Number()),
  slotType: t.Nullable(RecipeSlotTypeSchema),
});

const RecipeTagTypeSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
  name: t.String(),
});

const RecipeTagInputSchema = t.Object({
  tag: RecipeTagTypeSchema,
  slot: t.Nullable(t.Number()),
  slotType: t.Nullable(RecipeSlotTypeSchema),
});

const RecipeSchema = t.Object({
  id: t.Number(),
  type: RecipeTypeSchema,
  resultCount: t.Number(),
  experience: t.Nullable(t.Number()),
  cookingTime: t.Nullable(t.Number()),
  inputs: t.Array(RecipeInputSchema),
  tagInputs: t.Array(RecipeTagInputSchema),
});

const ItemSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
  name: t.String(),
  num: t.Nullable(t.Number()),
  desc: t.Nullable(t.String()),
  shortDesc: t.Nullable(t.String()),
  generation: t.Nullable(t.Number()),
  namespace: t.Nullable(NamespaceRefSchema),
  implemented: t.Boolean(),
  boosts: t.Array(ItemBoostSchema),
  flags: t.Array(ItemFlagSchema),
  tags: t.Array(ItemTagSchema),
  recipes: t.Array(RecipeSchema),
});

export const ItemModel = {
  searchQuery: ItemSearchQuerySchema,
  searchResponse: PaginatedResponseSchema(ItemSchema),
  getOneQuery: IncludeOptionsSchema,
  getOneResponse: ItemSchema,
};
