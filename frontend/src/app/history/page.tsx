'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SeverityBadge, SourceBadge } from '@/components/ui/Badge';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { analysisApi } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { History as HistoryIcon, MessageSquareText, Filter } from 'lucide-react';
import { AnalysisResult } from '@/types';

function HistoryContent() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ source_type: '', severity: '', status: '' });

  const params: Record<string, string | number> = { page, limit: 20 };
  if (filters.source_type) params.source_type = filters.source_type;
  if (filters.severity) params.severity = filters.severity;
  if (filters.status) params.analysis_status = filters.status;

  const { data, isLoading } = useQuery({
    queryKey: ['analyses', 'history', page, filters],
    queryFn: () => analysisApi.listAnalyses(params),
  });

  const analyses = data?.data?.items || [];
  const totalPages = data?.data?.pages || 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-h1 text-text-primary flex items-center gap-3"><HistoryIcon className="h-8 w-8 text-info" /> Analysis History</h1>
          <p className="text-body text-text-secondary mt-1">View all your past analyses and their results</p>
        </div>
        <Link href="/analyze/text"><Button size="sm"><MessageSquareText size={14} /> New Analysis</Button></Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={16} className="text-text-muted" />
          <select value={filters.source_type} onChange={(e) => { setFilters(f => ({...f, source_type: e.target.value})); setPage(1); }} className="bg-surface border border-border rounded-input px-3 py-2 text-body text-text-primary">
            <option value="">All Sources</option><option value="text">Text</option><option value="voice">Voice</option>
          </select>
          <select value={filters.severity} onChange={(e) => { setFilters(f => ({...f, severity: e.target.value})); setPage(1); }} className="bg-surface border border-border rounded-input px-3 py-2 text-body text-text-primary">
            <option value="">All Severities</option><option value="none">Safe</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
          </select>
          <select value={filters.status} onChange={(e) => { setFilters(f => ({...f, status: e.target.value})); setPage(1); }} className="bg-surface border border-border rounded-input px-3 py-2 text-body text-text-primary">
            <option value="">All Statuses</option><option value="completed">Completed</option><option value="processing">Processing</option><option value="failed">Failed</option>
          </select>
        </div>
      </Card>

      {/* Results */}
      {isLoading ? <LoadingState /> : analyses.length === 0 ? (
        <EmptyState title="No analyses found" message="Start by analyzing some content" action={<Link href="/analyze/text"><Button size="sm">Analyze Text</Button></Link>} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-border/50">
            {analyses.map((a: AnalysisResult) => (
              <Link key={a.id} href={`/results/${a.id}`} className="flex items-center gap-4 p-4 hover:bg-card-elevated transition-colors">
                <SourceBadge type={a.source_type} />
                <p className="flex-1 text-body text-text-secondary truncate">{a.original_text || a.transcript_text || 'Voice analysis'}</p>
                <SeverityBadge severity={a.severity} />
                <span className="text-caption text-text-muted whitespace-nowrap hidden sm:block">{formatDateTime(a.created_at)}</span>
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
              <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="text-body text-text-muted">Page {page} of {totalPages}</span>
              <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default function HistoryPage() { return <AppLayout><HistoryContent /></AppLayout>; }
