'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';

export type FeedbackItem = {
  _id: string;
  type: string;
  pageTitle?: string;
  pageSlug?: string;
  message?: string;
  url?: string;
  createdAt: string;
};

export function FeedbackTable({ items }: { items: FeedbackItem[] }) {
  const [selected, setSelected] = useState<FeedbackItem | null>(null);

  return (
    <>
      <DataTable
        rows={items}
        empty="No helpful feedback matches these filters."
        columns={[
          { key: 'type', label: 'Vote', render: (row) => <StatusBadge value={row.type} /> },
          { key: 'pageTitle', label: 'Page', render: (row) => row.pageTitle || row.pageSlug || '-' },
          { key: 'message', label: 'Message', render: (row) => row.message || <span className="text-muted-foreground">No message</span> },
          { key: 'createdAt', label: 'Created', render: (row) => new Date(row.createdAt).toLocaleString() },
          {
            key: 'actions',
            label: '',
            className: 'w-12 text-right',
            render: (row) => (
              <Button variant="ghost" size="icon" onClick={() => setSelected(row)} aria-label="View feedback">
                <Eye className="size-4" />
              </Button>
            ),
          },
        ]}
      />
      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feedback detail</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-3 text-sm">
              <p><span className="text-muted-foreground">Vote:</span> {selected.type.replace(/_/g, ' ')}</p>
              <p><span className="text-muted-foreground">Page:</span> {selected.pageTitle}</p>
              <p className="break-all"><span className="text-muted-foreground">URL:</span> {selected.url}</p>
              <p className="whitespace-pre-wrap"><span className="text-muted-foreground">Message:</span> {selected.message || 'No message'}</p>
              <p><span className="text-muted-foreground">Created:</span> {new Date(selected.createdAt).toLocaleString()}</p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
