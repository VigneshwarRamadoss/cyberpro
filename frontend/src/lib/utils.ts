import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatConfidence(score: number | null): string {
  if (score === null) return 'N/A';
  return `${Math.round(score * 100)}%`;
}

export function getSeverityColor(severity: string | null): string {
  switch (severity) {
    case 'critical': return 'text-danger';
    case 'high': return 'text-orange-400';
    case 'medium': return 'text-warning';
    case 'low': return 'text-blue-400';
    case 'none': return 'text-success';
    default: return 'text-text-muted';
  }
}

export function getSeverityBg(severity: string | null): string {
  switch (severity) {
    case 'critical': return 'bg-danger/20 text-danger border-danger/30';
    case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'medium': return 'bg-warning/20 text-warning border-warning/30';
    case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'none': return 'bg-success/20 text-success border-success/30';
    default: return 'bg-border/50 text-text-muted border-border';
  }
}

export function getStatusBg(status: string): string {
  switch (status) {
    case 'open': return 'bg-warning/20 text-warning border-warning/30';
    case 'in_review': return 'bg-info/20 text-info border-info/30';
    case 'resolved': return 'bg-success/20 text-success border-success/30';
    case 'dismissed': return 'bg-border/50 text-text-muted border-border';
    default: return 'bg-border/50 text-text-muted border-border';
  }
}

export function capitalize(str: string): string {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}
