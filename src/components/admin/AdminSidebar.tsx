'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, Home, Inbox, Lightbulb, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Overview', icon: Home },
  { href: '/admin/feedback', label: 'Feedback', icon: Inbox },
  { href: '/admin/feature-requests', label: 'Requests', icon: Lightbulb },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <aside className="flex shrink-0 flex-col border-b border-border bg-card/95 backdrop-blur lg:h-full lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between px-4 py-4 lg:block lg:px-5 lg:py-6">
        <div>
          <p className="text-sm font-semibold tracking-normal">KDP Preflight</p>
          <p className="text-xs text-muted-foreground">Admin dashboard</p>
        </div>
        <Button variant="outline" size="sm" onClick={logout} className="lg:hidden">
          <LogOut className="mr-2 size-4" />
          Logout
        </Button>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:flex-1 lg:space-y-1 lg:overflow-visible lg:px-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-fit items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
                active && 'bg-primary/10 text-foreground ring-1 ring-primary/15',
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="hidden border-t border-border p-4 lg:block">
        <Button variant="outline" size="sm" onClick={logout} className="w-full justify-start">
          <LogOut className="mr-2 size-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
