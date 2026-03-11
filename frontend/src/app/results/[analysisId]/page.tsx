'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SeverityBadge, SourceBadge } from '@/components/ui/Badge';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { analysisApi } from '@/lib/api';
import { formatDateTime, formatConfidence } from '@/lib/utils';
import { ShieldCheck, ShieldAlert, AlertTriangle, MessageSquareText, History, ArrowLeft, Info, Lightbulb, Shield } from 'lucide-react';

function ResultContent() {
  const { analysisId } = useParams();
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ['analysis', analysisId],
    queryFn: () => analysisApi.getAnalysis(analysisId as string),
    enabled: !!analysisId,
  });

  if (isLoading) return <LoadingState message="Loading analysis result..." />;
  if (error || !data) return <ErrorState onRetry={() => router.back()} />;

  const a = data.data;
  const isSafe = !a.is_bullying;
  const showWarning = !isSafe && ['medium','high','critical'].includes(a.severity || '');

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-body text-text-secondary hover:text-text-primary transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className={`rounded-card p-6 border ${isSafe ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isSafe ? 'bg-success/10' : 'bg-danger/10'}`}>
            {isSafe ? <ShieldCheck className="h-7 w-7 text-success" /> : <ShieldAlert className="h-7 w-7 text-danger" />}
          </div>
          <div className="flex-1">
            <h1 className="text-h2 text-text-primary">{isSafe ? 'Content Appears Safe' : 'Potentially Harmful Content Detected'}</h1>
            <p className="text-body text-text-secondary mt-1">{isSafe ? 'No harmful patterns were identified.' : 'This content has been flagged. See details below.'}</p>
          </div>
          <SeverityBadge severity={a.severity} />
        </div>
      </div>

      {showWarning && (
        <div className="flex items-start gap-3 p-4 rounded-card bg-warning/5 border border-warning/20">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-body font-medium text-warning">Safety Notice</p>
            <p className="text-body text-text-secondary mt-1">{a.severity === 'critical' ? 'This content has been escalated for urgent moderator review.' : 'This content may contain harmful language. Please consider revising.'}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-3"><Info size={16} className="text-info" /><h3 className="text-body font-semibold text-text-primary">Confidence</h3></div>
          <p className="text-h2 text-text-primary font-bold">{formatConfidence(a.confidence_score)}</p>
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden mt-2">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(a.confidence_score || 0) * 100}%` }} />
          </div>
        </Card>
        <Card>
          <div className="space-y-3">
            <div><p className="text-caption text-text-muted">Category</p><p className="text-body-lg font-medium text-text-primary capitalize">{a.category?.replace(/_/g, ' ') || 'None'}</p></div>
            <div><p className="text-caption text-text-muted">Source</p><SourceBadge type={a.source_type} /></div>
            <div><p className="text-caption text-text-muted">Analyzed</p><p className="text-body text-text-secondary">{formatDateTime(a.created_at)}</p></div>
          </div>
        </Card>
      </div>

      <Card><div className="flex items-center gap-2 mb-3"><Lightbulb size={16} className="text-warning" /><h3 className="text-body font-semibold text-text-primary">Explanation</h3></div><p className="text-body text-text-secondary leading-relaxed">{a.explanation || 'No explanation available.'}</p></Card>

      {a.suggested_action && (
        <Card><div className="flex items-center gap-2 mb-3"><Shield size={16} className="text-primary" /><h3 className="text-body font-semibold text-text-primary">Recommended Action</h3></div><p className="text-body text-text-secondary">{a.suggested_action}</p></Card>
      )}

      <Card>
        <h3 className="text-body font-semibold text-text-primary mb-3">Original Content</h3>
        <div className="bg-surface rounded-input p-4 border border-border"><p className="text-body text-text-secondary whitespace-pre-wrap">{a.original_text || a.transcript_text || 'No content'}</p></div>
        {a.processing_ms && <p className="text-caption text-text-muted mt-2">Processed in {a.processing_ms}ms • {a.model_version}</p>}
      </Card>

      <div className="flex items-center gap-3">
        <Link href="/analyze/text"><Button><MessageSquareText size={16} /> Analyze Another</Button></Link>
        <Link href="/history"><Button variant="secondary"><History size={16} /> View History</Button></Link>
      </div>
    </div>
  );
}

export default function ResultPage() { return <AppLayout><ResultContent /></AppLayout>; }
