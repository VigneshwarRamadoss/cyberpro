'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SeverityBadge, SourceBadge } from '@/components/ui/Badge';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { useAuthStore } from '@/hooks/useAuth';
import { analysisApi } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { MessageSquareText, Mic, History, BarChart3, Shield, ArrowRight } from 'lucide-react';
import { AnalysisResult } from '@/types';

function DashboardContent() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['analyses', 'recent'],
    queryFn: () => analysisApi.listAnalyses({ limit: 5 }),
  });

  const analyses = data?.data?.items || [];
  const total = data?.data?.total || 0;
  const flagged = analyses.filter((a: AnalysisResult) => a.is_bullying).length;
  const lastSeverity = analyses[0]?.severity || 'none';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-h1 text-text-primary">
          Welcome back, {user?.full_name?.split(' ')[0]}
        </h1>
        <p className="text-body text-text-secondary mt-1">
          Monitor and analyze communications for safety
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/analyze/text">
          <Card hover className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-input bg-primary/10 flex items-center justify-center shrink-0">
              <MessageSquareText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-body-lg font-semibold text-text-primary">Analyze Text</p>
              <p className="text-small text-text-muted">Submit a message for analysis</p>
            </div>
          </Card>
        </Link>
        <Link href="/analyze/voice">
          <Card hover className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-input bg-accent/10 flex items-center justify-center shrink-0">
              <Mic className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-body-lg font-semibold text-text-primary">Analyze Voice</p>
              <p className="text-small text-text-muted">Upload or record audio</p>
            </div>
          </Card>
        </Link>
        <Link href="/history">
          <Card hover className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-input bg-info/10 flex items-center justify-center shrink-0">
              <History className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-body-lg font-semibold text-text-primary">View History</p>
              <p className="text-small text-text-muted">Review past analyses</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Analyses"
          value={total}
          icon={<BarChart3 size={20} />}
        />
        <StatCard
          label="Flagged Content"
          value={flagged}
          icon={<Shield size={20} />}
        />
        <StatCard
          label="Last Severity"
          value={lastSeverity === 'none' ? 'Safe' : lastSeverity.charAt(0).toUpperCase() + lastSeverity.slice(1)}
          icon={<MessageSquareText size={20} />}
        />
      </div>

      {/* Recent Analyses */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h3 text-text-primary">Recent Analyses</h2>
          <Link href="/history">
            <Button variant="ghost" size="sm">
              View All <ArrowRight size={14} />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : analyses.length === 0 ? (
          <EmptyState
            title="No analyses yet"
            message="Start by analyzing some text or voice content"
            action={
              <Link href="/analyze/text">
                <Button size="sm">Analyze Text</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-2">
            {analyses.map((analysis: AnalysisResult) => (
              <Link
                key={analysis.id}
                href={`/results/${analysis.id}`}
                className="flex items-center gap-4 p-3 rounded-input hover:bg-card-elevated transition-colors border border-transparent hover:border-border"
              >
                <SourceBadge type={analysis.source_type} />
                <p className="flex-1 text-body text-text-secondary truncate">
                  {analysis.original_text || analysis.transcript_text || 'Voice analysis'}
                </p>
                <SeverityBadge severity={analysis.severity} />
                <span className="text-caption text-text-muted whitespace-nowrap hidden sm:block">
                  {formatDateTime(analysis.created_at)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  );
}
