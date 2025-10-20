import 'express-session';
import 'express';

declare module 'express-session' {
  interface SessionData {
    csrfToken?: string;
  }
}

declare global {
  namespace Express {
    interface User {
      id?: string;
      [key: string]: any;
    }

    interface Request {
      user?: User | null;
    }
  }
}

