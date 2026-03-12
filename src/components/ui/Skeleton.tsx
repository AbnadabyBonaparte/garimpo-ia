/**
 * GARIMPO IA™ — Skeleton Component
 * LEI 5 ALSHAM: Loading state obrigatório em toda página com dados.
 */

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-background-surface-alt',
        className,
      )}
    />
  );
}

/** Card skeleton matching OpportunityCard layout */
export function OpportunityCardSkeleton() {
  return (
    <div className="rounded-md border border-border bg-background-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <Skeleton className="mb-2 h-5 w-3/4" />
      <Skeleton className="mb-4 h-3 w-1/2" />
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-background-surface-alt p-3">
        <div>
          <Skeleton className="mb-1 h-2.5 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div>
          <Skeleton className="mb-1 h-2.5 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-32" />
    </div>
  );
}
