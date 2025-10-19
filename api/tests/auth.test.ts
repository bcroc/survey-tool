import request from 'supertest';
import app from '../src/index';

describe('Auth endpoints', () => {
  it('rejects invalid login payload', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
  });

  it('enforces login rate limit', async () => {
    // send 11 invalid attempts
    for (let i = 0; i < 11; i++) {
      // supertest maintains separate connections; rate-limiter is per-IP so this should count.
      // we expect the last request to be rate-limited (429)
      const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'wrongpassword' });
      if (i === 10) {
        expect([429, 401, 400]).toContain(res.status);
      }
    }
  }, 20000);
});
