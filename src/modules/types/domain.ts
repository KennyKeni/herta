import type { PaginatedResponse } from '@/common/pagination';

export interface Type {
  id: number;
  name: string;
  slug: string;
}

export type TypeSearchResponse = PaginatedResponse<Type>;

export interface TypeMatchup {
  attackingType: Type;
  defendingType: Type;
  multiplier: number;
}

export interface HiddenPowerIv {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export interface TypeMatchupRef {
  type: Type;
  multiplier: number;
}

export interface TypeDetail {
  id: number;
  name: string;
  slug: string;
  offensiveMatchups: TypeMatchupRef[];
  defensiveMatchups: TypeMatchupRef[];
  hiddenPowerIvs: HiddenPowerIv[];
}

export interface IncludeOptions {
  includeMatchups?: boolean;
  includeHiddenPower?: boolean;
}

export interface TypeFilter extends IncludeOptions {
  name?: string;
  typeIds?: number[];
  typeSlugs?: string[];
  limit?: number;
  offset?: number;
}
