import type { PaginatedResponse } from '@/common/pagination';

export interface Ability {
  id: number;
  name: string;
  slug: string;
  desc: string | null;
  shortDesc: string | null;
  flags: AbilityFlagType[];
}

export type AbilitySearchResponse = PaginatedResponse<Ability>;

export interface AbilityFlagType {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface IncludeOptions {
  includeFlags?: boolean;
}

export interface AbilityFilter extends IncludeOptions {
  name?: string;
  abilityIds?: number[];
  abilitySlugs?: string[];
  flagIds?: number[];
  flagSlugs?: string[];
  limit?: number;
  offset?: number;
}
