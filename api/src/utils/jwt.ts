import jwt from 'jsonwebtoken';
import { config } from '../config/env';

const JWT_SECRET = config.jwt.secret;
const JWT_EXPIRES_IN = '1h';

export function signJwt(payload: object, expiresIn: string = JWT_EXPIRES_IN) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyJwt<T = any>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}
