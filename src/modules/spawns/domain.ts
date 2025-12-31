export interface SpawnBucketRef {
  id: number;
  slug: string;
  name: string;
}

export interface SpawnPositionTypeRef {
  id: number;
  slug: string;
  name: string;
}

export interface SpawnPresetTypeRef {
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

export interface TimeRangeRef {
  id: number;
  slug: string;
  name: string;
}

export interface MoonPhaseRef {
  id: number;
  slug: string;
  name: string;
}

export interface SpawnConditionWeather {
  isRaining: boolean | null;
  isThundering: boolean | null;
}

export interface SpawnConditionSky {
  canSeeSky: boolean | null;
  minSkyLight: number | null;
  maxSkyLight: number | null;
}

export interface SpawnConditionPosition {
  minY: number | null;
  maxY: number | null;
}

export interface SpawnConditionLure {
  minLureLevel: number | null;
  maxLureLevel: number | null;
}

export interface SpawnCondition {
  id: number;
  type: string;
  multiplier: number | null;
  biomes: BiomeRef[];
  biomeTags: BiomeTagRef[];
  timeRanges: TimeRangeRef[];
  moonPhases: MoonPhaseRef[];
  weather: SpawnConditionWeather | null;
  sky: SpawnConditionSky | null;
  position: SpawnConditionPosition | null;
  lure: SpawnConditionLure | null;
}

export interface SpawnPreset {
  presetType: SpawnPresetTypeRef;
}

export interface Spawn {
  id: number;
  formId: number;
  bucket: SpawnBucketRef;
  positionType: SpawnPositionTypeRef;
  weight: number;
  levelMin: number;
  levelMax: number;
  presets: SpawnPreset[];
  conditions: SpawnCondition[];
}

export interface SpawnFilter {
  formIds?: number[];
  biomeIds?: number[];
  biomeTagIds?: number[];
  bucketIds?: number[];
  includeConditions?: boolean;
  includePresets?: boolean;
  limit?: number;
  offset?: number;
}
