export interface TypeRef {
  id: number;
  name: string;
  slug: string;
}

export interface SpeciesRef {
  id: number;
  name: string;
  slug: string;
}

export interface Move {
  id: number;
  name: string;
  slug: string;
  desc: string | null;
  shortDesc: string | null;
  type: TypeRef;
  category: MoveCategory;
  target: MoveTarget | null;
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
  critRatio: number | null;
  minHits: number | null;
  maxHits: number | null;
  drainPercent: number | null;
  healPercent: number | null;
  recoilPercent: number | null;
  flags: MoveFlagType[];
  boosts: MoveBoost[];
  effects: MoveEffect[];
  maxPower: number | null;
  zData: MoveZData | null;
}

export interface MoveCategory {
  id: number;
  slug: string;
  name: string;
  description: string | null;
}

export interface MoveTarget {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface MoveEffect {
  effectType: EffectType;
  condition: Condition | null;
  chance: number;
  isSelf: boolean;
}

export interface MoveBoost {
  stat: Stat;
  stages: number;
  isSelf: boolean;
}

export interface MoveFlagType {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface MoveZData {
  zPower: number | null;
  zEffect: string | null;
  zCrystal: string | null;
  isZExclusive: boolean;
}

export interface GmaxMove {
  species: SpeciesRef;
  move: Move;
}

export interface EffectType {
  id: number;
  name: string;
}

export interface Condition {
  id: number;
  name: string;
  type: string;
  description: string | null;
}

export interface Stat {
  id: number;
  name: string;
}

export interface MoveFilter {
  moveIds?: number[];
  moveSlugs?: string[];
  typeIds?: number[];
  typeSlugs?: string[];
  categoryIds?: number[];
  categorySlugs?: string[];
  targetIds?: number[];
  targetSlugs?: string[];
  flagIds?: number[];
  flagSlugs?: string[];
  includeFlags?: boolean;
  includeBoosts?: boolean;
  includeEffects?: boolean;
  includeZData?: boolean;
  limit?: number;
  offset?: number;
}
