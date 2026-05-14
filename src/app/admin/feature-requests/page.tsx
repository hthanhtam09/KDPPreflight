import type { Metadata } from 'next';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { FeatureFeedbackTable, type FeatureItem } from '@/components/admin/FeatureFeedbackTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getFeatureFeedbackList } from '@/lib/admin-queries';

export const metadata: Metadata = {
  title: 'Admin Feature Requests',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminFeatureRequestsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const data = await getFeatureFeedbackList({
    category: params.category,
    status: params.status,
    search: params.search,
    page: Number(params.page ?? 1),
  });

  return (
    <AdminLayout title="Feature requests" description="Bug reports, ideas, confusing UX reports, and triage status.">
      <Card className="rounded-lg shadow-none">
        <CardContent className="px-4">
          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <form className="flex flex-1 flex-col gap-2 md:flex-row">
              <Input name="search" placeholder="Search message, email, or URL" defaultValue={params.search ?? ''} className="md:max-w-sm" />
              <select name="category" defaultValue={params.category ?? 'all'} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="all">All categories</option>
                <option value="bug">Bug</option>
                <option value="feature_request">Feature request</option>
                <option value="confusing_ux">Confusing UX</option>
                <option value="other">Other</option>
              </select>
              <select name="status" defaultValue={params.status ?? 'all'} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="all">All statuses</option>
                <option value="new">New</option>
                <option value="reviewing">Reviewing</option>
                <option value="planned">Planned</option>
                <option value="done">Done</option>
                <option value="ignored">Ignored</option>
              </select>
              <Button type="submit">Filter</Button>
            </form>
            <Button asChild variant="outline">
              <Link href="/api/admin/export/feature-feedback">
                <Download className="mr-2 size-4" />
                Export CSV
              </Link>
            </Button>
          </div>
          <FeatureFeedbackTable items={data.items as unknown as FeatureItem[]} />
          <Pagination basePath="/admin/feature-requests" page={data.page} pages={data.pages} params={params} />
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
