export interface NamespaceRef {
  id: number;
  name: string;
}

export interface Biome {
  id: number;
  name: string;
  namespace: NamespaceRef | null;
}

export interface BiomeTag {
  id: number;
  name: string;
  namespace: NamespaceRef | null;
}

export interface MoonPhase {
  id: number;
  name: string;
}

export interface TimeRange {
  id: number;
  name: string;
}

export interface BiomeRef {
  id: number;
  name: string;
}

export interface BiomeTagRef {
  id: number;
  name: string;
}

export interface MoonPhaseRef {
  id: number;
  name: string;
}

export interface TimeRangeRef {
  id: number;
  name: string;
}
