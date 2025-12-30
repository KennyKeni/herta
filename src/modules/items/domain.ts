export interface StatRef {
  id: number;
  name: string;
}

export interface Item {
  id: number;
  name: string;
  desc: string | null;
  shortDesc: string | null;
  generation: number | null;
  implemented: boolean;
  boosts: ItemBoost[];
  flags: ItemFlag[];
  tags: ItemTag[];
  recipes: Recipe[];
}

export interface ItemBoost {
  stat: StatRef;
  stages: number;
}

export interface ItemFlag {
  id: number;
  name: string;
}

export interface ItemTag {
  slug: string;
  name: string;
}

export interface Recipe {
  id: number;
  type: string;
  resultCount: number;
  inputs: RecipeInput[];
}

export interface RecipeInput {
  inputNamespace: string;
  inputType: string;
  inputValue: string;
  slot: number | null;
  slotType: RecipeSlotType | null;
}

export interface RecipeSlotType {
  id: number;
  name: string;
  description: string | null;
}

export interface ItemFilter {
  itemIds?: number[];
  tagIds?: number[];
  tagSlugs?: string[];
  includeBoosts?: boolean;
  includeFlags?: boolean;
  includeTags?: boolean;
  limit?: number;
  offset?: number;
}
