import type { Metadata } from 'next';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { FeedbackTable, type FeedbackItem } from '@/components/admin/FeedbackTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getFeedbackList } from '@/lib/admin-queries';

export const metadata: Metadata = {
  title: 'Admin Feedback',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminFeedbackPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const data = await getFeedbackList({ type: params.type, search: params.search, page: Number(params.page ?? 1) });

  return (
    <AdminLayout title="Helpful feedback" description="Helpful votes and guide feedback messages.">
      <Card className="rounded-lg shadow-none">
        <CardContent className="px-4">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <form className="flex flex-1 flex-col gap-2 sm:flex-row">
              <Input name="search" placeholder="Search page title or message" defaultValue={params.search ?? ''} className="sm:max-w-sm" />
              <select name="type" defaultValue={params.type ?? 'all'} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="all">All votes</option>
                <option value="helpful_yes">Helpful yes</option>
                <option value="helpful_no">Helpful no</option>
                <option value="with_message">With message</option>
              </select>
              <Button type="submit">Filter</Button>
            </form>
            <Button asChild variant="outline">
              <Link href="/api/admin/export/feedback">
                <Download className="mr-2 size-4" />
                Export CSV
              </Link>
            </Button>
          </div>
          <FeedbackTable items={data.items as unknown as FeedbackItem[]} />
          <Pagination basePath="/admin/feedback" page={data.page} pages={data.pages} params={params} />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

function Pagination({ basePath, page, pages, params }: { basePath: string; page: number; pages: number; params: Record<string, string | undefined> }) {
  const cleanParams = Object.fromEntries(Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1])));
  const previous = new URLSearchParams({ ...cleanParams, page: String(Math.max(page - 1, 1)) });
  const next = new URLSearchParams({ ...cleanParams, page: String(Math.min(page + 1, pages)) });
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
      <span>Page {page} of {pages}</span>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" disabled={page <= 1}>
          <Link href={`${basePath}?${previous}`}>Previous</Link>
        </Button>
        <Button asChild variant="outline" size="sm" disabled={page >= pages}>
          <Link href={`${basePath}?${next}`}>Next</Link>
        </Button>
      </div>
    </div>
  );
}
