export interface NamespaceRef {
  id: number;
  slug: string;
  name: string;
}

export interface Biome {
  id: number;
  slug: string;
  name: string;
  namespace: NamespaceRef | null;
}

export interface BiomeTag {
  id: number;
  slug: string;
  name: string;
  namespace: NamespaceRef | null;
}

export interface MoonPhase {
  id: number;
  slug: string;
  name: string;
}

export interface TimeRange {
  id: number;
  slug: string;
  name: string;
}

export interface BiomeRef {
  id: number;
  slug: string;
  name: string;
}

export interface BiomeTagRef {
  id: number;
  slug: string;
  name: string;
}

export interface MoonPhaseRef {
  id: number;
  slug: string;
  name: string;
}

export interface TimeRangeRef {
  id: number;
  slug: string;
  name: string;
}
