import * as Sentry from '@sentry/react';

export default function SentryTestPanel() {
  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 right-4 z-12000 bg-white border border-neutral-200 rounded-xl shadow-lg p-3 w-56">
      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
        Sentry Test (Dev)
      </p>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => {
            throw new Error('Sentry React test error');
          }}
          className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors"
        >
          Trigger Error
        </button>

        <button
          onClick={() => Sentry.captureMessage('Sentry test message', 'info')}
          className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-neutral-900 text-white hover:bg-black transition-colors"
        >
          Send Message
        </button>
      </div>
    </div>
  );
}
