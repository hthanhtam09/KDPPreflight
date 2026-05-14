'use client';

import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';

const FEATURE_STATUSES = ['new', 'reviewing', 'planned', 'done', 'ignored'] as const;
type FeatureStatus = (typeof FEATURE_STATUSES)[number];

export type FeatureItem = {
  _id: string;
  category: string;
  status: FeatureStatus;
  message: string;
  email?: string;
  url?: string;
  createdAt: string;
};

export function FeatureFeedbackTable({ items }: { items: FeatureItem[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<FeatureItem | null>(null);
  const [savingId, setSavingId] = useState('');

  async function updateStatus(id: string, status: FeatureStatus) {
    setSavingId(id);
    await fetch(`/api/admin/feature-feedback/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setSavingId('');
    router.refresh();
  }

  return (
    <>
      <DataTable
        rows={items}
        empty="No feature feedback matches these filters."
        columns={[
          { key: 'category', label: 'Category', render: (row) => <StatusBadge value={row.category} /> },
          { key: 'message', label: 'Message' },
          { key: 'email', label: 'Email', render: (row) => row.email || <span className="text-muted-foreground">None</span> },
          {
            key: 'status',
            label: 'Status',
            render: (row) => (
              <Select value={row.status ?? 'new'} onValueChange={(value) => updateStatus(row._id, value as FeatureStatus)} disabled={savingId === row._id}>
                <SelectTrigger className="h-8 w-[128px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEATURE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ),
          },
          { key: 'createdAt', label: 'Created', render: (row) => new Date(row.createdAt).toLocaleString() },
          {
            key: 'actions',
            label: '',
            className: 'w-12 text-right',
            render: (row) => (
              <Button variant="ghost" size="icon" onClick={() => setSelected(row)} aria-label="View request">
                <Eye className="size-4" />
              </Button>
            ),
          },
        ]}
      />
      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feature feedback detail</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-3 text-sm">
              <p><span className="text-muted-foreground">Category:</span> {selected.category.replace(/_/g, ' ')}</p>
              <p><span className="text-muted-foreground">Status:</span> <StatusBadge value={selected.status ?? 'new'} /></p>
              <p><span className="text-muted-foreground">Email:</span> {selected.email || 'None'}</p>
              <p className="break-all"><span className="text-muted-foreground">URL:</span> {selected.url}</p>
              <p className="whitespace-pre-wrap"><span className="text-muted-foreground">Message:</span> {selected.message}</p>
              <p><span className="text-muted-foreground">Created:</span> {new Date(selected.createdAt).toLocaleString()}</p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
