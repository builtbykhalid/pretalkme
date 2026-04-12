import * as Sentry from '@sentry/react';

let initialized = false;

/**
 * Initialize Sentry for React client-side.
 * Safe to call multiple times — only runs once.
 */
export function initSentryReact(): void {
  if (initialized) return;

  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return; // No DSN configured — skip silently

  Sentry.init({
    dsn,
    environment: (import.meta.env.VITE_SENTRY_ENVIRONMENT as string) || import.meta.env.MODE || 'development',
    release: import.meta.env.VITE_SENTRY_RELEASE as string | undefined,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Performance: trace 10% of requests in staging, 5% in production
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.05 : 0.1,

    // Session Replay: record 10% of sessions, 100% of sessions with errors
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });

  initialized = true;
}

export { Sentry };
