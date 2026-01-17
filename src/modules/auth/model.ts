import { t } from 'elysia';

const PermissionsResponseSchema = t.Object({
  role: t.String(),
  permissions: t.Record(t.String(), t.Array(t.String())),
});

export const AuthModel = {
  permissionsResponse: PermissionsResponseSchema,
};
