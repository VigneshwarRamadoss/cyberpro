'use client';

import React from 'react';
import { cn, getSeverityBg, getStatusBg, capitalize } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'severity' | 'status' | 'info';
  severity?: string | null;
  status?: string;
  className?: string;
}

export function Badge({ children, variant = 'default', severity, status, className }: BadgeProps) {
  let colorClasses = 'bg-border/50 text-text-secondary border-border';
  
  if (variant === 'severity' && severity) {
    colorClasses = getSeverityBg(severity);
  } else if (variant === 'status' && status) {
    colorClasses = getStatusBg(status);
  } else if (variant === 'info') {
    colorClasses = 'bg-info/20 text-info border-info/30';
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-pill text-small font-medium border',
      colorClasses,
      className
    )}>
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string | null }) {
  if (!severity || severity === 'none') {
    return <Badge variant="severity" severity="none">Safe</Badge>;
  }
  return (
    <Badge variant="severity" severity={severity}>
      {capitalize(severity)}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="status" status={status}>
      {capitalize(status)}
    </Badge>
  );
}

export function SourceBadge({ type }: { type: string }) {
  return (
    <Badge variant="info">
      {type === 'voice' ? '🎤 Voice' : '💬 Text'}
    </Badge>
  );
}
