export interface AgentPokemonQuery {
  name?: string;
  types?: string[];
  abilities?: string[];
  moves?: string[];
  eggGroups?: string[];
  labels?: string[];
  dropsItems?: string[];
  generation?: number | number[];

  includeDescription?: boolean;
  includeGeneration?: boolean;
  includeStats?: boolean;
  includeEvYield?: boolean;
  includePhysical?: boolean;
  includeTypes?: boolean;
  includeAbilities?: boolean;
  includeMoves?: boolean;
  includeDrops?: boolean;
  includeBreeding?: boolean;
  includeEggGroups?: boolean;
  includeExperienceGroup?: boolean;
  includeLabels?: boolean;
  includeAspects?: boolean;
  includeHitboxes?: boolean;
  includeLighting?: boolean;
  includeRiding?: boolean;
  includeBehaviour?: boolean;
  includeSpawns?: boolean;

  limit?: number;
  offset?: number;
}

export interface AgentPokemonStats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
  total: number;
}

export interface AgentPokemonEvYield {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

export interface AgentPokemonPhysical {
  height: number;
  weight: number;
}

export interface AgentPokemonBreeding {
  eggCycles: number;
  baseFriendship: number;
  maleRatio: number | null;
}

export interface AgentPokemonAbility {
  name: string;
  slot: string;
}

export interface AgentPokemonMove {
  name: string;
  method: string;
  level: number | null;
}

export interface AgentPokemonDrop {
  item: string;
  chance?: number;
  quantityMin?: number;
  quantityMax?: number;
}

export interface AgentPokemonCosmetics {
  aspectChoices: string[];
  aspectCombos: string[][];
}

export interface AgentPokemonHitbox {
  width: number;
  height: number;
  fixed: boolean;
}

export interface AgentPokemonLighting {
  lightLevel: number;
  liquidGlowMode: string | null;
}

export interface AgentSpawnConditionWeather {
  isRaining: boolean | null;
  isThundering: boolean | null;
}

export interface AgentSpawnConditionSky {
  canSeeSky: boolean | null;
  minSkyLight: number | null;
  maxSkyLight: number | null;
}

export interface AgentSpawnConditionPosition {
  minY: number | null;
  maxY: number | null;
}

export interface AgentSpawnConditionLure {
  minLureLevel: number | null;
  maxLureLevel: number | null;
}

export interface AgentSpawnCondition {
  type: string;
  multiplier: number | null;
  biomes: string[];
  biomeTags: string[];
  timeRanges: string[];
  moonPhases: string[];
  weather: AgentSpawnConditionWeather | null;
  sky: AgentSpawnConditionSky | null;
  position: AgentSpawnConditionPosition | null;
  lure: AgentSpawnConditionLure | null;
}

export interface AgentPokemonSpawn {
  bucket: string;
  positionType: string;
  weight: number;
  levelMin: number;
  levelMax: number;
  presets: string[];
  conditions: AgentSpawnCondition[];
}

export interface AgentPokemon {
  name: string;
  slug: string;
  speciesName: string;

  description?: string | null;
  generation?: number;
  stats?: AgentPokemonStats;
  evYield?: AgentPokemonEvYield;
  physical?: AgentPokemonPhysical;

  types?: string[];
  abilities?: AgentPokemonAbility[];
  moves?: AgentPokemonMove[];
  drops?: AgentPokemonDrop[];

  breeding?: AgentPokemonBreeding;
  eggGroups?: string[];
  experienceGroup?: string | null;

  labels?: string[];
  cosmetics?: AgentPokemonCosmetics;

  hitbox?: AgentPokemonHitbox | null;
  lighting?: AgentPokemonLighting | null;
  riding?: { data: unknown } | null;
  behaviour?: { data: unknown } | null;
  spawns?: AgentPokemonSpawn[];
}

export interface AgentPokemonResponse {
  results: AgentPokemon[];
  total: number;
  limit: number;
  offset: number;
}

export interface AgentAbilityQuery {
  name?: string;
  includeDescription?: boolean;
  includeFlags?: boolean;
  limit?: number;
  offset?: number;
}

export interface AgentAbility {
  name: string;
  slug: string;
  shortDesc?: string | null;
  desc?: string | null;
  flags?: string[];
}

export interface AgentAbilityResponse {
  results: AgentAbility[];
  total: number;
  limit: number;
  offset: number;
}

export interface AgentMoveBoost {
  stat: string;
  stages: number;
  isSelf: boolean;
}

export interface AgentMoveEffect {
  effect: string;
  chance: number;
  isSelf: boolean;
  condition?: string | null;
}

export interface AgentMoveZData {
  zPower: number | null;
  zEffect: string | null;
  zCrystal: string | null;
  isZExclusive: boolean;
}

export interface AgentMoveQuery {
  name?: string;
  types?: string[];
  categories?: string[];
  includeDescription?: boolean;
  includeFlags?: boolean;
  includeBoosts?: boolean;
  includeEffects?: boolean;
  includeZData?: boolean;
  limit?: number;
  offset?: number;
}

export interface AgentMove {
  name: string;
  slug: string;
  type: string;
  category: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
  target?: string | null;
  shortDesc?: string | null;
  desc?: string | null;
  flags?: string[];
  boosts?: AgentMoveBoost[];
  effects?: AgentMoveEffect[];
  zData?: AgentMoveZData | null;
}

export interface AgentMoveResponse {
  results: AgentMove[];
  total: number;
  limit: number;
  offset: number;
}

export interface AgentItemBoost {
  stat: string;
  stages: number;
}

export interface AgentRecipeInput {
  item: string;
  slot: number | null;
  slotType?: string | null;
}

export interface AgentRecipeTagInput {
  tag: string;
  slot: number | null;
  slotType?: string | null;
}

export interface AgentRecipe {
  type: string;
  resultCount: number;
  experience?: number | null;
  cookingTime?: number | null;
  inputs: AgentRecipeInput[];
  tagInputs: AgentRecipeTagInput[];
}

export interface AgentItemQuery {
  name?: string;
  tags?: string[];
  includeDescription?: boolean;
  includeBoosts?: boolean;
  includeTags?: boolean;
  includeRecipes?: boolean;
  limit?: number;
  offset?: number;
}

export interface AgentItem {
  name: string;
  slug: string;
  shortDesc?: string | null;
  desc?: string | null;
  boosts?: AgentItemBoost[];
  tags?: string[];
  recipes?: AgentRecipe[];
}

export interface AgentItemResponse {
  results: AgentItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface AgentArticleQuery {
  title?: string;
  categories?: string[];
  includeContent?: boolean;
  includeCategories?: boolean;
  limit?: number;
  offset?: number;
}

export interface AgentArticle {
  title: string;
  slug: string;
  subtitle?: string | null;
  description?: string | null;
  content?: string;
  author?: string | null;
  categories?: string[];
}

export interface AgentArticleSearchResponse {
  results: AgentArticle[];
  total: number;
  limit: number;
  offset: number;
}

export type AgentArticleResponse = {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  content: string | null;
  author: string | null;
  createdAt: Date;
  updatedAt: Date;
} | null;
