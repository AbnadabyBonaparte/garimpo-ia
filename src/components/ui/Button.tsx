/**
 * GARIMPO IA™ — Button Component (shadcn/ui pattern)
 *
 * LEI 2 ALSHAM: Componente base. NÃO MODIFICAR.
 * Para variantes novas, adicione via cva() variants.
 */

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-body text-sm font-semibold transition-all duration-[var(--duration-normal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-amber text-background-deep hover:bg-amber-dark active:scale-[0.97]',
        secondary:
          'border border-cyan bg-transparent text-cyan hover:bg-cyan/10',
        danger:
          'border border-red bg-red/15 text-red hover:bg-red/25',
        ghost:
          'bg-transparent text-foreground-muted hover:bg-background-surface-alt hover:text-foreground',
        outline:
          'border border-border bg-transparent text-foreground hover:bg-background-surface',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
