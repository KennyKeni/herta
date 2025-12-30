export interface TypeRef {
  id: number;
  name: string;
  slug: string;
}

export interface StatRef {
  id: number;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  desc: string | null;
  shortDesc: string | null;
  source: string;
  generation: number | null;
  implemented: boolean;
  flingPower: number | null;
  flingEffect: string | null;
  naturalGiftPower: number | null;
  naturalGiftType: TypeRef | null;
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
  flag: string;
}

export interface ItemTag {
  namespace: string;
  tag: string;
}

export interface Recipe {
  id: string;
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
  itemIds?: string[];
  tagIds?: number[];
  tagSlugs?: string[];
  includeBoosts?: boolean;
  includeFlags?: boolean;
  includeTags?: boolean;
  limit?: number;
  offset?: number;
}
