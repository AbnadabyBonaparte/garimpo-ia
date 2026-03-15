/**
 * GARIMPO IA™ — Tabs Component (shadcn/ui pattern)
 * LEI 2 ALSHAM: NÃO MODIFICAR.
 */

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface Tab {
  value: string;
  label: string;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1 rounded-lg border border-border bg-background-surface-alt p-1',
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={activeTab === tab.value}
          onClick={() => onTabChange(tab.value)}
          className={cn(
            'flex-1 rounded-md px-4 py-2 font-body text-sm font-medium transition-all duration-[var(--duration-normal)]',
            activeTab === tab.value
              ? 'bg-background-surface text-foreground shadow-elevation-1'
              : 'text-foreground-muted hover:text-foreground',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export interface TabContentProps {
  value: string;
  activeTab: string;
  children: ReactNode;
}

export function TabContent({ value, activeTab, children }: TabContentProps) {
  if (value !== activeTab) return null;
  return <div role="tabpanel">{children}</div>;
}
