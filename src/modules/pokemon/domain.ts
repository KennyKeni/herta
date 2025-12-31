import type { Spawn } from '../spawns/domain';

export type { Spawn };

export interface TypeRef {
  id: number;
  name: string;
  slug: string;
}

export interface AbilityRef {
  id: number;
  name: string;
  slug: string;
}

export interface MoveRef {
  id: number;
  name: string;
  slug: string;
}

export interface AspectRef {
  id: number;
  name: string;
  slug: string;
}

export interface AspectChoiceRef {
  id: number;
  slug: string;
  name: string;
  value: string;
}

export interface Species {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  generation: number;
  baseFriendship: number;
  baseScale: number | null;
  catchRate: number;
  eggCycles: number;
  experienceGroup: ExperienceGroup | null;
  maleRatio: number | null;
  eggGroups: EggGroup[];
  hitbox: SpeciesHitbox | null;
  lighting: SpeciesLighting | null;
  riding: SpeciesRiding | null;
}

export interface SpeciesWithForms extends Species {
  forms: Form[];
}

export interface Form {
  id: number;
  name: string;
  fullName: string;
  slug: string;
  description: string | null;
  generation: number | null;
  height: number;
  weight: number;
  baseHp: number;
  baseAttack: number;
  baseDefence: number;
  baseSpecialAttack: number;
  baseSpecialDefence: number;
  baseSpeed: number;
  baseExperienceYield: number | null;
  evHp: number;
  evAttack: number;
  evDefence: number;
  evSpecialAttack: number;
  evSpecialDefence: number;
  evSpeed: number;
  labels: Label[];
  aspectChoices: AspectChoiceRef[];
  types: FormType[];
  abilities: FormAbility[];
  moves: FormMove[];
  hitbox: FormHitbox | null;
  drops: FormDrops | null;
  aspectCombos: FormAspectCombo[];
  behaviour: Behaviour | null;
  spawns: Spawn[];
}

export interface SpeciesWithForm extends Species {
  form: Form;
}

export interface AbilitySlotRef {
  id: number;
  slug: string;
  name: string;
}

export interface FormAbility {
  ability: AbilityRef;
  slot: AbilitySlotRef;
}

export interface FormType {
  type: TypeRef;
  slot: number;
}

export interface MoveLearnMethodRef {
  id: number;
  slug: string;
  name: string;
}

export interface FormMove {
  move: MoveRef;
  method: MoveLearnMethodRef;
  level: number | null;
}

export interface FormAspectCombo {
  comboIndex: number;
  aspects: AspectRef[];
}

export interface FormDrops {
  amount: number;
  percentages: DropPercentage[];
  ranges: DropRange[];
}

export interface FormHitbox {
  width: number;
  height: number;
  fixed: boolean;
}

export interface EggGroup {
  id: number;
  name: string;
  slug: string;
}

export interface ExperienceGroup {
  id: number;
  slug: string;
  name: string;
  formula: string;
}

export interface SpeciesHitbox {
  width: number;
  height: number;
  fixed: boolean;
}

export interface SpeciesLighting {
  lightLevel: number;
  liquidGlowMode: string | null;
}

export interface SpeciesRiding {
  data: unknown;
}

export interface Behaviour {
  data: unknown;
}

export interface Label {
  id: number;
  name: string;
  slug: string;
}

export interface ItemRef {
  id: number;
  name: string;
}

export interface DropPercentage {
  item: ItemRef;
  percentage: number;
}

export interface DropRange {
  item: ItemRef;
  quantityMin: number;
  quantityMax: number;
}

export interface Range {
  gte?: number;
  lte?: number;
}

export interface IncludeOptions {
  includeTypes?: boolean;
  includeAbilities?: boolean;
  includeMoves?: boolean;
  includeLabels?: boolean;
  includeAspects?: boolean;
  includeDrops?: boolean;
  includeEggGroups?: boolean;
  includeExperienceGroup?: boolean;
  includeHitboxes?: boolean;
  includeLighting?: boolean;
  includeRiding?: boolean;
  includeBehaviour?: boolean;
  includeOverrides?: boolean;
  includeSpawns?: boolean;
}

export interface PokemonFilter extends IncludeOptions {
  formIds?: number[];
  formSlugs?: string[];
  speciesIds?: number[];
  speciesSlugs?: string[];

  typeIds?: number[];
  typeSlugs?: string[];
  abilityIds?: number[];
  abilitySlugs?: string[];
  moveIds?: number[];
  moveSlugs?: string[];
  eggGroupIds?: number[];
  eggGroupSlugs?: string[];
  labelIds?: number[];
  labelSlugs?: string[];
  experienceGroupIds?: number[];
  experienceGroupSlugs?: string[];

  biomeIds?: number[];
  biomeSlugs?: string[];
  biomeTagIds?: number[];
  biomeTagSlugs?: string[];
  spawnBucketIds?: number[];
  spawnBucketSlugs?: string[];

  generation?: number;
  generations?: number[];

  hp?: Range;
  attack?: Range;
  defense?: Range;
  specialAttack?: Range;
  specialDefense?: Range;
  speed?: Range;
  totalStats?: Range;

  height?: Range;
  weight?: Range;

  catchRate?: Range;
  baseFriendship?: Range;
  eggCycles?: Range;
  maleRatio?: Range;
  baseExperienceYield?: Range;

  isDefaultForm?: boolean;
  hasDrops?: boolean;
  isRideable?: boolean;
  isGenderless?: boolean;

  limit?: number;
  offset?: number;
}
