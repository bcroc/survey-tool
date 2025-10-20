import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { signJwt } from '../utils/jwt';
import { prisma } from '../services/database';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: 'Invalid payload' });

  const { email, password } = parsed.data;

  try {
    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    // update last login and audit log similar to passport
    await prisma.adminUser.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
    await prisma.auditLog.create({ data: { adminId: user.id, action: 'LOGIN' } });

    const token = signJwt({ id: user.id, email: user.email });

    // Return token in body; client may store in Authorization header or cookie
    return res.json({ success: true, token });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

export default router;
