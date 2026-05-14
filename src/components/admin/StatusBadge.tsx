import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const toneByValue: Record<string, string> = {
  helpful_yes: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  helpful_no: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  bug: 'border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300',
  feature_request: 'border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  confusing_ux: 'border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  other: 'border-slate-500/25 bg-slate-500/10 text-slate-700 dark:text-slate-300',
  new: 'border-slate-500/25 bg-slate-500/10 text-slate-700 dark:text-slate-300',
  reviewing: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  planned: 'border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  done: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  ignored: 'border-zinc-500/25 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300',
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <Badge variant="outline" className={cn('capitalize', toneByValue[value])}>
      {value.replace(/_/g, ' ')}
    </Badge>
  );
}

