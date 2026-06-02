import { scrypt as _scrypt, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(_scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}.${derivedKey.toString('hex')}`;
}

export async function comparePasswords(password: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split('.');
  const hashBuffer = Buffer.from(hash, 'hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return timingSafeEqual(hashBuffer, derivedKey);
}

/** SHA-256 de um token opaco — usado para armazenar tokens de reset no banco */
export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
