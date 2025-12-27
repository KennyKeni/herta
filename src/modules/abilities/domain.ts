export interface Ability {
  id: number;
  name: string;
  slug: string;
  desc: string | null;
  shortDesc: string | null;
  flags: AbilityFlagType[];
}

export interface AbilityFlagType {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}
