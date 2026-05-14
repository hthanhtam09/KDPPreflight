import { createHash, timingSafeEqual } from 'crypto';

function digest(value: string) {
  return createHash('sha256').update(value).digest();
}

function safeCompare(a: string, b: string) {
  const aDigest = digest(a);
  const bDigest = digest(b);
  return timingSafeEqual(aDigest, bDigest);
}

export function validateAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    throw new Error('Missing admin credential environment variables.');
  }

  return safeCompare(username, expectedUsername) && safeCompare(password, expectedPassword);
}

