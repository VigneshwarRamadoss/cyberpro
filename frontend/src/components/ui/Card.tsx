'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, elevated, hover, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'border border-border rounded-card p-6',
        elevated ? 'bg-card-elevated shadow-elevated' : 'bg-card shadow-card',
        hover && 'cursor-pointer transition-all duration-150 hover:border-text-muted hover:shadow-elevated',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div>
        <h3 className="text-h4 text-text-primary">{title}</h3>
        {description && (
          <p className="text-body text-text-secondary mt-1">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-body text-text-muted">{label}</span>
        {icon && <span className="text-text-muted">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-h1 text-text-primary font-bold">{value}</span>
        {trend && (
          <span className={cn(
            'text-small font-medium mb-1',
            trend.positive ? 'text-success' : 'text-danger'
          )}>
            {trend.value}
          </span>
        )}
      </div>
    </Card>
  );
}
