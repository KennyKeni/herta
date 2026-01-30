import { t } from 'elysia';
import { PaginatedResponseSchema } from '@/common/pagination';

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
  includeSpawns: t.Optional(t.Boolean()),
});

const PokemonFilterSchema = t.Object({
  name: t.Optional(t.String()),
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
  dropItemIds: t.Optional(t.Array(t.Number())),
  dropItemSlugs: t.Optional(t.Array(t.String())),

  generation: t.Optional(t.Number()),
  generations: t.Optional(t.Array(t.Number())),

  hpMin: t.Optional(t.Number()),
  hpMax: t.Optional(t.Number()),
  attackMin: t.Optional(t.Number()),
  attackMax: t.Optional(t.Number()),
  defenseMin: t.Optional(t.Number()),
  defenseMax: t.Optional(t.Number()),
  specialAttackMin: t.Optional(t.Number()),
  specialAttackMax: t.Optional(t.Number()),
  specialDefenseMin: t.Optional(t.Number()),
  specialDefenseMax: t.Optional(t.Number()),
  speedMin: t.Optional(t.Number()),
  speedMax: t.Optional(t.Number()),
  totalStatsMin: t.Optional(t.Number()),
  totalStatsMax: t.Optional(t.Number()),

  heightMin: t.Optional(t.Number()),
  heightMax: t.Optional(t.Number()),
  weightMin: t.Optional(t.Number()),
  weightMax: t.Optional(t.Number()),

  catchRateMin: t.Optional(t.Number()),
  catchRateMax: t.Optional(t.Number()),
  baseFriendshipMin: t.Optional(t.Number()),
  baseFriendshipMax: t.Optional(t.Number()),
  eggCyclesMin: t.Optional(t.Number()),
  eggCyclesMax: t.Optional(t.Number()),
  maleRatioMin: t.Optional(t.Number()),
  maleRatioMax: t.Optional(t.Number()),
  baseExperienceYieldMin: t.Optional(t.Number()),
  baseExperienceYieldMax: t.Optional(t.Number()),

  isDefaultForm: t.Optional(t.Boolean()),
  hasDrops: t.Optional(t.Boolean()),
  isRideable: t.Optional(t.Boolean()),
  isGenderless: t.Optional(t.Boolean()),

  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
  offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
});

export const PokemonSearchQuerySchema = t.Composite([IncludeOptionsSchema, PokemonFilterSchema]);

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
  catchRate: t.Number(),
  baseFriendship: t.Number(),
  eggCycles: t.Number(),
  maleRatio: t.Nullable(t.Number()),
  baseScale: t.Nullable(t.Number()),
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
  experienceGroup: t.Nullable(
    t.Object({
      id: t.Number(),
      slug: t.String(),
      name: t.String(),
      formula: t.String(),
    })
  ),
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

const CreateSpeciesHitboxSchema = t.Object({
  width: t.Number(),
  height: t.Number(),
  fixed: t.Boolean(),
});

const CreateSpeciesLightingSchema = t.Object({
  lightLevel: t.Number(),
  liquidGlowMode: t.Optional(t.Nullable(t.String())),
});

const CreateSpeciesRidingSchema = t.Object({
  data: t.Unknown(),
});

const CreateFormTypeSchema = t.Object({
  typeId: t.Number(),
  slot: t.Number(),
});

const CreateFormAbilitySchema = t.Object({
  abilityId: t.Number(),
  slotId: t.Number(),
});

const CreateFormHitboxSchema = t.Object({
  width: t.Number(),
  height: t.Number(),
  fixed: t.Boolean(),
});

const CreateFormOverridesSchema = t.Object({
  catchRate: t.Optional(t.Nullable(t.Number())),
  baseFriendship: t.Optional(t.Nullable(t.Number())),
  eggCycles: t.Optional(t.Nullable(t.Number())),
  maleRatio: t.Optional(t.Nullable(t.Number())),
  baseScale: t.Optional(t.Nullable(t.Number())),
});

const CreateFormDropPercentageSchema = t.Object({
  itemId: t.Number(),
  percentage: t.Number(),
});

const CreateFormDropRangeSchema = t.Object({
  itemId: t.Number(),
  quantityMin: t.Number(),
  quantityMax: t.Number(),
});

const CreateFormDropsSchema = t.Object({
  amount: t.Number(),
  percentages: t.Optional(t.Array(CreateFormDropPercentageSchema)),
  ranges: t.Optional(t.Array(CreateFormDropRangeSchema)),
});

const CreateFormAspectComboSchema = t.Object({
  comboIndex: t.Number(),
  aspectIds: t.Array(t.Number()),
});

const CreateFormBehaviourSchema = t.Object({
  data: t.Unknown(),
});

const CreateFormMoveSchema = t.Object({
  moveId: t.Number(),
  methodId: t.Number(),
  level: t.Optional(t.Nullable(t.Number())),
});

const CreateFormBodySchema = t.Object({
  id: t.Number(),
  speciesId: t.Number(),
  name: t.String(),
  formName: t.String(),
  description: t.Optional(t.Nullable(t.String())),
  generation: t.Optional(t.Nullable(t.Number())),
  height: t.Number(),
  weight: t.Number(),
  baseHp: t.Number(),
  baseAttack: t.Number(),
  baseDefence: t.Number(),
  baseSpecialAttack: t.Number(),
  baseSpecialDefence: t.Number(),
  baseSpeed: t.Number(),
  baseExperienceYield: t.Optional(t.Nullable(t.Number())),
  evHp: t.Optional(t.Number({ default: 0 })),
  evAttack: t.Optional(t.Number({ default: 0 })),
  evDefence: t.Optional(t.Number({ default: 0 })),
  evSpecialAttack: t.Optional(t.Number({ default: 0 })),
  evSpecialDefence: t.Optional(t.Number({ default: 0 })),
  evSpeed: t.Optional(t.Number({ default: 0 })),
  types: t.Optional(t.Array(CreateFormTypeSchema)),
  abilities: t.Optional(t.Array(CreateFormAbilitySchema)),
  labelIds: t.Optional(t.Array(t.Number())),
  aspectChoiceIds: t.Optional(t.Array(t.Number())),
  hitbox: t.Optional(t.Nullable(CreateFormHitboxSchema)),
  overrides: t.Optional(t.Nullable(CreateFormOverridesSchema)),
  drops: t.Optional(t.Nullable(CreateFormDropsSchema)),
  aspectCombos: t.Optional(t.Array(CreateFormAspectComboSchema)),
  behaviour: t.Optional(t.Nullable(CreateFormBehaviourSchema)),
  moves: t.Optional(t.Array(CreateFormMoveSchema)),
});

const CreateSpeciesBodySchema = t.Object({
  id: t.Number(),
  name: t.String(),
  description: t.Optional(t.Nullable(t.String())),
  generation: t.Number(),
  catchRate: t.Number(),
  baseFriendship: t.Number(),
  eggCycles: t.Number(),
  maleRatio: t.Optional(t.Nullable(t.Number())),
  baseScale: t.Optional(t.Nullable(t.Number())),
  experienceGroupId: t.Optional(t.Nullable(t.Number())),
  eggGroupIds: t.Optional(t.Array(t.Number())),
  hitbox: t.Optional(t.Nullable(CreateSpeciesHitboxSchema)),
  lighting: t.Optional(t.Nullable(CreateSpeciesLightingSchema)),
  riding: t.Optional(t.Nullable(CreateSpeciesRidingSchema)),
  forms: t.Optional(t.Array(CreateFormBodySchema)),
});

const UpdateSpeciesBodySchema = t.Object({
  name: t.Optional(t.String()),
  description: t.Optional(t.Nullable(t.String())),
  generation: t.Optional(t.Number()),
  catchRate: t.Optional(t.Number()),
  baseFriendship: t.Optional(t.Number()),
  eggCycles: t.Optional(t.Number()),
  maleRatio: t.Optional(t.Nullable(t.Number())),
  baseScale: t.Optional(t.Nullable(t.Number())),
  experienceGroupId: t.Optional(t.Nullable(t.Number())),
  eggGroupIds: t.Optional(t.Array(t.Number())),
  hitbox: t.Optional(t.Nullable(CreateSpeciesHitboxSchema)),
  lighting: t.Optional(t.Nullable(CreateSpeciesLightingSchema)),
  riding: t.Optional(t.Nullable(CreateSpeciesRidingSchema)),
});

const CreateSpeciesResponseSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
});

const UpdateSpeciesResponseSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
});

const UpdateFormBodySchema = t.Object({
  name: t.Optional(t.String()),
  formName: t.Optional(t.String()),
  description: t.Optional(t.Nullable(t.String())),
  generation: t.Optional(t.Nullable(t.Number())),
  height: t.Optional(t.Number()),
  weight: t.Optional(t.Number()),
  baseHp: t.Optional(t.Number()),
  baseAttack: t.Optional(t.Number()),
  baseDefence: t.Optional(t.Number()),
  baseSpecialAttack: t.Optional(t.Number()),
  baseSpecialDefence: t.Optional(t.Number()),
  baseSpeed: t.Optional(t.Number()),
  baseExperienceYield: t.Optional(t.Nullable(t.Number())),
  evHp: t.Optional(t.Number()),
  evAttack: t.Optional(t.Number()),
  evDefence: t.Optional(t.Number()),
  evSpecialAttack: t.Optional(t.Number()),
  evSpecialDefence: t.Optional(t.Number()),
  evSpeed: t.Optional(t.Number()),
  types: t.Optional(t.Array(CreateFormTypeSchema)),
  abilities: t.Optional(t.Array(CreateFormAbilitySchema)),
  labelIds: t.Optional(t.Array(t.Number())),
  aspectChoiceIds: t.Optional(t.Array(t.Number())),
  hitbox: t.Optional(t.Nullable(CreateFormHitboxSchema)),
  overrides: t.Optional(t.Nullable(CreateFormOverridesSchema)),
  drops: t.Optional(t.Nullable(CreateFormDropsSchema)),
  aspectCombos: t.Optional(t.Array(CreateFormAspectComboSchema)),
  behaviour: t.Optional(t.Nullable(CreateFormBehaviourSchema)),
  moves: t.Optional(t.Array(CreateFormMoveSchema)),
});

const CreateFormResponseSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
});

const UpdateFormResponseSchema = t.Object({
  id: t.Number(),
  slug: t.String(),
});

const AttachImageBodySchema = t.Object({
  isPrimary: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Number()),
});

const SuccessResponseSchema = t.Object({
  success: t.Boolean(),
});

export const PokemonModel = {
  searchQuery: PokemonSearchQuerySchema,
  searchResponse: PaginatedResponseSchema(SpeciesWithFormsSchema),
  getOneQuery: IncludeOptionsSchema,
  getOneResponse: SpeciesWithFormsSchema,
  getFormQuery: IncludeOptionsSchema,
  getFormResponse: SpeciesWithFormSchema,
  createSpeciesBody: CreateSpeciesBodySchema,
  updateSpeciesBody: UpdateSpeciesBodySchema,
  createSpeciesResponse: CreateSpeciesResponseSchema,
  updateSpeciesResponse: UpdateSpeciesResponseSchema,
  createFormBody: CreateFormBodySchema,
  updateFormBody: UpdateFormBodySchema,
  createFormResponse: CreateFormResponseSchema,
  updateFormResponse: UpdateFormResponseSchema,
  attachImageBody: AttachImageBodySchema,
  successResponse: SuccessResponseSchema,
};
