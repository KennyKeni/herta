import { t } from 'elysia';
import { PaginatedResponseSchema } from '@/common/pagination';

const RefSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
  name: t.String(),
});

const SpawnConditionWeatherSchema = t.Object({
  isRaining: t.Nullable(t.Boolean()),
  isThundering: t.Nullable(t.Boolean()),
});

const SpawnConditionSkySchema = t.Object({
  canSeeSky: t.Nullable(t.Boolean()),
  minSkyLight: t.Nullable(t.Number()),
  maxSkyLight: t.Nullable(t.Number()),
});

const SpawnConditionPositionSchema = t.Object({
  minY: t.Nullable(t.Number()),
  maxY: t.Nullable(t.Number()),
});

const SpawnConditionLureSchema = t.Object({
  minLureLevel: t.Nullable(t.Number()),
  maxLureLevel: t.Nullable(t.Number()),
});

const SpawnConditionSchema = t.Object({
  id: t.Number(),
  type: t.String(),
  multiplier: t.Nullable(t.Number()),
  biomes: t.Array(RefSchema),
  biomeTags: t.Array(RefSchema),
  timeRanges: t.Array(RefSchema),
  moonPhases: t.Array(RefSchema),
  weather: t.Nullable(SpawnConditionWeatherSchema),
  sky: t.Nullable(SpawnConditionSkySchema),
  position: t.Nullable(SpawnConditionPositionSchema),
  lure: t.Nullable(SpawnConditionLureSchema),
});

const SpawnPresetSchema = t.Object({
  presetType: RefSchema,
});

const SpawnSchema = t.Object({
  id: t.Number(),
  formId: t.Number(),
  bucket: RefSchema,
  positionType: RefSchema,
  weight: t.Number(),
  levelMin: t.Number(),
  levelMax: t.Number(),
  presets: t.Array(SpawnPresetSchema),
  conditions: t.Array(SpawnConditionSchema),
});

const SpawnSearchQuerySchema = t.Object({
  formIds: t.Optional(t.Array(t.Number())),
  bucketIds: t.Optional(t.Array(t.Number())),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
  offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
});

export const SpawnModel = {
  searchQuery: SpawnSearchQuerySchema,
  searchResponse: PaginatedResponseSchema(SpawnSchema),
};
