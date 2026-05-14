import { createHash } from 'crypto';

export function getClientIp(headers: Headers): string | undefined {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    headers.get('x-client-ip') ||
    undefined
  );
}

export function hashIp(ip: string | undefined): string | undefined {
  if (!ip) return undefined;
  const salt = process.env.IP_HASH_SALT;
  if (!salt) return undefined;
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

