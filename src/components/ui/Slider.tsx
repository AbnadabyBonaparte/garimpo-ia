/**
 * GARIMPO IA™ — Slider Component (shadcn/ui pattern)
 * LEI 2 ALSHAM: NÃO MODIFICAR.
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showValue?: boolean;
  valueFormatter?: (v: number) => string;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, showValue = true, valueFormatter, value, min = 0, max = 100, id, ...props }, ref) => {
    const inputId = id ?? `slider-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    const numValue = Number(value ?? 0);
    const numMin = Number(min);
    const numMax = Number(max);
    const pct = ((numValue - numMin) / (numMax - numMin)) * 100;
    const display = valueFormatter ? valueFormatter(numValue) : String(numValue);

    return (
      <div className={cn('w-full', className)}>
        {(label || showValue) && (
          <div className="mb-2 flex items-center justify-between">
            {label && (
              <label htmlFor={inputId} className="font-body text-sm text-foreground-muted">
                {label}
              </label>
            )}
            {showValue && (
              <span className="font-mono-data text-sm font-semibold text-amber">{display}</span>
            )}
          </div>
        )}
        <div className="relative h-5 flex items-center">
          <div className="absolute h-2 w-full rounded-full bg-background-surface-alt" />
          <div
            className="absolute h-2 rounded-full bg-amber transition-all"
            style={{ width: `${pct}%` }}
          />
          <input
            ref={ref}
            id={inputId}
            type="range"
            min={min}
            max={max}
            value={value}
            className="relative w-full cursor-pointer appearance-none bg-transparent
              [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-amber [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-background-deep [&::-webkit-slider-thumb]:shadow-elevation-1
              [&::-webkit-slider-thumb]:cursor-pointer
              focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
            {...props}
          />
        </div>
      </div>
    );
  },
);
Slider.displayName = 'Slider';

export { Slider };
