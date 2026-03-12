/**
 * GARIMPO IA™ — Input Component (shadcn/ui pattern)
 * LEI 2 ALSHAM: Componente base. NÃO MODIFICAR.
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-border bg-background-surface px-3 py-2 font-body text-sm text-foreground placeholder:text-foreground-muted',
          'focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2 focus:ring-offset-background-deep',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
