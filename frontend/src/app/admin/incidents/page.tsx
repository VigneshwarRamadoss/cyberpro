'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SeverityBadge, StatusBadge, SourceBadge } from '@/components/ui/Badge';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { Table } from '@/components/ui/Table';
import { incidentApi } from '@/lib/api';
import { formatDateTime, formatConfidence } from '@/lib/utils';
import { Shield, Filter, Search } from 'lucide-react';
import { Incident } from '@/types';

function IncidentQueueContent() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ review_status: '', severity: '', category: '', search: '', sort: 'newest' });

  const params: Record<string, string | number> = { page, limit: 20, sort: filters.sort };
  if (filters.review_status) params.review_status = filters.review_status;
  if (filters.severity) params.severity = filters.severity;
  if (filters.category) params.category = filters.category;
  if (filters.search) params.search = filters.search;

  const { data, isLoading } = useQuery({
    queryKey: ['incidents', 'queue', page, filters],
    queryFn: () => incidentApi.list(params),
  });

  const incidents = data?.data?.items || [];
  const totalPages = data?.data?.pages || 1;

  const columns = [
    { key: 'severity', header: 'Severity', render: (i: Incident) => <SeverityBadge severity={i.severity} /> },
    { key: 'user_name', header: 'User', render: (i: Incident) => <div><p className="text-body text-text-primary">{i.user_name}</p><p className="text-caption text-text-muted">{i.user_email}</p></div> },
    { key: 'source_type', header: 'Source', render: (i: Incident) => <SourceBadge type={i.source_type || 'text'} /> },
    { key: 'category', header: 'Category', render: (i: Incident) => <span className="text-body text-text-secondary capitalize">{i.category?.replace(/_/g, ' ') || '-'}</span> },
    { key: 'confidence_score', header: 'Confidence', render: (i: Incident) => <span className="text-body text-text-secondary">{formatConfidence(i.confidence_score)}</span> },
    { key: 'review_status', header: 'Status', render: (i: Incident) => <StatusBadge status={i.review_status} /> },
    { key: 'created_at', header: 'Date', render: (i: Incident) => <span className="text-caption text-text-muted">{formatDateTime(i.created_at)}</span> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-h1 text-text-primary flex items-center gap-3"><Shield className="h-8 w-8 text-primary" /> Incident Queue</h1><p className="text-body text-text-secondary mt-1">Review and manage flagged content</p></div>

      <Card className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={filters.search} onChange={(e) => { setFilters(f => ({...f, search: e.target.value})); setPage(1); }} placeholder="Search users or content..." className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-input text-body text-text-primary" />
          </div>
          <select value={filters.review_status} onChange={(e) => { setFilters(f => ({...f, review_status: e.target.value})); setPage(1); }} className="bg-surface border border-border rounded-input px-3 py-2 text-body text-text-primary">
            <option value="">All Statuses</option><option value="open">Open</option><option value="in_review">In Review</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option>
          </select>
          <select value={filters.severity} onChange={(e) => { setFilters(f => ({...f, severity: e.target.value})); setPage(1); }} className="bg-surface border border-border rounded-input px-3 py-2 text-body text-text-primary">
            <option value="">All Severities</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
          </select>
          <select value={filters.sort} onChange={(e) => { setFilters(f => ({...f, sort: e.target.value})); setPage(1); }} className="bg-surface border border-border rounded-input px-3 py-2 text-body text-text-primary">
            <option value="newest">Newest</option><option value="highest_severity">Highest Severity</option>
          </select>
        </div>
      </Card>

      {isLoading ? <LoadingState /> : incidents.length === 0 ? (
        <EmptyState title="No incidents found" message="No flagged content matches your filters" />
      ) : (
        <Card className="p-0 overflow-hidden">
          <Table columns={columns} data={incidents} keyExtractor={(i) => i.id} onRowClick={(i) => window.location.href = `/admin/incidents/${i.id}`} />
          {totalPages > 1 && <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
            <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="text-body text-text-muted">Page {page} of {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>}
        </Card>
      )}
    </div>
  );
}

export default function IncidentQueuePage() { return <AppLayout requireAdmin><IncidentQueueContent /></AppLayout>; }
