/**
 * GARIMPO IA™ — Checkbox Component (shadcn/ui pattern)
 * LEI 2 ALSHAM: NÃO MODIFICAR.
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  indeterminate?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const inputId = id ?? `cb-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    return (
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id={inputId}
          ref={ref}
          className={cn(
            'mt-0.5 h-4 w-4 cursor-pointer rounded border border-border bg-background-surface',
            'checked:border-amber checked:bg-amber',
            'focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2 focus:ring-offset-background-deep',
            'disabled:cursor-not-allowed disabled:opacity-50',
            '[appearance:auto]',
            className,
          )}
          {...props}
        />
        {(label || description) && (
          <label htmlFor={inputId} className="cursor-pointer">
            {label && (
              <span className="block font-body text-sm font-medium text-foreground">{label}</span>
            )}
            {description && (
              <span className="block font-body text-xs text-foreground-muted">{description}</span>
            )}
          </label>
        )}
      </div>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
