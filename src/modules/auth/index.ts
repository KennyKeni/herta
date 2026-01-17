import { Elysia } from 'elysia';
import { type Role, roles } from './access';
import { AuthModel } from './model';
import { auth } from './service';

// Better Auth endpoints (via auth.handler):
//   POST /auth/sign-up/email       - Register with email/password
//   POST /auth/sign-in/email       - Login with email/password
//   POST /auth/sign-out            - Sign out (clears session)
//   GET  /auth/get-session         - Get current session
//   GET  /auth/token               - Get JWT (requires session cookie)
//
// Admin endpoints:
//   POST /auth/admin/set-role      - Set user role
//   POST /auth/admin/ban-user      - Ban user
//   POST /auth/admin/unban-user    - Unban user
//
// Custom endpoints:
//   GET  /auth/me/permissions      - Get current user's permissions
//
// Macros:
//   auth: true                     - Adds user, session, hasPermission to context
//   permission: { resource: ['action'] } - Guards route with permission check (requires auth: true)

type Permission = Parameters<typeof roles.admin.authorize>[0];

export const authModule = new Elysia({ name: 'auth' })
  .mount(auth.handler)
  .get(
    '/auth/me/permissions',
    // biome-ignore lint/suspicious/noExplicitAny: Elysia macro type inference limitation (https://github.com/elysiajs/elysia/issues/1468)
    async ({ user }: any) => {
      const userRole = (user.role as Role) || 'user';

      if (userRole === 'user') {
        return { role: 'user', permissions: {} };
      }

      const role = roles[userRole];
      if (!role) {
        return { role: userRole, permissions: {} };
      }

      return {
        role: userRole,
        permissions: role.statements,
      };
    },
    {
      auth: true,
      response: AuthModel.permissionsResponse,
      detail: {
        summary: 'Get User Permissions',
        description: 'Get the current authenticated user\'s role and permissions.',
      },
    }
  )
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers });
        if (!session) return status(401);

        const userRole = (session.user.role as Role) || 'user';

        return {
          user: session.user,
          session: session.session,
          hasPermission: (permission: Permission) => {
            if (userRole === 'user') return false;
            const role = roles[userRole];
            if (!role) return false;
            return role.authorize(permission).success;
          },
        };
      },
    },
    permission(permission: Permission) {
      return {
        // biome-ignore lint/suspicious/noExplicitAny: Elysia cross-macro type inference not supported (https://github.com/elysiajs/elysia/issues/1468)
        async resolve({ status, hasPermission }: any) {
          if (!hasPermission(permission)) {
            return status(403, 'Forbidden: Insufficient permissions');
          }
        },
      };
    },
  });
