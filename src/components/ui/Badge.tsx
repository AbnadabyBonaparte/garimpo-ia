/**
 * GARIMPO IA™ — Badge Component (shadcn/ui pattern)
 * LEI 2 ALSHAM: NÃO MODIFICAR.
 */

import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono-data text-[11px] font-semibold tracking-wide',
  {
    variants: {
      variant: {
        high: 'border border-green/30 bg-green/12 text-green',
        medium: 'border border-amber/30 bg-amber/12 text-amber',
        low: 'border border-red/30 bg-red/12 text-red',
        ai: 'border border-cyan/30 bg-cyan/12 text-cyan',
        new: 'border border-purple-500/30 bg-purple-500/12 text-purple-400',
      },
    },
    defaultVariants: {
      variant: 'ai',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}
