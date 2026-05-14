export type ReportableError = Error & {
  digest?: string;
  cause?: unknown;
};

export type ErrorReportContext = {
  boundary?: string;
  route?: string;
  component?: string;
  extra?: Record<string, string | number | boolean | null | undefined>;
};

export type ErrorReport = {
  id: string;
  name: string;
  message: string;
  digest?: string;
  context?: ErrorReportContext;
  url?: string;
  userAgent?: string;
  timestamp: string;
  sentryEvent?: {
    event_id: string;
    level: 'error';
    platform: 'javascript';
    tags: Record<string, string>;
    extra: Record<string, unknown>;
  };
};

const REDACTED_MESSAGE = 'An application error occurred.';

export function createErrorId(prefix = 'kdp'): string {
  const entropy =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replaceAll('-', '').slice(0, 12)
      : Math.random().toString(36).slice(2, 14);

  return `${prefix}_${Date.now().toString(36)}_${entropy}`;
}

export function getSafeErrorId(error?: ReportableError, prefix?: string): string {
  if (error?.digest) {
    return `next_${error.digest.slice(0, 18)}`;
  }

  return createErrorId(prefix);
}

export function buildErrorReport(
  error: unknown,
  context?: ErrorReportContext,
  knownId?: string,
): ErrorReport {
  const reportable = normalizeError(error);
  const id = knownId ?? getSafeErrorId(reportable);
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    id,
    name: reportable.name || 'Error',
    message: isProduction ? REDACTED_MESSAGE : sanitizeMessage(reportable.message),
    digest: reportable.digest,
    context,
    url: typeof window === 'undefined' ? undefined : window.location.href,
    userAgent: typeof navigator === 'undefined' ? undefined : navigator.userAgent,
    timestamp: new Date().toISOString(),
    sentryEvent: {
      event_id: id,
      level: 'error',
      platform: 'javascript',
      tags: {
        boundary: context?.boundary ?? 'unknown',
        route: context?.route ?? 'unknown',
      },
      extra: {
        digest: reportable.digest,
        component: context?.component,
        ...context?.extra,
      },
    },
  };
}

export async function reportClientError(
  error: unknown,
  context?: ErrorReportContext,
): Promise<string> {
  const report = buildErrorReport(error, context);

  if (process.env.NODE_ENV !== 'production') {
    console.error('[KDPPreflight error report]', report);
  } else {
    console.error('[KDPPreflight error]', {
      id: report.id,
      boundary: context?.boundary,
      route: context?.route,
      digest: report.digest,
    });
  }

  if (process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT && typeof fetch !== 'undefined') {
    try {
      await fetch(process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(report),
        keepalive: true,
      });
    } catch {
      // Reporting must never make the user-facing error state worse.
    }
  }

  return report.id;
}

export function sanitizeMessage(message?: string): string {
  if (!message) return REDACTED_MESSAGE;

  return message
    .replace(/\/Users\/[^/\s]+\/[^\s)]+/g, '[local-path]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/(token|key|secret|password)=([^&\s]+)/gi, '$1=[redacted]')
    .slice(0, 240);
}

function normalizeError(error: unknown): ReportableError {
  if (error instanceof Error) {
    return error as ReportableError;
  }

  return new Error(typeof error === 'string' ? error : REDACTED_MESSAGE);
}
