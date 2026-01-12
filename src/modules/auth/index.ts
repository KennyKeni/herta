import { Elysia } from 'elysia';
import { auth } from './service';

// Better Auth endpoints (via auth.handler):
//   POST /auth/sign-up/email   - Register with email/password
//   POST /auth/sign-in/email   - Login with email/password
//   POST /auth/sign-out        - Sign out (clears session)
//   GET  /auth/get-session     - Get current session
//   GET  /auth/token           - Get JWT (requires session cookie)

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
        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });
