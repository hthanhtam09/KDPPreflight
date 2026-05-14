import type { ReactNode } from 'react';
import { FileQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card/75 text-center shadow-card backdrop-blur-xl',
        compact ? 'p-5' : 'p-8 sm:p-10',
        className,
      )}
    >
      <div
        className={cn(
          'mx-auto grid place-items-center rounded-2xl border border-border bg-muted/35 text-primary',
          compact ? 'h-10 w-10' : 'h-14 w-14',
        )}
        aria-hidden="true"
      >
        {icon ?? <FileQuestion className={compact ? 'h-5 w-5' : 'h-6 w-6'} />}
      </div>
      <h2 className={cn('font-bold tracking-[-0.02em] text-foreground', compact ? 'mt-3 text-base' : 'mt-5 text-xl')}>
        {title}
      </h2>
      {description ? (
        <p className={cn('mx-auto mt-2 max-w-xl leading-6 text-muted-foreground', compact ? 'text-sm' : 'text-sm sm:text-base')}>
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
