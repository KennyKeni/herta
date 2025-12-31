export interface AspectType {
  id: number;
  slug: string;
  name: string;
}

export interface Aspect {
  id: number;
  name: string;
  slug: string;
  type: AspectType;
  aspectFormat: string | null;
}

export interface AspectChoice {
  id: number;
  slug: string;
  aspectId: number;
  name: string;
  value: string;
  aspectString: string | null;
}

export interface AspectGroup {
  id: number;
  name: string;
  slug: string;
  rule: string;
  description: string | null;
  aspects: Aspect[];
}

export interface AspectFilter {
  aspectIds?: number[];
  aspectSlugs?: string[];
  typeIds?: number[];
  groupIds?: number[];
  groupSlugs?: string[];
  includeGroups?: boolean;
  limit?: number;
  offset?: number;
}
