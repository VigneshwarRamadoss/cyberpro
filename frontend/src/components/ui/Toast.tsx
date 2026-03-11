'use client';

import React, { useEffect } from 'react';
import { useToasts } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'bg-success/10 border-success/30 text-success',
  error: 'bg-danger/10 border-danger/30 text-danger',
  warning: 'bg-warning/10 border-warning/30 text-warning',
  info: 'bg-info/10 border-info/30 text-info',
};

export function ToastContainer() {
  const { toasts, subscribe } = useToasts();

  useEffect(() => {
    return subscribe();
  }, [subscribe]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-card border shadow-elevated animate-slide-up',
              colors[toast.type]
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <p className="text-body text-text-primary flex-1">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
}
