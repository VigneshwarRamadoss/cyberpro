'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';
import { Button } from './Button';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 gap-4', className)}>
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
      <p className="text-body text-text-muted">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 gap-4', className)}>
      <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
        <AlertCircle className="h-6 w-6 text-danger" />
      </div>
      <div className="text-center">
        <h3 className="text-h4 text-text-primary mb-1">{title}</h3>
        <p className="text-body text-text-muted max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} size="sm">
          Try Again
        </Button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, message, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 gap-4', className)}>
      <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center">
        {icon || <Inbox className="h-6 w-6 text-text-muted" />}
      </div>
      <div className="text-center">
        <h3 className="text-h4 text-text-primary mb-1">{title}</h3>
        <p className="text-body text-text-muted max-w-sm">{message}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-card rounded-input w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-card rounded-card" />
        ))}
      </div>
      <div className="h-64 bg-card rounded-card" />
    </div>
  );
}
