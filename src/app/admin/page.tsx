import type { Metadata } from 'next';
import { Activity, Bug, CheckCircle2, Eye, Inbox, ThumbsUp, Users } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AnalyticsChart } from '@/components/admin/AnalyticsChart';
import { MetricCard } from '@/components/admin/MetricCard';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAdminSummary, ensureAdminIndexes } from '@/lib/admin-queries';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await ensureAdminIndexes();
  const summary = await getAdminSummary();
  const { metrics } = summary;

  return (
    <AdminLayout title="Overview" description="Traffic, feedback, votes, and recent activity.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total page views" value={metrics.totalPageViews} icon={Eye} />
        <MetricCard label="Views today" value={metrics.pageViewsToday} icon={Activity} />
        <MetricCard label="Unique today" value={metrics.uniqueVisitorsToday} icon={Users} />
        <MetricCard label="Helpful rate" value={`${metrics.helpfulRate}%`} detail={`${metrics.totalHelpfulVotes} votes`} icon={ThumbsUp} />
        <MetricCard label="Feedback messages" value={metrics.totalFeedbackMessages} icon={Inbox} />
        <MetricCard label="Open requests" value={metrics.openFeatureRequests} icon={CheckCircle2} />
        <MetricCard label="Bug reports" value={metrics.bugReports} icon={Bug} />
        <MetricCard label="Helpful yes / no" value={`${summary.helpfulCounts.yes} / ${summary.helpfulCounts.no}`} icon={ThumbsUp} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="rounded-lg shadow-none">
          <CardHeader>
            <CardTitle>Page views</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsChart data={summary.viewsByDay} />
          </CardContent>
        </Card>
        <Card className="rounded-lg shadow-none">
          <CardHeader>
            <CardTitle>Top pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.topPages.length === 0 ? <p className="text-sm text-muted-foreground">No traffic recorded yet.</p> : null}
            {summary.topPages.map((page) => (
              <div key={page._id} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">{page._id}</span>
                <span className="text-muted-foreground">{page.views}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card className="rounded-lg shadow-none">
          <CardHeader>
            <CardTitle>Recent feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.recentFeedback.map((item) => (
              <div key={item._id} className="border-b border-border pb-3 text-sm last:border-0 last:pb-0">
                <div className="mb-1 flex items-center gap-2">
                  <StatusBadge value={String(item.type)} />
                  <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <p className="truncate font-medium">{String(item.pageTitle ?? item.pageSlug ?? 'Untitled')}</p>
                <p className="truncate text-muted-foreground">{String(item.message ?? 'No message')}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-lg shadow-none">
          <CardHeader>
            <CardTitle>Recent feature requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.recentFeatureRequests.map((item) => (
              <div key={item._id} className="border-b border-border pb-3 text-sm last:border-0 last:pb-0">
                <div className="mb-1 flex items-center gap-2">
                  <StatusBadge value={String(item.category)} />
                  <StatusBadge value={String(item.status ?? 'new')} />
                </div>
                <p className="truncate text-muted-foreground">{String(item.message ?? '')}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
