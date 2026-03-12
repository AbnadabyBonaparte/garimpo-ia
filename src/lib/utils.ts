/**
 * GARIMPO IA™ — Utility Functions
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely (shadcn/ui pattern) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format BRL currency */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format percentage */
export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(0)}%`;
}

/** Format relative time (e.g., "2h 30min") */
export function formatTimeRemaining(isoDate: string): string {
  const now = new Date();
  const target = new Date(isoDate);
  const diffMs = target.getTime() - now.getTime();

  if (diffMs <= 0) return 'Encerrado';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }

  return `${hours}h ${minutes}min`;
}

/** Category label in Portuguese */
export function getCategoryLabel(
  category: string,
): string {
  const labels: Record<string, string> = {
    vehicle: 'Veículo',
    property: 'Imóvel',
    agriculture: 'Agronegócio',
    machinery: 'Maquinário',
    electronics: 'Eletrônicos',
    other: 'Outros',
  };
  return labels[category] ?? 'Outros';
}

/** Category emoji */
export function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    vehicle: '🚗',
    property: '🏠',
    agriculture: '🚜',
    machinery: '⚙️',
    electronics: '💻',
    other: '📦',
  };
  return emojis[category] ?? '📦';
}
