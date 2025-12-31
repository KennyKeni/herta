export const EntityType = {
  SPECIES: 'species',
  FORM: 'form',
  MOVE: 'move',
  ABILITY: 'ability',
  ITEM: 'item',
  ARTICLE: 'article',
} as const;

export type EntityType = (typeof EntityType)[keyof typeof EntityType];

export const Operation = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
} as const;

export type Operation = (typeof Operation)[keyof typeof Operation];

export interface OutboxEvent {
  id: number;
  entityType: EntityType;
  entityId: string;
  operation: Operation;
  createdAt: Date;
  processedAt: Date | null;
}

export interface OutboxEventInsert {
  entityType: EntityType;
  entityId: string;
  operation: Operation;
}
