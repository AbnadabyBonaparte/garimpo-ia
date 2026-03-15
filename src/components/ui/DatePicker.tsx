/**
 * GARIMPO IA™ — DatePicker Component (shadcn/ui pattern)
 * Wrapper semântico sobre input[type=datetime-local].
 * LEI 2 ALSHAM: NÃO MODIFICAR.
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? 'datepicker';
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1 block font-body text-xs font-medium text-foreground-muted">
            {label}
          </label>
        )}
        <div className="relative">
          <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            ref={ref}
            id={inputId}
            type="datetime-local"
            className={cn(
              'flex h-10 w-full rounded-md border bg-background-surface pl-9 pr-3 py-2',
              'font-body text-sm text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2 focus:ring-offset-background-deep',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error ? 'border-red focus:ring-red' : 'border-border',
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 font-body text-xs text-red">{error}</p>
        )}
      </div>
    );
  },
);
DatePicker.displayName = 'DatePicker';

export { DatePicker };
