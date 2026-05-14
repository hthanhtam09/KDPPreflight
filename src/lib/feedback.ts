import { createHash } from 'crypto';
import { z } from 'zod';
import { escapeHtml } from './email';

const MAX_MESSAGE_LENGTH = 2000;
const MAX_TITLE_LENGTH = 180;
const MAX_URL_LENGTH = 600;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 8;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export const helpfulFeedbackSchema = z.object({
  type: z.enum(['helpful_yes', 'helpful_no']),
  pageSlug: z.string().trim().min(1).max(120),
  pageTitle: z.string().trim().min(1).max(MAX_TITLE_LENGTH),
  message: z.string().trim().max(MAX_MESSAGE_LENGTH).optional(),
  url: z.string().trim().url().max(MAX_URL_LENGTH),
});

export const featureFeedbackSchema = z.object({
  category: z.enum(['bug', 'feature_request', 'confusing_ux', 'other']),
  message: z.string().trim().min(8, 'Please include a little more detail.').max(MAX_MESSAGE_LENGTH),
  email: z.string().trim().email().max(160).optional().or(z.literal('')),
  url: z.string().trim().url().max(MAX_URL_LENGTH),
});

export type HelpfulFeedbackInput = z.infer<typeof helpfulFeedbackSchema>;
export type FeatureFeedbackInput = z.infer<typeof featureFeedbackSchema>;

export function sanitizeText(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function hashIp(ip: string | undefined): string | undefined {
  if (!ip) return undefined;
  const salt = process.env.IP_HASH_SALT;
  if (!salt) return undefined;
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

export function getClientIp(headers: Headers): string | undefined {
  const forwardedFor = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return (
    forwardedFor ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    headers.get('x-client-ip') ||
    undefined
  );
}

export function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX) return false;

  current.count += 1;
  return true;
}

export function buildHelpfulEmail({
  feedback,
  userAgent,
  createdAt,
}: {
  feedback: HelpfulFeedbackInput;
  userAgent?: string;
  createdAt: Date;
}) {
  const message = feedback.message || 'No message provided.';
  const subject = `[KDP Preflight] Guide feedback: ${feedback.type}`;
  const text = [
    `Feedback type: ${feedback.type}`,
    `Page title: ${feedback.pageTitle}`,
    `Page slug: ${feedback.pageSlug}`,
    `URL: ${feedback.url}`,
    `Message: ${message}`,
    `User agent: ${userAgent ?? 'Unknown'}`,
    `Created at: ${createdAt.toISOString()}`,
  ].join('\n');

  const html = `
    <h2>Guide feedback</h2>
    <p><strong>Feedback type:</strong> ${escapeHtml(feedback.type)}</p>
    <p><strong>Page title:</strong> ${escapeHtml(feedback.pageTitle)}</p>
    <p><strong>Page slug:</strong> ${escapeHtml(feedback.pageSlug)}</p>
    <p><strong>URL:</strong> <a href="${escapeHtml(feedback.url)}">${escapeHtml(feedback.url)}</a></p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message)}</p>
    <p><strong>User agent:</strong> ${escapeHtml(userAgent ?? 'Unknown')}</p>
    <p><strong>Created at:</strong> ${escapeHtml(createdAt.toISOString())}</p>
  `;

  return { subject, text, html };
}

export function buildFeatureEmail({
  feedback,
  userAgent,
  createdAt,
}: {
  feedback: FeatureFeedbackInput;
  userAgent?: string;
  createdAt: Date;
}) {
  const subject = `[KDP Preflight] Feature feedback: ${feedback.category}`;
  const text = [
    `Category: ${feedback.category}`,
    `URL: ${feedback.url}`,
    `Email: ${feedback.email || 'Not provided'}`,
    `Message: ${feedback.message}`,
    `User agent: ${userAgent ?? 'Unknown'}`,
    `Created at: ${createdAt.toISOString()}`,
  ].join('\n');

  const html = `
    <h2>Feature feedback</h2>
    <p><strong>Category:</strong> ${escapeHtml(feedback.category)}</p>
    <p><strong>URL:</strong> <a href="${escapeHtml(feedback.url)}">${escapeHtml(feedback.url)}</a></p>
    <p><strong>Email:</strong> ${escapeHtml(feedback.email || 'Not provided')}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(feedback.message)}</p>
    <p><strong>User agent:</strong> ${escapeHtml(userAgent ?? 'Unknown')}</p>
    <p><strong>Created at:</strong> ${escapeHtml(createdAt.toISOString())}</p>
  `;

  return { subject, text, html };
}
