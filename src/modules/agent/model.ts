import { t, type Static } from 'elysia';

export const AgentPokemonQuerySchema = t.Object({
  names: t.Optional(
    t.Array(t.String(), {
      description: 'Fuzzy match Pokemon or form names (e.g., "pikachu", "mega charizard")',
    })
  ),
  types: t.Optional(
    t.Array(t.String(), {
      description: 'Filter by type names (e.g., "fire", "water"). Returns Pokemon with any matching type',
    })
  ),
  abilities: t.Optional(
    t.Array(t.String(), {
      description: 'Filter by ability names (e.g., "levitate"). Returns Pokemon with any matching ability',
    })
  ),
  moves: t.Optional(
    t.Array(t.String(), {
      description: 'Filter by learnable move names (e.g., "thunderbolt"). Returns Pokemon that can learn any matching move',
    })
  ),
  eggGroups: t.Optional(
    t.Array(t.String(), {
      description: 'Filter by egg group names (e.g., "dragon", "monster"). Returns Pokemon in any matching egg group',
    })
  ),
  labels: t.Optional(
    t.Array(t.String(), {
      description: 'Filter by label names (e.g., "legendary", "starter"). Returns Pokemon with any matching label',
    })
  ),
  generation: t.Optional(
    t.Union([t.Number(), t.Array(t.Number())], {
      description: 'Filter by generation number(s) (e.g., 1 or [1, 2, 3])',
    })
  ),

  includeDescription: t.Optional(
    t.Boolean({ description: 'Include Pokedex description text' })
  ),
  includeGeneration: t.Optional(
    t.Boolean({ description: 'Include generation number the Pokemon was introduced in' })
  ),
  includeStats: t.Optional(
    t.Boolean({ description: 'Include base stats (HP, Attack, Defense, Sp.Atk, Sp.Def, Speed, Total)' })
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
    t.Boolean({ description: 'Include learnable moves with learn method and level. Can be large (100+ moves)' })
  ),
  includeDrops: t.Optional(
    t.Boolean({ description: 'Include Cobblemon item drops when defeated (item name, chance, quantity)' })
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
    t.Boolean({ description: 'Include classification labels (e.g., "legendary", "mythical", "starter")' })
  ),
  includeAspects: t.Optional(
    t.Boolean({ description: 'Include cosmetic aspects: choosable variants and valid aspect combinations' })
  ),
  includeHitboxes: t.Optional(
    t.Boolean({ description: 'Include Cobblemon hitbox dimensions (width, height, fixed)' })
  ),
  includeLighting: t.Optional(
    t.Boolean({ description: 'Include Cobblemon lighting properties (light level, liquid glow mode)' })
  ),
  includeRiding: t.Optional(
    t.Boolean({ description: 'Include Cobblemon mount/riding configuration data' })
  ),
  includeBehaviour: t.Optional(
    t.Boolean({ description: 'Include Cobblemon AI behaviour configuration. Can be large' })
  ),

  limit: t.Optional(
    t.Number({
      minimum: 1,
      maximum: 100,
      default: 20,
      description: 'Max results to return (1-100, default 20)',
    })
  ),
  offset: t.Optional(
    t.Number({ minimum: 0, default: 0, description: 'Number of results to skip for pagination' })
  ),
});

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
  slot: t.Union([t.Literal('slot1'), t.Literal('slot2'), t.Literal('hidden')], {
    description: 'slot1/slot2 are regular abilities, hidden is the hidden ability',
  }),
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
