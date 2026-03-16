/**
 * GARIMPO IA™ — Switch Component (shadcn/ui pattern)
 * LEI 2 ALSHAM: NÃO MODIFICAR.
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, checked, ...props }, ref) => {
    const inputId = id ?? `sw-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    return (
      <div className="flex items-center justify-between gap-4">
        {(label || description) && (
          <label htmlFor={inputId} className="cursor-pointer flex-1">
            {label && (
              <span className="block font-body text-sm font-medium text-foreground">{label}</span>
            )}
            {description && (
              <span className="block font-body text-xs text-foreground-muted">{description}</span>
            )}
          </label>
        )}
        <button
          role="switch"
          aria-checked={checked}
          id={inputId}
          type="button"
          onClick={() => {
            const syntheticEvent = {
              target: { checked: !checked },
            } as React.ChangeEvent<HTMLInputElement>;
            props.onChange?.(syntheticEvent);
          }}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
            'transition-all duration-[var(--duration-normal)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-background-deep',
            'disabled:cursor-not-allowed disabled:opacity-50',
            checked ? 'bg-amber' : 'bg-background-surface-alt',
            className,
          )}
          disabled={props.disabled}
        >
          <span
            className={cn(
              'pointer-events-none block h-5 w-5 rounded-full bg-background-deep shadow-elevation-1',
              'transition-transform duration-[var(--duration-normal)]',
              checked ? 'translate-x-5' : 'translate-x-0',
            )}
          />
        </button>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          className="sr-only"
          {...props}
        />
      </div>
    );
  },
);
Switch.displayName = 'Switch';

export { Switch };
