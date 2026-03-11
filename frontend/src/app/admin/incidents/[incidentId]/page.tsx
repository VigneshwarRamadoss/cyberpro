'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SeverityBadge, StatusBadge, SourceBadge } from '@/components/ui/Badge';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { incidentApi } from '@/lib/api';
import { formatDateTime, formatConfidence } from '@/lib/utils';
import { showToast } from '@/hooks/useToast';
import { ArrowLeft, Shield, Save } from 'lucide-react';

function IncidentDetailContent() {
  const { incidentId } = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const [reviewStatus, setReviewStatus] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['incident', incidentId],
    queryFn: () => incidentApi.get(incidentId as string),
    enabled: !!incidentId,
  });

  const mutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => incidentApi.update(incidentId as string, body),
    onSuccess: () => { showToast('Review saved successfully', 'success'); qc.invalidateQueries({ queryKey: ['incident', incidentId] }); qc.invalidateQueries({ queryKey: ['incidents'] }); },
    onError: () => showToast('Failed to save review', 'error'),
  });

  React.useEffect(() => {
    if (data?.data) {
      setReviewStatus(data.data.review_status || '');
      setActionTaken(data.data.action_taken || '');
      setAdminNotes(data.data.admin_notes || '');
    }
  }, [data]);

  if (isLoading) return <LoadingState />;
  if (error || !data) return <ErrorState onRetry={() => router.back()} />;

  const inc = data.data;

  const handleSave = () => {
    mutation.mutate({ review_status: reviewStatus, action_taken: actionTaken, admin_notes: adminNotes });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-text-secondary hover:text-text-primary transition-colors"><ArrowLeft size={20} /></button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-caption text-text-muted">Admin / Incidents / Detail</div>
          <h1 className="text-h2 text-text-primary">Incident Review</h1>
        </div>
        <SeverityBadge severity={inc.severity} />
        <StatusBadge status={inc.review_status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <h2 className="text-h4 text-text-primary mb-3">Content</h2>
            <div className="bg-surface rounded-input p-4 border border-border"><p className="text-body text-text-secondary whitespace-pre-wrap">{inc.original_text || inc.transcript_text || 'No content'}</p></div>
          </Card>
          <Card>
            <h2 className="text-h4 text-text-primary mb-3">Model Output</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-caption text-text-muted">Severity</p><SeverityBadge severity={inc.severity} /></div>
              <div><p className="text-caption text-text-muted">Category</p><p className="text-body text-text-primary capitalize">{inc.category?.replace(/_/g, ' ')}</p></div>
              <div><p className="text-caption text-text-muted">Confidence</p><p className="text-body text-text-primary">{formatConfidence(inc.confidence_score)}</p></div>
              <div><p className="text-caption text-text-muted">Risk Score</p><p className="text-body text-text-primary">{inc.risk_score}</p></div>
              <div><p className="text-caption text-text-muted">Source</p><SourceBadge type={inc.source_type || 'text'} /></div>
              <div><p className="text-caption text-text-muted">Escalation</p><p className="text-body text-text-primary capitalize">{inc.escalation_level?.replace(/_/g, ' ')}</p></div>
            </div>
            {inc.explanation && <div className="mt-4 pt-4 border-t border-border"><p className="text-caption text-text-muted mb-1">Explanation</p><p className="text-body text-text-secondary">{inc.explanation}</p></div>}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h2 className="text-h4 text-text-primary mb-3">User Details</h2>
            <div className="space-y-2">
              <div><p className="text-caption text-text-muted">Name</p><p className="text-body text-text-primary">{inc.user_name}</p></div>
              <div><p className="text-caption text-text-muted">Email</p><p className="text-body text-text-primary">{inc.user_email}</p></div>
              <div><p className="text-caption text-text-muted">Reported</p><p className="text-body text-text-secondary">{formatDateTime(inc.created_at)}</p></div>
            </div>
          </Card>
          <Card>
            <h2 className="text-h4 text-text-primary mb-4">Review Actions</h2>
            <div className="space-y-4">
              <div>
                <label className="text-body font-medium text-text-secondary block mb-1.5">Status</label>
                <select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)} className="w-full bg-surface border border-border rounded-input px-3 py-2 text-body text-text-primary">
                  <option value="open">Open</option><option value="in_review">In Review</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option>
                </select>
              </div>
              <div>
                <label className="text-body font-medium text-text-secondary block mb-1.5">Action Taken</label>
                <select value={actionTaken} onChange={(e) => setActionTaken(e.target.value)} className="w-full bg-surface border border-border rounded-input px-3 py-2 text-body text-text-primary">
                  <option value="none">None</option><option value="warned_user">Warned User</option><option value="escalated">Escalated</option><option value="monitored">Monitored</option><option value="false_positive">False Positive</option>
                </select>
              </div>
              <div>
                <label className="text-body font-medium text-text-secondary block mb-1.5">Admin Notes</label>
                <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={4} className="w-full bg-surface border border-border rounded-input px-3 py-2 text-body text-text-primary resize-y" placeholder="Add review notes..." />
              </div>
              <Button onClick={handleSave} className="w-full" isLoading={mutation.isPending}><Save size={16} /> Save Review</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function IncidentDetailPage() { return <AppLayout requireAdmin><IncidentDetailContent /></AppLayout>; }
