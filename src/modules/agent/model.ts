import { type Static, t } from 'elysia';

const PaginationSchema = t.Object({
  limit: t.Optional(
    t.Number({
      minimum: 1,
      maximum: 100,
      default: 5,
      description: 'Max results to return (1-100, default 5)',
    })
  ),
  offset: t.Optional(
    t.Number({ minimum: 0, default: 0, description: 'Number of results to skip for pagination' })
  ),
});

const AgentPokemonFilterSchema = t.Object({
  names: t.Optional(
    t.Array(t.String(), {
      description: 'Fuzzy match Pokemon or form names (e.g., "pikachu", "mega charizard")',
    })
  ),
  types: t.Optional(
    t.Array(t.String(), {
      description:
        'Filter by type names (e.g., "fire", "water"). Returns Pokemon with any matching type',
    })
  ),
  abilities: t.Optional(
    t.Array(t.String(), {
      description:
        'Filter by ability names (e.g., "levitate"). Returns Pokemon with any matching ability',
    })
  ),
  moves: t.Optional(
    t.Array(t.String(), {
      description:
        'Filter by learnable move names (e.g., "thunderbolt"). Returns Pokemon that can learn any matching move',
    })
  ),
  eggGroups: t.Optional(
    t.Array(t.String(), {
      description:
        'Filter by egg group names (e.g., "dragon", "monster"). Returns Pokemon in any matching egg group',
    })
  ),
  labels: t.Optional(
    t.Array(t.String(), {
      description:
        'Filter by label names (e.g., "legendary", "starter"). Returns Pokemon with any matching label',
    })
  ),
  generation: t.Optional(
    t.Union([t.Number(), t.Array(t.Number())], {
      description: 'Filter by generation number(s) (e.g., 1 or [1, 2, 3])',
    })
  ),

  includeDescription: t.Optional(t.Boolean({ description: 'Include Pokedex description text' })),
  includeGeneration: t.Optional(
    t.Boolean({ description: 'Include generation number the Pokemon was introduced in' })
  ),
  includeStats: t.Optional(
    t.Boolean({
      description: 'Include base stats (HP, Attack, Defense, Sp.Atk, Sp.Def, Speed, Total)',
    })
  ),
  includeEvYield: t.Optional(
    t.Boolean({ description: 'Include EV yield when defeated (for training optimization)' })
  ),
  includePhysical: t.Optional(
    t.Boolean({ description: 'Include height (decimeters) and weight (hectograms)' })
  ),
  includeTypes: t.Optional(
    t.Boolean({ description: 'Include type names (e.g., ["Fire", "Flying"])' })
  ),
  includeAbilities: t.Optional(
    t.Boolean({ description: 'Include abilities with slot info (slot1, slot2, hidden)' })
  ),
  includeMoves: t.Optional(
    t.Boolean({
      description: 'Include learnable moves with learn method and level. Can be large (100+ moves)',
    })
  ),
  includeDrops: t.Optional(
    t.Boolean({
      description: 'Include Cobblemon item drops when defeated (item name, chance, quantity)',
    })
  ),
  includeBreeding: t.Optional(
    t.Boolean({ description: 'Include breeding stats: egg cycles, base friendship, male ratio' })
  ),
  includeEggGroups: t.Optional(
    t.Boolean({ description: 'Include egg group names for breeding compatibility' })
  ),
  includeExperienceGroup: t.Optional(
    t.Boolean({ description: 'Include experience/leveling group (e.g., "medium_slow", "erratic")' })
  ),
  includeLabels: t.Optional(
    t.Boolean({
      description: 'Include classification labels (e.g., "legendary", "mythical", "starter")',
    })
  ),
  includeAspects: t.Optional(
    t.Boolean({
      description: 'Include cosmetic aspects: choosable variants and valid aspect combinations',
    })
  ),
  includeHitboxes: t.Optional(
    t.Boolean({ description: 'Include Cobblemon hitbox dimensions (width, height, fixed)' })
  ),
  includeLighting: t.Optional(
    t.Boolean({
      description: 'Include Cobblemon lighting properties (light level, liquid glow mode)',
    })
  ),
  includeRiding: t.Optional(
    t.Boolean({ description: 'Include Cobblemon mount/riding configuration data' })
  ),
  includeBehaviour: t.Optional(
    t.Boolean({ description: 'Include Cobblemon AI behaviour configuration. Can be large' })
  ),
});

export const AgentPokemonQuerySchema = t.Composite([AgentPokemonFilterSchema, PaginationSchema]);

export type AgentPokemonQuery = Static<typeof AgentPokemonQuerySchema>;

const StatsSchema = t.Object({
  hp: t.Number({ description: 'Base HP stat' }),
  attack: t.Number({ description: 'Base Attack stat' }),
  defense: t.Number({ description: 'Base Defense stat' }),
  spAtk: t.Number({ description: 'Base Special Attack stat' }),
  spDef: t.Number({ description: 'Base Special Defense stat' }),
  speed: t.Number({ description: 'Base Speed stat' }),
  total: t.Number({ description: 'Base stat total (sum of all stats)' }),
});

const EvYieldSchema = t.Object({
  hp: t.Number({ description: 'HP EVs gained when defeated' }),
  attack: t.Number({ description: 'Attack EVs gained when defeated' }),
  defense: t.Number({ description: 'Defense EVs gained when defeated' }),
  spAtk: t.Number({ description: 'Special Attack EVs gained when defeated' }),
  spDef: t.Number({ description: 'Special Defense EVs gained when defeated' }),
  speed: t.Number({ description: 'Speed EVs gained when defeated' }),
});

const BreedingSchema = t.Object({
  eggCycles: t.Number({ description: 'Egg cycles to hatch (each cycle = 257 steps)' }),
  baseFriendship: t.Number({ description: 'Initial friendship when caught/hatched (0-255)' }),
  maleRatio: t.Nullable(
    t.Number({ description: 'Probability of being male (0.0-1.0). Null if genderless' })
  ),
});

const AbilitySchema = t.Object({
  name: t.String({ description: 'Ability name' }),
  slot: t.String({ description: 'Ability slot name (e.g., slot1, slot2, hidden)' }),
});

const MoveSchema = t.Object({
  name: t.String({ description: 'Move name' }),
  method: t.String({ description: 'How learned (e.g., "level_up", "tm", "egg", "tutor")' }),
  level: t.Nullable(t.Number({ description: 'Level learned at (null if not level-based)' })),
});

const DropSchema = t.Object({
  item: t.String({ description: 'Dropped item name' }),
  chance: t.Optional(t.Number({ description: 'Drop chance percentage (0-100)' })),
  quantityMin: t.Optional(t.Number({ description: 'Min quantity (for range-based drops)' })),
  quantityMax: t.Optional(t.Number({ description: 'Max quantity (for range-based drops)' })),
});

const CosmeticsSchema = t.Object({
  aspectChoices: t.Array(t.String(), { description: 'Individual choosable aspects' }),
  aspectCombos: t.Array(t.Array(t.String()), { description: 'Valid aspect combinations' }),
});

const HitboxSchema = t.Object({
  width: t.Number({ description: 'Hitbox width in blocks' }),
  height: t.Number({ description: 'Hitbox height in blocks' }),
  fixed: t.Boolean({ description: 'Whether hitbox scales with Pokemon size' }),
});

const LightingSchema = t.Object({
  lightLevel: t.Number({ description: 'Light level emitted (0-15)' }),
  liquidGlowMode: t.Nullable(t.String({ description: 'Special glow behavior in liquids' })),
});

const PhysicalSchema = t.Object({
  height: t.Number({ description: 'Height in decimeters (divide by 10 for meters)' }),
  weight: t.Number({ description: 'Weight in hectograms (divide by 10 for kg)' }),
});

export const AgentPokemonSchema = t.Object({
  name: t.String({ description: 'Form name (e.g., "Base", "Mega Charizard X")' }),
  slug: t.String({ description: 'Form slug for URLs (e.g., "charizard", "charizard-mega-x")' }),
  speciesName: t.String({ description: 'Species name (e.g., "Charizard")' }),

  description: t.Optional(t.Nullable(t.String({ description: 'Pokedex flavor text' }))),
  generation: t.Optional(t.Number({ description: 'Generation introduced (1-9)' })),
  stats: t.Optional(StatsSchema),
  evYield: t.Optional(EvYieldSchema),
  physical: t.Optional(PhysicalSchema),

  types: t.Optional(t.Array(t.String(), { description: 'Type names in slot order' })),
  abilities: t.Optional(t.Array(AbilitySchema)),
  moves: t.Optional(t.Array(MoveSchema)),
  drops: t.Optional(t.Array(DropSchema)),

  breeding: t.Optional(BreedingSchema),
  eggGroups: t.Optional(t.Array(t.String(), { description: 'Egg groups for breeding' })),
  experienceGroup: t.Optional(t.Nullable(t.String({ description: 'Leveling curve group' }))),

  labels: t.Optional(t.Array(t.String(), { description: 'Classification labels' })),
  cosmetics: t.Optional(CosmeticsSchema),

  hitbox: t.Optional(t.Nullable(HitboxSchema)),
  lighting: t.Optional(t.Nullable(LightingSchema)),
  riding: t.Optional(
    t.Nullable(t.Object({ data: t.Unknown() }, { description: 'Cobblemon riding config' }))
  ),
  behaviour: t.Optional(
    t.Nullable(t.Object({ data: t.Unknown() }, { description: 'Cobblemon AI behaviour config' }))
  ),
});

export type AgentPokemon = Static<typeof AgentPokemonSchema>;

export const AgentPokemonResponseSchema = t.Object({
  results: t.Array(AgentPokemonSchema, { description: 'Matching Pokemon forms' }),
  total: t.Number({ description: 'Total matching results (for pagination)' }),
  limit: t.Number({ description: 'Results per page' }),
  offset: t.Number({ description: 'Results skipped' }),
});

export type AgentPokemonResponse = Static<typeof AgentPokemonResponseSchema>;

export const AgentArticleResponseSchema = t.Nullable(
  t.Object({
    id: t.Number(),
    slug: t.String(),
    title: t.String(),
    subtitle: t.Nullable(t.String()),
    description: t.Nullable(t.String()),
    body: t.String(),
    author: t.Nullable(t.String()),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  })
);

export type AgentArticleResponse = Static<typeof AgentArticleResponseSchema>;

const AgentAbilityFilterSchema = t.Object({
  names: t.Optional(
    t.Array(t.String(), {
      description: 'Fuzzy match ability names (e.g., "levitate", "intimidate")',
    })
  ),
  includeDescription: t.Optional(t.Boolean({ description: 'Include full description text' })),
  includeFlags: t.Optional(t.Boolean({ description: 'Include ability flags' })),
});

export const AgentAbilityQuerySchema = t.Composite([AgentAbilityFilterSchema, PaginationSchema]);

export type AgentAbilityQuery = Static<typeof AgentAbilityQuerySchema>;

export const AgentAbilitySchema = t.Object({
  name: t.String({ description: 'Ability name' }),
  slug: t.String({ description: 'Ability slug for URLs' }),
  shortDesc: t.Optional(t.Nullable(t.String({ description: 'Short description' }))),
  desc: t.Optional(t.Nullable(t.String({ description: 'Full description' }))),
  flags: t.Optional(t.Array(t.String(), { description: 'Ability flag names' })),
});

export type AgentAbility = Static<typeof AgentAbilitySchema>;

export const AgentAbilityResponseSchema = t.Object({
  results: t.Array(AgentAbilitySchema, { description: 'Matching abilities' }),
  total: t.Number({ description: 'Total matching results' }),
  limit: t.Number({ description: 'Results per page' }),
  offset: t.Number({ description: 'Results skipped' }),
});

export type AgentAbilityResponse = Static<typeof AgentAbilityResponseSchema>;

const AgentMoveBoostSchema = t.Object({
  stat: t.String({ description: 'Stat name (e.g., "attack", "speed")' }),
  stages: t.Number({ description: 'Number of stages (+/-)' }),
  isSelf: t.Boolean({ description: 'Whether boost applies to user' }),
});

const AgentMoveEffectSchema = t.Object({
  effect: t.String({ description: 'Effect type name' }),
  chance: t.Number({ description: 'Chance percentage (0-100)' }),
  isSelf: t.Boolean({ description: 'Whether effect applies to user' }),
  condition: t.Optional(t.Nullable(t.String({ description: 'Status condition name' }))),
});

const AgentZDataSchema = t.Object({
  zPower: t.Nullable(t.Number({ description: 'Z-Move base power' })),
  zEffect: t.Nullable(t.String({ description: 'Z-Move effect' })),
  zCrystal: t.Nullable(t.String({ description: 'Required Z-Crystal' })),
  isZExclusive: t.Boolean({ description: 'Whether this is a signature Z-Move' }),
});

const AgentMoveFilterSchema = t.Object({
  names: t.Optional(
    t.Array(t.String(), {
      description: 'Fuzzy match move names (e.g., "thunderbolt", "earthquake")',
    })
  ),
  types: t.Optional(
    t.Array(t.String(), {
      description: 'Fuzzy match type names (e.g., "fire", "water")',
    })
  ),
  categories: t.Optional(
    t.Array(t.String(), {
      description: 'Filter by category names (e.g., "Physical", "Special", "Status")',
    })
  ),
  includeDescription: t.Optional(t.Boolean({ description: 'Include full description text' })),
  includeFlags: t.Optional(t.Boolean({ description: 'Include move flags' })),
  includeBoosts: t.Optional(t.Boolean({ description: 'Include stat boosts' })),
  includeEffects: t.Optional(t.Boolean({ description: 'Include move effects' })),
  includeZData: t.Optional(t.Boolean({ description: 'Include Z-Move data' })),
});

export const AgentMoveQuerySchema = t.Composite([AgentMoveFilterSchema, PaginationSchema]);

export type AgentMoveQuery = Static<typeof AgentMoveQuerySchema>;

export const AgentMoveSchema = t.Object({
  name: t.String({ description: 'Move name' }),
  slug: t.String({ description: 'Move slug for URLs' }),
  type: t.String({ description: 'Move type name' }),
  category: t.String({ description: 'Move category (Physical/Special/Status)' }),
  power: t.Nullable(t.Number({ description: 'Base power (null for status moves)' })),
  accuracy: t.Nullable(t.Number({ description: 'Accuracy percentage (null if always hits)' })),
  pp: t.Number({ description: 'Base PP' }),
  priority: t.Number({ description: 'Priority bracket (-7 to +5)' }),
  target: t.Optional(t.Nullable(t.String({ description: 'Target type' }))),
  shortDesc: t.Optional(t.Nullable(t.String({ description: 'Short description' }))),
  desc: t.Optional(t.Nullable(t.String({ description: 'Full description' }))),
  flags: t.Optional(t.Array(t.String(), { description: 'Move flag names' })),
  boosts: t.Optional(t.Array(AgentMoveBoostSchema)),
  effects: t.Optional(t.Array(AgentMoveEffectSchema)),
  zData: t.Optional(t.Nullable(AgentZDataSchema)),
});

export type AgentMove = Static<typeof AgentMoveSchema>;

export const AgentMoveResponseSchema = t.Object({
  results: t.Array(AgentMoveSchema, { description: 'Matching moves' }),
  total: t.Number({ description: 'Total matching results' }),
  limit: t.Number({ description: 'Results per page' }),
  offset: t.Number({ description: 'Results skipped' }),
});

export type AgentMoveResponse = Static<typeof AgentMoveResponseSchema>;

const AgentItemFilterSchema = t.Object({
  names: t.Optional(
    t.Array(t.String(), {
      description: 'Fuzzy match item names (e.g., "potion", "pokeball")',
    })
  ),
  tags: t.Optional(
    t.Array(t.String(), {
      description: 'Filter by tag names (e.g., "medicine", "ball")',
    })
  ),
  includeDescription: t.Optional(t.Boolean({ description: 'Include description text' })),
  includeBoosts: t.Optional(t.Boolean({ description: 'Include stat boosts' })),
  includeTags: t.Optional(t.Boolean({ description: 'Include item tags' })),
});

export const AgentItemQuerySchema = t.Composite([AgentItemFilterSchema, PaginationSchema]);

export type AgentItemQuery = Static<typeof AgentItemQuerySchema>;

const AgentItemBoostSchema = t.Object({
  stat: t.String({ description: 'Stat name' }),
  stages: t.Number({ description: 'Number of stages' }),
});

export const AgentItemSchema = t.Object({
  name: t.String({ description: 'Item name' }),
  slug: t.String({ description: 'Item slug for URLs' }),
  shortDesc: t.Optional(t.Nullable(t.String({ description: 'Short description' }))),
  desc: t.Optional(t.Nullable(t.String({ description: 'Full description' }))),
  boosts: t.Optional(t.Array(AgentItemBoostSchema)),
  tags: t.Optional(t.Array(t.String(), { description: 'Item tag names' })),
});

export type AgentItem = Static<typeof AgentItemSchema>;

export const AgentItemResponseSchema = t.Object({
  results: t.Array(AgentItemSchema, { description: 'Matching items' }),
  total: t.Number({ description: 'Total matching results' }),
  limit: t.Number({ description: 'Results per page' }),
  offset: t.Number({ description: 'Results skipped' }),
});

export type AgentItemResponse = Static<typeof AgentItemResponseSchema>;

const AgentArticleFilterSchema = t.Object({
  titles: t.Optional(
    t.Array(t.String(), {
      description: 'Fuzzy match article titles (e.g., "breeding", "ev training")',
    })
  ),
  categories: t.Optional(
    t.Array(t.String(), {
      description: 'Filter by category names (e.g., "guide", "tutorial")',
    })
  ),
  includeBody: t.Optional(t.Boolean({ description: 'Include full article body. Can be large' })),
  includeCategories: t.Optional(t.Boolean({ description: 'Include category names' })),
});

export const AgentArticleQuerySchema = t.Composite([AgentArticleFilterSchema, PaginationSchema]);

export type AgentArticleQuery = Static<typeof AgentArticleQuerySchema>;

export const AgentArticleSchema = t.Object({
  title: t.String({ description: 'Article title' }),
  slug: t.String({ description: 'Article slug for URLs' }),
  subtitle: t.Optional(t.Nullable(t.String({ description: 'Article subtitle' }))),
  description: t.Optional(t.Nullable(t.String({ description: 'Short description/summary' }))),
  body: t.Optional(t.String({ description: 'Full article content (markdown)' })),
  author: t.Optional(t.Nullable(t.String({ description: 'Author name' }))),
  categories: t.Optional(t.Array(t.String(), { description: 'Category names' })),
});

export type AgentArticle = Static<typeof AgentArticleSchema>;

export const AgentArticleSearchResponseSchema = t.Object({
  results: t.Array(AgentArticleSchema, { description: 'Matching articles' }),
  total: t.Number({ description: 'Total matching results' }),
  limit: t.Number({ description: 'Results per page' }),
  offset: t.Number({ description: 'Results skipped' }),
});

export type AgentArticleSearchResponse = Static<typeof AgentArticleSearchResponseSchema>;
