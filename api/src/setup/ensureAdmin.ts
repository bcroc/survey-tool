import readline from 'readline';
import { z } from 'zod';
import { logger } from '../config/logger';
import { isTest } from '../config/env';
import { countAdminUsers, createAdminAccount } from '../services/authService';

type PromptOptions = {
  mask?: boolean;
};

const emailSchema = z.string().email('Enter a valid email address.');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters long.');

const createPrompt = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  rl.on('SIGINT', () => {
    rl.close();
    process.exit(1);
  });

  const question = (query: string, options: PromptOptions = {}) =>
    new Promise<string>(resolve => {
      if (options.mask) {
        const rlAny = rl as unknown as {
          stdoutMuted?: boolean;
          _writeToOutput: (stringToWrite: string) => void;
          output?: NodeJS.WritableStream;
        };
        const output = rlAny.output ?? process.stdout;
        const originalWrite = rlAny._writeToOutput.bind(rlAny);
        rlAny.stdoutMuted = true;
        rlAny._writeToOutput = function (stringToWrite: string) {
          if (rlAny.stdoutMuted) {
            output.write('*');
          } else {
            originalWrite(stringToWrite);
          }
        };

        rl.question(query, answer => {
          output.write('\n');
          rlAny.stdoutMuted = false;
          rlAny._writeToOutput = originalWrite;
          resolve(answer.trim());
        });
      } else {
        rl.question(query, answer => resolve(answer.trim()));
      }
    });

  return {
    question,
    close: () => rl.close(),
  };
};

async function promptForCredentials() {
  const prompt = createPrompt();
  try {
    let email: string;
    while (true) {
      email = await prompt.question('Enter admin email address: ');
      const result = emailSchema.safeParse(email);
      if (result.success) break;
      const message = result.error.issues?.[0]?.message ?? 'Invalid email address.';
      console.log(`\n${message}\n`);
    }

    let password: string;
    while (true) {
      password = await prompt.question('Create admin password (min 8 chars): ', { mask: true });
      const validation = passwordSchema.safeParse(password);
      if (!validation.success) {
        const message = validation.error.issues?.[0]?.message ?? 'Password is too short.';
        console.log(`\n${message}\n`);
        continue;
      }
      const confirm = await prompt.question('Confirm password: ', { mask: true });
      if (password !== confirm) {
        console.log('\nPasswords do not match. Please try again.\n');
        continue;
      }
      break;
    }

    return { email, password };
  } finally {
    prompt.close();
  }
}

async function createAdminInteractive() {
  const credentials = await promptForCredentials();
  const admin = await createAdminAccount(credentials.email, credentials.password, {
    createdBy: 'cli-setup',
    auditMeta: { interactive: true },
  });
  logger.info(
    { email: admin.email },
    'Initial admin account created. You can now sign in at /admin/login.'
  );
}

async function createAdminFromEnv() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) return false;

  const parsedEmail = emailSchema.safeParse(email);
  const parsedPassword = passwordSchema.safeParse(password);

  if (!parsedEmail.success) {
    logger.error('ADMIN_EMAIL is not a valid email address.');
    return false;
  }

  if (!parsedPassword.success) {
    logger.error('ADMIN_PASSWORD does not meet minimum requirements (min 8 characters).');
    return false;
  }

  const admin = await createAdminAccount(parsedEmail.data, parsedPassword.data, {
    createdBy: 'env',
    auditMeta: { source: 'env', interactive: false },
  });
  logger.info({ email: admin.email }, 'Initial admin account created from environment variables.');
  return true;
}

export async function ensureAdminAccount(): Promise<void> {
  if (isTest()) return;

  try {
    const existingAdmins = await countAdminUsers();
    if (existingAdmins > 0) {
      logger.debug('Admin accounts exist. Skipping first-run setup prompt.');
      return;
    }
  } catch (err) {
    logger.error({ err }, 'Unable to verify admin accounts. Skipping setup prompt.');
    return;
  }

  logger.warn('No admin accounts found. Initial setup is required.');

  if (await createAdminFromEnv()) {
    return;
  }

  const interactive = Boolean(process.stdout.isTTY && process.stdin.isTTY);
  if (!interactive) {
    logger.warn(
      'Non-interactive environment detected. Provide ADMIN_EMAIL and ADMIN_PASSWORD environment variables or POST to /api/auth/setup to create the first admin.'
    );
    return;
  }

  try {
    await createAdminInteractive();
  } catch (err) {
    logger.error({ err }, 'Failed to create admin account via CLI prompt.');
  }
}
