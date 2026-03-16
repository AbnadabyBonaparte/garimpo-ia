/**
 * GARIMPO IA™ — Textarea Component (shadcn/ui pattern)
 * LEI 2 ALSHAM: NÃO MODIFICAR.
 */

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-border bg-background-surface px-3 py-2',
          'font-body text-sm text-foreground placeholder:text-foreground-muted',
          'focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2 focus:ring-offset-background-deep',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-y',
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
