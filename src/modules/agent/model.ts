import { t, type Static } from 'elysia';

// Request Models

const RangeFilter = t.Optional(
  t.Object({
    gte: t.Optional(t.Number()),
    lte: t.Optional(t.Number()),
  })
);

export const AgentPokemonQuerySchema = t.Object({
  // Text search (pg_trgm)
  name: t.Optional(t.String({ description: 'Fuzzy match on Pokemon name' })),

  dex: t.Optional(t.Number({ description: 'National Pokedex number' })),
  generation: t.Optional(t.Number({ description: 'Generation introduced' })),

  // Array filters
  types: t.Optional(t.Array(t.String(), { description: 'Has any of these types' })),
  abilities: t.Optional(t.Array(t.String(), { description: 'Has any of these abilities' })),
  moves: t.Optional(t.Array(t.String(), { description: 'Can learn any of these moves' })),
  eggGroups: t.Optional(t.Array(t.String(), { description: 'Belongs to any of these egg groups' })),
  formCategories: t.Optional(
    t.Array(t.String(), {
      description: 'Form types: mega, gmax, alola, galar, hisui, paldea, etc.',
    })
  ),

  // Boolean filters
  // isDefaultForm: t.Optional(
  //   t.Boolean({ description: 'Filter to base forms only (true) or variants only (false)' })
  // ),
  canRide: t.Optional(t.Boolean({ description: 'Filter to rideable Pokemon' })),

  // Stat ranges
  hp: RangeFilter,
  attack: RangeFilter,
  defense: RangeFilter,
  spAtk: RangeFilter,
  spDef: RangeFilter,
  speed: RangeFilter,
  totalStats: RangeFilter,

  // Physical ranges
  height: RangeFilter,
  weight: RangeFilter,

  // Other numeric ranges
  catchRate: RangeFilter,

  // Include flags for optional data
  include: t.Optional(
    t.Array(
      t.Union([
        t.Literal('moves'),
        t.Literal('abilities'),
        t.Literal('evYield'),
        t.Literal('breeding'),
        t.Literal('drops'),
        t.Literal('cosmetics'),
      ]),
      { description: 'Additional data to include in response' }
    )
  ),

  // Pagination
  limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
  offset: t.Optional(t.Number({ minimum: 0, default: 0 })),
});

export type AgentPokemonQuery = Static<typeof AgentPokemonQuerySchema>;

// Response Models

const StatsSchema = t.Object({
  hp: t.Number(),
  attack: t.Number(),
  defense: t.Number(),
  spAtk: t.Number(),
  spDef: t.Number(),
  speed: t.Number(),
  total: t.Number(),
});

const EvYieldSchema = t.Object({
  hp: t.Number(),
  attack: t.Number(),
  defense: t.Number(),
  spAtk: t.Number(),
  spDef: t.Number(),
  speed: t.Number(),
});

const BreedingInfoSchema = t.Object({
  eggGroups: t.Array(t.String()),
  eggCycles: t.Number(),
  baseFriendship: t.Number(),
  maleRatio: t.Nullable(t.Number({ description: 'Null if genderless' })),
  expGroup: t.String(),
});

const AbilityRefSchema = t.Object({
  name: t.String(),
  slot: t.Union([t.Literal('slot1'), t.Literal('slot2'), t.Literal('hidden')]),
});

const MoveRefSchema = t.Object({
  name: t.String(),
  method: t.String(),
  level: t.Nullable(t.Number()),
});

const DropRefSchema = t.Object({
  item: t.String(),
  chance: t.Optional(t.Number({ description: 'Percentage chance (0-100)' })),
  quantityMin: t.Optional(t.Number()),
  quantityMax: t.Optional(t.Number()),
});

const ApplicableCosmeticsSchema = t.Object({
  combos: t.Array(t.Array(t.String()), {
    description: "Valid category combinations, e.g., [['cream', 'sweet'], ['cream']]",
  }),
  categories: t.Record(t.String(), t.Array(t.String()), {
    description: "Available choices per category, e.g., { cream: ['vanilla-cream', ...] }",
  }),
});

export const AgentPokemonSchema = t.Object({
  // Identity
  name: t.String({ description: 'Display name (form full name)' }),
  speciesName: t.String({ description: 'Species name for grouping' }),
  dexNumber: t.Number({ description: 'National Pokedex number' }),
  generation: t.Number(),
  isDefaultForm: t.Boolean(),
  formCategory: t.Nullable(t.String({ description: 'mega, gmax, alola, etc. Null if base form' })),
  description: t.Nullable(t.String({ description: 'Flavor text' })),

  // Core attributes
  types: t.Array(t.String()),
  stats: StatsSchema,
  catchRate: t.Number(),

  // Physical
  height: t.Number({ description: 'Height in decimeters' }),
  weight: t.Number({ description: 'Weight in hectograms' }),

  // Tags
  labels: t.Array(t.String()),
  formTags: t.Array(t.String()),

  // Cobblemon
  canRide: t.Boolean(),

  // Optional inclusions (only present if requested via include param)
  abilities: t.Optional(t.Array(AbilityRefSchema)),
  moves: t.Optional(t.Array(MoveRefSchema)),
  evYield: t.Optional(EvYieldSchema),
  breeding: t.Optional(BreedingInfoSchema),
  drops: t.Optional(t.Array(DropRefSchema)),
  cosmetics: t.Optional(ApplicableCosmeticsSchema),
});

export type AgentPokemon = Static<typeof AgentPokemonSchema>;

export const AgentPokemonResponseSchema = t.Object({
  results: t.Array(AgentPokemonSchema),
  meta: t.Object({
    total: t.Number(),
    limit: t.Number(),
    offset: t.Number(),
  }),
});

export type AgentPokemonResponse = Static<typeof AgentPokemonResponseSchema>;
