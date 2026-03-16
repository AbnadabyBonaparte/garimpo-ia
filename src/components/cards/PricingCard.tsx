/**
 * GARIMPO IA™ — PricingCard Component
 * Card de plano de assinatura com design premium.
 */

import { Check, Loader2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { SubscriptionTier } from '@/types';

export interface PricingFeature {
  label: string;
  included: boolean;
}

export interface PricingCardProps {
  id: SubscriptionTier;
  name: string;
  price: string;
  period: string;
  description: string;
  features: PricingFeature[];
  cta: string;
  highlighted?: boolean;
  isCurrent?: boolean;
  isLoading?: boolean;
  onSubscribe?: (id: SubscriptionTier) => void;
  index?: number;
}

export function PricingCard({
  id,
  name,
  price,
  period,
  description,
  features,
  cta,
  highlighted,
  isCurrent,
  isLoading,
  onSubscribe,
  index = 0,
}: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className={cn(
        'relative flex flex-col rounded-xl border bg-background-surface p-6 transition-all duration-[var(--duration-normal)]',
        highlighted
          ? 'border-amber shadow-glow-amber scale-[1.02]'
          : 'border-border hover:border-border hover:shadow-elevation-1',
      )}
    >
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber px-3 py-1 font-body text-xs font-bold text-background-deep">
            <Zap className="h-3 w-3" />
            MAIS POPULAR
          </span>
        </div>
      )}

      {isCurrent && (
        <div className="absolute -top-3.5 right-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 font-body text-xs font-medium text-cyan">
            Plano atual
          </span>
        </div>
      )}

      <div className="mb-4">
        <p className="font-display text-xl font-bold text-foreground">{name}</p>
        <p className="mt-1 font-body text-sm text-foreground-muted">{description}</p>
      </div>

      <div className="mb-6 flex items-baseline gap-1">
        <span className={cn(
          'font-mono-data text-4xl font-bold',
          highlighted ? 'text-amber' : 'text-foreground',
        )}>
          {price}
        </span>
        <span className="font-body text-sm text-foreground-muted">{period}</span>
      </div>

      <ul className="mb-6 flex-1 space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className={cn(
              'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
              feature.included
                ? 'bg-green/15 text-green'
                : 'bg-background-surface-alt text-foreground-muted',
            )}>
              <Check className="h-2.5 w-2.5" />
            </span>
            <span className={cn(
              'font-body text-sm',
              feature.included ? 'text-foreground' : 'text-foreground-muted line-through',
            )}>
              {feature.label}
            </span>
          </li>
        ))}
      </ul>

      {id === 'free' ? (
        <Button variant="outline" className="w-full" disabled={isCurrent}>
          {isCurrent ? 'Seu plano atual' : 'Começar grátis'}
        </Button>
      ) : (
        <Button
          variant={highlighted ? 'primary' : 'outline'}
          className="w-full"
          disabled={isCurrent || isLoading}
          onClick={() => onSubscribe?.(id)}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isCurrent ? (
            'Plano atual'
          ) : (
            cta
          )}
        </Button>
      )}
    </motion.div>
  );
}
