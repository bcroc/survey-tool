import bcrypt from 'bcrypt';
import crypto from 'crypto';
import type { CookieOptions } from 'express';
import type { AdminUser } from '@prisma/client';
import { prisma } from './database';
import { isProduction } from '../config/env';
import { signJwt } from '../utils/jwt';

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const REFRESH_COOKIE_BASE: CookieOptions = {
  httpOnly: true,
  secure: isProduction(),
  sameSite: 'lax',
  path: '/',
  maxAge: REFRESH_TOKEN_TTL_MS,
};

export type RefreshTokenMeta = {
  userAgent?: string | null;
  ip?: string | null;
};

export type AdminSafe = Pick<AdminUser, 'id' | 'email' | 'createdAt' | 'lastLogin'>;

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  cookieOptions: CookieOptions;
};

export type RotatedSession = SessionTokens & { admin: AdminSafe };

export class AdminEmailTakenError extends Error {
  constructor(email: string) {
    super(`Admin with email ${email} already exists`);
    this.name = 'AdminEmailTakenError';
  }
}

const toAdminSafe = (admin: AdminUser): AdminSafe => ({
  id: admin.id,
  email: admin.email,
  createdAt: admin.createdAt,
  lastLogin: admin.lastLogin,
});

const hashPassword = async (password: string): Promise<string> => bcrypt.hash(password, 12);

const hashRefreshToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

const buildCookieOptions = (): CookieOptions => ({ ...REFRESH_COOKIE_BASE });

const normalizeMeta = (meta: RefreshTokenMeta = {}) => ({
  userAgent: meta.userAgent ?? null,
  ip: meta.ip ?? null,
});

export async function countAdminUsers(): Promise<number> {
  return prisma.adminUser.count();
}

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<AdminUser | null> {
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) return null;
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return null;
  return admin;
}

export async function recordAdminLogin(adminId: string, meta: RefreshTokenMeta = {}) {
  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: adminId },
      data: { lastLogin: new Date() },
    }),
    prisma.auditLog.create({
      data: {
        adminId,
        action: 'LOGIN',
        meta: {
          ...(meta.userAgent ? { userAgent: meta.userAgent } : {}),
          ...(meta.ip ? { ip: meta.ip } : {}),
        },
      },
    }),
  ]);
}

export async function revokeRefreshToken(rawToken: string): Promise<void> {
  const tokenHash = hashRefreshToken(rawToken);
  await prisma.refreshToken.deleteMany({ where: { tokenHash } });
}

export async function issueSession(
  admin: Pick<AdminUser, 'id' | 'email'>,
  meta: RefreshTokenMeta = {}
): Promise<SessionTokens> {
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const tokenHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      adminId: admin.id,
      expiresAt,
      ...normalizeMeta(meta),
    },
  });

  const accessToken = signJwt({ id: admin.id, email: admin.email });

  return {
    accessToken,
    refreshToken,
    cookieOptions: buildCookieOptions(),
  };
}

export async function rotateRefreshToken(
  rawToken: string,
  meta: RefreshTokenMeta = {}
): Promise<RotatedSession | null> {
  const tokenHash = hashRefreshToken(rawToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!stored) return null;

  if (stored.expiresAt <= new Date()) {
    await prisma.refreshToken.deleteMany({ where: { tokenHash } });
    return null;
  }

  const admin = await prisma.adminUser.findUnique({ where: { id: stored.adminId } });
  await prisma.refreshToken.deleteMany({ where: { tokenHash } });
  if (!admin) return null;

  const session = await issueSession(admin, meta);
  return {
    admin: toAdminSafe(admin),
    ...session,
  };
}

export async function createAdminAccount(
  email: string,
  password: string,
  meta: { createdBy?: string; auditMeta?: Record<string, unknown> } = {}
): Promise<AdminSafe> {
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    throw new AdminEmailTakenError(email);
  }

  const passwordHash = await hashPassword(password);
  const admin = await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
    },
  });

  await prisma.auditLog.create({
    data: {
      adminId: admin.id,
      action: 'CREATE_ADMIN',
      meta: {
        createdBy: meta.createdBy ?? 'system',
        ...(meta.auditMeta ?? {}),
      },
    },
  });

  return toAdminSafe(admin);
}

export { toAdminSafe as mapAdminToSafe };
