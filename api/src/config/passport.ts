import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { prisma } from '../services/database';

export function configurePassport() {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email: string, password: string, done) => {
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
          await prisma.adminUser.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });

          // Log login
          await prisma.auditLog.create({
            data: {
              adminId: user.id,
              action: 'LOGIN',
            },
          });

          return done(null, { id: user.id, email: user.email });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as any).id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.adminUser.findUnique({
        where: { id },
        select: { id: true, email: true },
      });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}
