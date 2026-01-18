import { createAccessControl } from 'better-auth/plugins/access';

const statement = {
  article: ['create', 'update', 'delete', 'publish'],
  pokemon: ['create', 'update', 'delete'],
  move: ['create', 'update', 'delete'],
  ability: ['create', 'update', 'delete'],
  item: ['create', 'update', 'delete'],
  image: ['upload', 'delete'],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  article: ['create', 'update', 'delete', 'publish'],
  pokemon: ['create', 'update', 'delete'],
  move: ['create', 'update', 'delete'],
  ability: ['create', 'update', 'delete'],
  item: ['create', 'update', 'delete'],
  image: ['upload', 'delete'],
});

export const editor = ac.newRole({
  article: ['create', 'update'],
  pokemon: ['create', 'update'],
  move: ['create', 'update'],
  ability: ['create', 'update'],
  item: ['create', 'update'],
  image: ['upload'],
});

export const roles = {
  admin,
  editor,
  user: null,
} as const;

export type Role = keyof typeof roles;
