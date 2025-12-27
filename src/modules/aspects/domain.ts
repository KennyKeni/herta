export type AspectType = 'cosmetic' | 'form';

export interface Aspect {
  id: number;
  name: string;
  slug: string;
  type: AspectType;
}

export interface AspectChoice {
  id: number;
  aspect: Aspect;
  name: string;
  slug: string;
  aspectString: string;
}

export interface AspectGroup {
  id: number;
  name: string;
  slug: string;
  rule: string;
  description: string | null;
  aspects: Aspect[];
}
