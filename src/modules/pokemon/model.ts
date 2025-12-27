import { t } from 'elysia';

const RangeSchema = t.Optional(
  t.Object({
    gte: t.Optional(t.Number()),
    lte: t.Optional(t.Number()),
  })
);

export const PokemonSearchQuerySchema = t.Object({
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
});

const FormTypeSchema = t.Object({
  type: TypeRefSchema,
  slot: t.Number(),
});

const FormAbilitySchema = t.Object({
  ability: AbilityRefSchema,
  slot: t.Union([t.Literal('slot1'), t.Literal('slot2'), t.Literal('hidden')]),
});

const FormMoveSchema = t.Object({
  move: MoveRefSchema,
  method: t.String(),
  level: t.Nullable(t.Number()),
});

const ItemRefSchema = t.Object({
  id: t.String(),
  name: t.String(),
  source: t.String(),
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

const FormAspectComboSchema = t.Object({
  comboIndex: t.Number(),
  aspects: t.Array(AspectRefSchema),
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
  aspectChoices: t.Array(AspectRefSchema),
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
  overrides: t.Nullable(t.Object({})),
});

const SpeciesWithFormsSchema = t.Object({
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
  forms: t.Array(FormSchema),
});

export const PokemonSearchResponseSchema = t.Array(SpeciesWithFormsSchema);

export type PokemonSearchResponse = typeof PokemonSearchResponseSchema.static;

export const PokemonModel = {
  searchQuery: PokemonSearchQuerySchema,
  searchResponse: PokemonSearchResponseSchema,
};
