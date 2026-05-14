import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  className,
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <Card className={cn('rounded-lg py-4 shadow-none', className)}>
      <CardContent className="flex items-start justify-between gap-4 px-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
          {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}
        </div>
        {Icon ? (
          <div className="rounded-md border border-border bg-secondary p-2">
            <Icon className="size-4 text-muted-foreground" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

