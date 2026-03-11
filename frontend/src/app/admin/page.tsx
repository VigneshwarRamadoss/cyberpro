'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SeverityBadge, StatusBadge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/States';
import { analyticsApi, incidentApi } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { Shield, AlertTriangle, CheckCircle2, Users, ArrowRight, BarChart3 } from 'lucide-react';
import { Incident } from '@/types';

function AdminDashboardContent() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => analyticsApi.summary(),
  });
  const { data: incidents, isLoading: incidentsLoading } = useQuery({
    queryKey: ['incidents', 'recent'],
    queryFn: () => incidentApi.list({ limit: 5, sort: 'newest' }),
  });

  const s = summary?.data;
  const recentIncidents = incidents?.data?.items || [];
  const isLoading = summaryLoading || incidentsLoading;

  if (isLoading) return <LoadingState message="Loading admin dashboard..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-h1 text-text-primary">Admin Dashboard</h1>
        <p className="text-body text-text-secondary mt-1">Moderation overview and incident management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Incidents" value={s?.total_incidents || 0} icon={<Shield size={20} />} />
        <StatCard label="Open Incidents" value={s?.open_incidents || 0} icon={<AlertTriangle size={20} className="text-warning" />} />
        <StatCard label="Critical" value={s?.critical_incidents || 0} icon={<AlertTriangle size={20} className="text-danger" />} />
        <StatCard label="Repeat Users" value={s?.repeat_users_count || 0} icon={<Users size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Link href="/admin/incidents"><Card hover className="flex items-center gap-4 p-6">
          <Shield className="h-8 w-8 text-primary" /><div className="flex-1"><p className="text-h4 text-text-primary">Incident Queue</p><p className="text-body text-text-muted">Review and manage flagged content</p></div><ArrowRight className="text-text-muted" />
        </Card></Link>
        <Link href="/admin/analytics"><Card hover className="flex items-center gap-4 p-6">
          <BarChart3 className="h-8 w-8 text-accent" /><div className="flex-1"><p className="text-h4 text-text-primary">Analytics</p><p className="text-body text-text-muted">Severity trends and category breakdown</p></div><ArrowRight className="text-text-muted" />
        </Card></Link>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h3 text-text-primary">Recent Flagged Incidents</h2>
          <Link href="/admin/incidents"><Button variant="ghost" size="sm">View All <ArrowRight size={14} /></Button></Link>
        </div>
        <div className="space-y-2">
          {recentIncidents.map((inc: Incident) => (
            <Link key={inc.id} href={`/admin/incidents/${inc.id}`} className="flex items-center gap-4 p-3 rounded-input hover:bg-card-elevated transition-colors border border-transparent hover:border-border">
              <SeverityBadge severity={inc.severity} />
              <div className="flex-1 min-w-0">
                <p className="text-body text-text-primary truncate">{inc.user_name}</p>
                <p className="text-caption text-text-muted truncate">{inc.original_text || inc.transcript_text || 'Voice'}</p>
              </div>
              <StatusBadge status={inc.review_status} />
              <span className="text-caption text-text-muted whitespace-nowrap hidden sm:block">{formatDateTime(inc.created_at)}</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function AdminDashboardPage() { return <AppLayout requireAdmin><AdminDashboardContent /></AppLayout>; }
