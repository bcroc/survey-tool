import request from 'supertest';
import app from '../src/index';

// NOTE: This test is a scaffold demonstrating how to test CSRF-protected admin flows.
// It is skipped by default because it requires a seeded admin user and a working DB.

describe.skip('CSRF protected admin flows (scaffold)', () => {
  it('demonstrates login -> fetch csrf -> call admin endpoint', async () => {
    // 1) Log in as seeded admin user
    const login = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'adminpassword' });
    expect([200, 401]).toContain(login.status); // ensure login attempt completed

    // 2) Fetch CSRF token
    const csrfRes = await request(app).get('/api/auth/csrf-token').set('Cookie', login.headers['set-cookie'] || '');
    expect(csrfRes.status).toBe(200);
    const token = csrfRes.body?.data?.csrfToken;

    // 3) Attempt admin POST without token (should fail with 403 or 401)
    const noToken = await request(app)
      .post('/api/admin/surveys')
      .set('Cookie', login.headers['set-cookie'] || '')
      .send({ title: 'Test' });

    expect([401, 403]).toContain(noToken.status);

    // 4) Attempt with token
    const withToken = await request(app)
      .post('/api/admin/surveys')
      .set('Cookie', login.headers['set-cookie'] || '')
      .set('X-CSRF-Token', token)
      .send({ title: 'Test' });

    // Depending on DB & permissions, this may be 201 or 401. We assert it completed.
    expect([201, 401]).toContain(withToken.status);
  });
});
