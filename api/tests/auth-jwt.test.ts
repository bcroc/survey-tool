import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/services/database';

describe('JWT auth', () => {
  it('returns token for valid admin credentials', async () => {
    // Ensure the seeded mock admin user exists; jest.setup provides fake prisma for tests
    const admin = await prisma.adminUser.findFirst();
    expect(admin).toBeDefined();
    if (!admin) return; // satisfy TypeScript

    const res = await request(app).post('/api/auth/jwt/login').send({ email: admin.email, password: 'password' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
