'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/States';
import { analyticsApi } from '@/lib/api';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

const COLORS = ['#2563EB', '#F59E0B', '#EF4444', '#22C55E', '#14B8A6', '#38BDF8', '#a855f7', '#94A3B8'];
const SEVERITY_COLORS: Record<string, string> = { low: '#38BDF8', medium: '#F59E0B', high: '#f97316', critical: '#EF4444', none: '#22C55E' };

function AnalyticsContent() {
  const { data: summary } = useQuery({ queryKey: ['analytics', 'summary'], queryFn: () => analyticsApi.summary() });
  const { data: severity } = useQuery({ queryKey: ['analytics', 'severity'], queryFn: () => analyticsApi.severityDistribution() });
  const { data: category } = useQuery({ queryKey: ['analytics', 'category'], queryFn: () => analyticsApi.categoryDistribution() });
  const { data: trends } = useQuery({ queryKey: ['analytics', 'trends'], queryFn: () => analyticsApi.trends(30) });

  const s = summary?.data;
  const sevData = severity?.data || [];
  const catData = category?.data || [];
  const trendData = trends?.data || [];

  if (!s) return <LoadingState message="Loading analytics..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-h1 text-text-primary flex items-center gap-3"><BarChart3 className="h-8 w-8 text-accent" /> Analytics</h1><p className="text-body text-text-secondary mt-1">Incident trends and moderation health</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center"><p className="text-caption text-text-muted">Total</p><p className="text-h2 text-text-primary font-bold">{s.total_incidents}</p></Card>
        <Card className="text-center"><p className="text-caption text-text-muted">Open</p><p className="text-h2 text-warning font-bold">{s.open_incidents}</p></Card>
        <Card className="text-center"><p className="text-caption text-text-muted">Resolved</p><p className="text-h2 text-success font-bold">{s.resolved_incidents}</p></Card>
        <Card className="text-center"><p className="text-caption text-text-muted">Critical</p><p className="text-h2 text-danger font-bold">{s.critical_incidents}</p></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-h4 text-text-primary mb-4">Severity Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sevData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="severity" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #334155', borderRadius: '10px', color: '#F8FAFC' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {sevData.map((entry: any, i: number) => <Cell key={i} fill={SEVERITY_COLORS[entry.severity] || COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-h4 text-text-primary mb-4">Category Breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="category" label={(e) => e.category?.replace(/_/g, ' ')}>
                  {catData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #334155', borderRadius: '10px', color: '#F8FAFC' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-h4 text-text-primary mb-4">Incident Trends (30 Days)</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
              <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #334155', borderRadius: '10px', color: '#F8FAFC' }} />
              <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

export default function AnalyticsPage() { return <AppLayout requireAdmin><AnalyticsContent /></AppLayout>; }
