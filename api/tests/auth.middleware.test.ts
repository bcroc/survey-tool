import express from 'express';
import request from 'supertest';
import { signJwt } from '../src/utils/jwt';
import { requireAuth } from '../src/middleware/auth';

const buildAppWithSession = () => {
  const app = express();
  app.get(
    '/protected-session',
    // Simulate a session-authenticated request
    (req, _res, next) => {
      (req as any).isAuthenticated = () => true;
      (req as any).user = { id: 'session-user' };
      next();
    },
    requireAuth,
    (req, res) => {
      res.json({ ok: true, user: (req as any).user });
    }
  );
  return app;
};

const buildAppWithJwt = () => {
  const app = express();
  app.get('/protected-jwt', requireAuth, (req, res) => {
    res.json({ ok: true, user: (req as any).user });
  });
  return app;
};

describe('requireAuth middleware', () => {
  test('allows session-authenticated requests', async () => {
    const app = buildAppWithSession();
    const resp = await request(app).get('/protected-session');
    expect(resp.status).toBe(200);
    expect(resp.body).toEqual({ ok: true, user: { id: 'session-user' } });
  });

  test('allows requests with valid JWT', async () => {
    const token = signJwt({ id: 'jwt-user', email: 'a@example.com' });
    const app = buildAppWithJwt();
    const resp = await request(app).get('/protected-jwt').set('Authorization', `Bearer ${token}`);
    expect(resp.status).toBe(200);
    expect(resp.body.ok).toBe(true);
    expect(resp.body.user).toMatchObject({ id: 'jwt-user', email: 'a@example.com' });
  });

  test('rejects unauthenticated requests with 401', async () => {
    const app = buildAppWithJwt();
    const resp = await request(app).get('/protected-jwt');
    expect(resp.status).toBe(401);
    expect(resp.body.success).toBe(false);
  });
});
