import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import type { PrismaClient } from '@prisma/client';

/**
 * Configure Passport, injecting a Prisma client so tests can provide a mock.
 * If no prisma client is provided, the functions that require DB access will
 * throw at runtime if invoked (this keeps behavior explicit).
 */
export function configurePassport(prisma?: PrismaClient) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email: string, password: string, done) => {
      if (!prisma) return done(new Error('Prisma client not provided to configurePassport'));

      try {
        const user = await prisma.adminUser.findUnique({ where: { email } });

        if (!user) {
          return done(null, false, { message: 'Incorrect email or password.' });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
          return done(null, false, { message: 'Incorrect email or password.' });
        }

        // Update last login
        await prisma.adminUser.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

        // Log login
        await prisma.auditLog.create({ data: { adminId: user.id, action: 'LOGIN' } });

        return done(null, { id: user.id, email: user.email });
      } catch (error) {
        return done(error as Error);
      }
    })
  );

  passport.serializeUser((user: Express.User, done: (err: Error | null, id?: string) => void) => {
    const uid = (user as { id?: string }).id;
    done(null, uid);
  });

  passport.deserializeUser(async (id: string, done: (err: Error | null, user?: { id: string; email: string } | null) => void) => {
    if (!prisma) return done(new Error('Prisma client not provided to configurePassport'));

    try {
      const user = await prisma.adminUser.findUnique({ where: { id }, select: { id: true, email: true } });
      done(null, user);
    } catch (error) {
      done(error as Error);
    }
  });
}
