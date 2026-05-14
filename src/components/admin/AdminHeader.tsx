'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminHeader({ title, description }: { title: string; description?: string }) {
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <header className="flex flex-col gap-3 border-b border-border bg-background/95 px-4 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
      <div>
        <h1 className="text-xl font-semibold tracking-normal">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <Button variant="outline" size="sm" onClick={logout}>
        <LogOut className="mr-2 size-4" />
        Logout
      </Button>
    </header>
  );
}

