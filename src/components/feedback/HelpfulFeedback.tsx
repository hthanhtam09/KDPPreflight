'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, ThumbsDown, ThumbsUp } from 'lucide-react';

type FeedbackType = 'helpful_yes' | 'helpful_no';

export function HelpfulFeedback({
  pageSlug,
  pageTitle,
}: {
  pageSlug: string;
  pageTitle: string;
}) {
  const [type, setType] = useState<FeedbackType | null>(null);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submitFeedback() {
    if (!type) return;

    setStatus('submitting');
    setError('');

    try {
      const response = await fetch('/api/feedback/helpful', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          pageSlug,
          pageTitle,
          message: message.trim() || undefined,
          url: window.location.href,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Feedback could not be submitted.');
      }

      setStatus('success');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Feedback could not be submitted.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-success/20 bg-success/10 p-5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <CheckCircle2 className="h-4 w-4 text-success" />
          Thanks for the signal.
        </div>
        <p className="mt-2">Your guide feedback was saved and sent to the KDP Preflight team.</p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-muted/25 p-5" aria-labelledby="helpful-feedback-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="helpful-feedback-title" className="font-bold text-foreground">
            Was this guide helpful?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">A quick answer helps us improve the KDP guide library.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('helpful_yes')}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition hover:border-primary/30 ${
              type === 'helpful_yes' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground'
            }`}
            aria-pressed={type === 'helpful_yes'}
          >
            <ThumbsUp className="h-4 w-4" />
            Yes
          </button>
          <button
            type="button"
            onClick={() => setType('helpful_no')}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition hover:border-primary/30 ${
              type === 'helpful_no' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
            aria-pressed={type === 'helpful_no'}
          >
            <ThumbsDown className="h-4 w-4" />
            No
          </button>
        </div>
      </div>

      {type && (
        <div className="mt-5 grid gap-3">
          <label htmlFor="helpful-message" className="text-sm font-semibold text-foreground">
            Tell us how we can improve this guide
          </label>
          <textarea
            id="helpful-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Optional, but useful if something was unclear or missing."
            className="min-h-28 resize-y rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-ring/20"
          />
          {error && <p className="text-sm font-semibold text-danger">{error}</p>}
          <button
            type="button"
            onClick={submitFeedback}
            disabled={status === 'submitting'}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'submitting' && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit feedback
          </button>
        </div>
      )}
    </section>
  );
}
