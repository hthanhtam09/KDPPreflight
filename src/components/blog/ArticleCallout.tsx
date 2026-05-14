import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

const variants = {
  tip: {
    icon: CheckCircle2,
    className: 'border-success/20 bg-success/10 text-success',
    label: 'Tip',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-warning/25 bg-warning/10 text-warning',
    label: 'Warning',
  },
  note: {
    icon: Info,
    className: 'border-primary/20 bg-primary/10 text-primary',
    label: 'Note',
  },
} as const;

export function ArticleCallout({
  variant = 'note',
  title,
  children,
}: {
  variant?: keyof typeof variants;
  title?: string;
  children: React.ReactNode;
}) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <aside className={`my-8 rounded-2xl border p-5 ${config.className}`}>
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm font-bold text-foreground">{title ?? config.label}</p>
          <div className="mt-2 text-sm leading-6 text-muted-foreground">{children}</div>
        </div>
      </div>
    </aside>
  );
}
