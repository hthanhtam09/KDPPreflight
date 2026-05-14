import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export function AdminLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden bg-[#f5f7fb] text-foreground dark:bg-[#090d16]">
      <div className="flex h-full flex-col lg:flex-row">
        <AdminSidebar />
        <section className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <div className="mb-5 flex flex-col gap-1 border-b border-border/80 pb-5">
              <h1 className="text-2xl font-semibold tracking-normal text-foreground">{title}</h1>
              {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
            </div>
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
