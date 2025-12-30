export interface SpawnBucketRef {
  id: number;
  name: string;
}

export interface SpawnPositionTypeRef {
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

export interface TimeRangeRef {
  id: number;
  name: string;
}

export interface MoonPhaseRef {
  id: number;
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

export interface Spawn {
  id: number;
  formId: number;
  bucket: SpawnBucketRef;
  positionType: SpawnPositionTypeRef;
  weight: number;
  levelMin: number;
  levelMax: number;
  conditions: SpawnCondition[];
}

export interface SpawnFilter {
  formIds?: number[];
  biomeIds?: number[];
  biomeTagIds?: number[];
  bucketIds?: number[];

  includeConditions?: boolean;

  limit?: number;
  offset?: number;
}
