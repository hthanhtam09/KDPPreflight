'use client';

import type React from 'react';
import { useState } from 'react';
import { CheckCircle2, Loader2, MessageSquare, X } from 'lucide-react';

type Category = 'bug' | 'feature_request' | 'confusing_ux' | 'other';

const categories: { value: Category; label: string }[] = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature_request', label: 'Feature request' },
  { value: 'confusing_ux', label: 'Confusing UX' },
  { value: 'other', label: 'Other' },
];

export function FeatureFeedback({
  context = 'this page',
  compact = false,
  floating = false,
}: {
  context?: string;
  compact?: boolean;
  floating?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Category>('bug');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  function closeModal() {
    setOpen(false);
    if (status === 'success') {
      setStatus('idle');
      setMessage('');
      setEmail('');
      setError('');
    }
  }

  async function submitFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setError('');

    try {
      const response = await fetch('/api/feedback/feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          message: message.trim(),
          email: email.trim() || undefined,
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          floating
            ? 'hidden sm:inline-flex fixed bottom-5 right-5 z-[calc(var(--z-nav)+5)] items-center gap-2 rounded-full border border-primary/20 bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-elevated transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:bottom-6 sm:right-6'
            : compact
            ? 'inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-foreground shadow-soft transition hover:-translate-y-0.5 hover:border-primary/30'
            : 'inline-flex items-center gap-2 rounded-full border border-border bg-surface-glass px-3 py-2 text-xs font-bold text-muted-foreground shadow-soft backdrop-blur-xl transition hover:border-primary/30 hover:text-foreground'
        }
        aria-label="Send product feedback"
      >
        <MessageSquare className="h-5 w-5 sm:h-4 sm:w-4" />
        <span className={floating ? 'hidden sm:inline' : ''}>Send feedback</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[var(--z-modal)] grid place-items-center bg-background/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="feature-feedback-title">
          <div className="w-full max-w-lg max-h-[90svh] overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-elevated">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="feature-feedback-title" className="text-lg font-bold tracking-[-0.01em] text-foreground">
                  Send feedback
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Tell us what is happening on {context}. This goes directly to the KDP Preflight team.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
                aria-label="Close feedback dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {status === 'success' ? (
              <div className="mt-6 rounded-2xl border border-success/20 bg-success/10 p-5">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Feedback sent.
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Thanks. Your note was saved and emailed to contact@kdppreflight.com.
                </p>
              </div>
            ) : (
              <form onSubmit={submitFeedback} className="mt-6 grid gap-4">
                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-foreground">Feedback type</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((item) => (
                      <label
                        key={item.value}
                        className={`cursor-pointer rounded-xl border px-3 py-2 text-sm font-bold transition ${
                          category === item.value
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-muted/25 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={item.value}
                          checked={category === item.value}
                          onChange={() => setCategory(item.value)}
                          className="sr-only"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  Message
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    rows={5}
                    minLength={8}
                    maxLength={2000}
                    required
                    placeholder="What happened, what felt confusing, or what would you like to see?"
                    className="min-h-32 resize-y rounded-2xl border border-border bg-background px-4 py-3 text-sm font-normal text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-ring/20"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-foreground">
                  Email <span className="text-xs font-medium text-muted-foreground">Optional</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    maxLength={160}
                    placeholder="you@example.com"
                    className="h-11 rounded-xl border border-border bg-background px-4 text-sm font-normal text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-ring/20"
                  />
                </label>

                {error && <p className="text-sm font-semibold text-danger">{error}</p>}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-muted-foreground transition hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === 'submitting' && <Loader2 className="h-4 w-4 animate-spin" />}
                    Submit feedback
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
