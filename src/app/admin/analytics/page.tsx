import type { Metadata } from 'next';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AnalyticsChart } from '@/components/admin/AnalyticsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAnalyticsOverview } from '@/lib/admin-queries';

export const metadata: Metadata = {
  title: 'Admin Analytics',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const analytics = await getAnalyticsOverview();

  return (
    <AdminLayout title="Analytics" description="Internal anonymous page-view tracking.">
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card className="rounded-lg shadow-none">
          <CardHeader>
            <CardTitle>Views by day</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsChart data={analytics.viewsByDay} />
          </CardContent>
        </Card>
        <Card className="rounded-lg shadow-none">
          <CardHeader>
            <CardTitle>Top referrers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.referrers.length === 0 ? <p className="text-sm text-muted-foreground">No referrers recorded.</p> : null}
            {analytics.referrers.map((item) => (
              <div key={item.referrer} className="flex justify-between gap-3 text-sm">
                <span className="truncate">{item.referrer}</span>
                <span className="text-muted-foreground">{item.views}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card className="rounded-lg shadow-none">
          <CardHeader>
            <CardTitle>Top pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.topPages.map((item) => (
              <div key={item.path} className="flex justify-between gap-3 text-sm">
                <span className="truncate">{item.path}</span>
                <span className="text-muted-foreground">{item.views}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-lg shadow-none">
          <CardHeader>
            <CardTitle>Recent visits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.recentVisits.map((item) => (
              <div key={item._id} className="border-b border-border pb-3 text-sm last:border-0 last:pb-0">
                <p className="truncate font-medium">{String(item.path)}</p>
                <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()} {item.country ? `- ${String(item.country)}` : ''}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
