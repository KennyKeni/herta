import { Elysia } from 'elysia';
import { type Role, roles } from './access';
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

type Permission = Parameters<typeof roles.admin.authorize>[0];

export const authModule = new Elysia({ name: 'auth' })
  .mount(auth.handler)
  .get('/auth/refresh', async ({ request }) => {
    const url = new URL(request.url);
    url.pathname = '/auth/token';
    return auth.handler(
      new Request(url, {
        method: 'GET',
        headers: request.headers,
      })
    );
  })
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
  });
