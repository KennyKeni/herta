import { t } from 'elysia';

const RangeSchema = t.Optional(
  t.Object({
    gte: t.Optional(t.Number()),
    lte: t.Optional(t.Number()),
  })
);

export const IncludeOptionsSchema = t.Object({
  includeTypes: t.Optional(t.Boolean()),
  includeAbilities: t.Optional(t.Boolean()),
  includeMoves: t.Optional(t.Boolean()),
  includeLabels: t.Optional(t.Boolean()),
  includeAspects: t.Optional(t.Boolean()),
  includeDrops: t.Optional(t.Boolean()),
  includeEggGroups: t.Optional(t.Boolean()),
  includeExperienceGroup: t.Optional(t.Boolean()),
  includeHitboxes: t.Optional(t.Boolean()),
  includeLighting: t.Optional(t.Boolean()),
  includeRiding: t.Optional(t.Boolean()),
  includeBehaviour: t.Optional(t.Boolean()),
  includeOverrides: t.Optional(t.Boolean()),
  includeSpawns: t.Optional(t.Boolean()),
});

export type IncludeOptionsQuery = typeof IncludeOptionsSchema.static;

const PokemonFilterSchema = t.Object({
  formIds: t.Optional(t.Array(t.Number())),
  formSlugs: t.Optional(t.Array(t.String())),
  speciesIds: t.Optional(t.Array(t.Number())),
  speciesSlugs: t.Optional(t.Array(t.String())),

  typeIds: t.Optional(t.Array(t.Number())),
  typeSlugs: t.Optional(t.Array(t.String())),
  abilityIds: t.Optional(t.Array(t.Number())),
  abilitySlugs: t.Optional(t.Array(t.String())),
  moveIds: t.Optional(t.Array(t.Number())),
  moveSlugs: t.Optional(t.Array(t.String())),
  eggGroupIds: t.Optional(t.Array(t.Number())),
  eggGroupSlugs: t.Optional(t.Array(t.String())),
  labelIds: t.Optional(t.Array(t.Number())),
  labelSlugs: t.Optional(t.Array(t.String())),
  experienceGroupIds: t.Optional(t.Array(t.Number())),
  experienceGroupSlugs: t.Optional(t.Array(t.String())),

  biomeIds: t.Optional(t.Array(t.Number())),
  biomeSlugs: t.Optional(t.Array(t.String())),
  biomeTagIds: t.Optional(t.Array(t.Number())),
  biomeTagSlugs: t.Optional(t.Array(t.String())),
  spawnBucketIds: t.Optional(t.Array(t.Number())),
  spawnBucketSlugs: t.Optional(t.Array(t.String())),

  generation: t.Optional(t.Number()),
  generations: t.Optional(t.Array(t.Number())),

  hp: RangeSchema,
  attack: RangeSchema,
  defense: RangeSchema,
  specialAttack: RangeSchema,
  specialDefense: RangeSchema,
  speed: RangeSchema,
  totalStats: RangeSchema,

  height: RangeSchema,
  weight: RangeSchema,

  catchRate: RangeSchema,
  baseFriendship: RangeSchema,
  eggCycles: RangeSchema,
  maleRatio: RangeSchema,
  baseExperienceYield: RangeSchema,

  isDefaultForm: t.Optional(t.Boolean()),
  hasDrops: t.Optional(t.Boolean()),
  isRideable: t.Optional(t.Boolean()),
  isGenderless: t.Optional(t.Boolean()),

  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
  offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
});

export const PokemonSearchQuerySchema = t.Composite([IncludeOptionsSchema, PokemonFilterSchema]);

export type PokemonSearchQuery = typeof PokemonSearchQuerySchema.static;

const TypeRefSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  slug: t.String(),
});

const AbilityRefSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  slug: t.String(),
});

const MoveRefSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  slug: t.String(),
});

const LabelSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  slug: t.String(),
});

const EggGroupSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  slug: t.String(),
});

const AbilitySlotRefSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
  name: t.String(),
});

const MoveLearnMethodRefSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
  name: t.String(),
});

const FormTypeSchema = t.Object({
  type: TypeRefSchema,
  slot: t.Number(),
});

const FormAbilitySchema = t.Object({
  ability: AbilityRefSchema,
  slot: AbilitySlotRefSchema,
});

const FormMoveSchema = t.Object({
  move: MoveRefSchema,
  method: MoveLearnMethodRefSchema,
  level: t.Nullable(t.Number()),
});

const ItemRefSchema = t.Object({
  id: t.Number(),
  name: t.String(),
});

const DropPercentageSchema = t.Object({
  item: ItemRefSchema,
  percentage: t.Number(),
});

const DropRangeSchema = t.Object({
  item: ItemRefSchema,
  quantityMin: t.Number(),
  quantityMax: t.Number(),
});

const FormDropsSchema = t.Object({
  amount: t.Number(),
  percentages: t.Array(DropPercentageSchema),
  ranges: t.Array(DropRangeSchema),
});

const AspectRefSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  slug: t.String(),
});

const AspectChoiceRefSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
  name: t.String(),
  value: t.String(),
});

const FormAspectComboSchema = t.Object({
  comboIndex: t.Number(),
  aspects: t.Array(AspectRefSchema),
});

const SpawnBucketRefSchema = t.Object({
  id: t.Number(),
  name: t.String(),
});

const SpawnPositionTypeRefSchema = t.Object({
  id: t.Number(),
  name: t.String(),
});

const BiomeRefSchema = t.Object({
  id: t.Number(),
  name: t.String(),
});

const BiomeTagRefSchema = t.Object({
  id: t.Number(),
  name: t.String(),
});

const TimeRangeRefSchema = t.Object({
  id: t.Number(),
  name: t.String(),
});

const MoonPhaseRefSchema = t.Object({
  id: t.Number(),
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
  biomes: t.Array(BiomeRefSchema),
  biomeTags: t.Array(BiomeTagRefSchema),
  timeRanges: t.Array(TimeRangeRefSchema),
  moonPhases: t.Array(MoonPhaseRefSchema),
  weather: t.Nullable(SpawnConditionWeatherSchema),
  sky: t.Nullable(SpawnConditionSkySchema),
  position: t.Nullable(SpawnConditionPositionSchema),
  lure: t.Nullable(SpawnConditionLureSchema),
});

const FormSpawnSchema = t.Object({
  id: t.Number(),
  bucket: SpawnBucketRefSchema,
  positionType: SpawnPositionTypeRefSchema,
  weight: t.Number(),
  levelMin: t.Number(),
  levelMax: t.Number(),
  conditions: t.Array(SpawnConditionSchema),
});

const FormSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  fullName: t.String(),
  slug: t.String(),
  description: t.Nullable(t.String()),
  generation: t.Nullable(t.Number()),
  height: t.Number(),
  weight: t.Number(),
  baseHp: t.Number(),
  baseAttack: t.Number(),
  baseDefence: t.Number(),
  baseSpecialAttack: t.Number(),
  baseSpecialDefence: t.Number(),
  baseSpeed: t.Number(),
  baseExperienceYield: t.Nullable(t.Number()),
  evHp: t.Number(),
  evAttack: t.Number(),
  evDefence: t.Number(),
  evSpecialAttack: t.Number(),
  evSpecialDefence: t.Number(),
  evSpeed: t.Number(),
  labels: t.Array(LabelSchema),
  aspectChoices: t.Array(AspectChoiceRefSchema),
  types: t.Array(FormTypeSchema),
  abilities: t.Array(FormAbilitySchema),
  moves: t.Array(FormMoveSchema),
  hitbox: t.Nullable(
    t.Object({
      width: t.Number(),
      height: t.Number(),
      fixed: t.Boolean(),
    })
  ),
  drops: t.Nullable(FormDropsSchema),
  aspectCombos: t.Array(FormAspectComboSchema),
  behaviour: t.Nullable(t.Object({ data: t.Unknown() })),
  spawns: t.Array(FormSpawnSchema),
});

const SpeciesSchema = t.Object({
  id: t.Number(),
  name: t.String(),
  slug: t.String(),
  description: t.Nullable(t.String()),
  generation: t.Number(),
  baseFriendship: t.Number(),
  baseScale: t.Nullable(t.Number()),
  catchRate: t.Number(),
  eggCycles: t.Number(),
  experienceGroup: t.Nullable(
    t.Object({
      id: t.Number(),
      slug: t.String(),
      name: t.String(),
      formula: t.String(),
    })
  ),
  maleRatio: t.Nullable(t.Number()),
  eggGroups: t.Array(EggGroupSchema),
  hitbox: t.Nullable(
    t.Object({
      width: t.Number(),
      height: t.Number(),
      fixed: t.Boolean(),
    })
  ),
  lighting: t.Nullable(
    t.Object({
      lightLevel: t.Number(),
      liquidGlowMode: t.Nullable(t.String()),
    })
  ),
  riding: t.Nullable(t.Object({ data: t.Unknown() })),
});

const SpeciesWithFormsSchema = t.Composite([
  SpeciesSchema,
  t.Object({ forms: t.Array(FormSchema) }),
]);

const SpeciesWithFormSchema = t.Composite([SpeciesSchema, t.Object({ form: FormSchema })]);

export const PokemonSearchResponseSchema = t.Array(SpeciesWithFormsSchema);

export type PokemonSearchResponse = typeof PokemonSearchResponseSchema.static;

export const PokemonModel = {
  searchQuery: PokemonSearchQuerySchema,
  searchResponse: PokemonSearchResponseSchema,
  getOneQuery: IncludeOptionsSchema,
  getOneResponse: SpeciesWithFormsSchema,
  getFormQuery: IncludeOptionsSchema,
  getFormResponse: SpeciesWithFormSchema,
};
