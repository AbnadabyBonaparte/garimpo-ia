/**
 * GARIMPO IA™ — Plan Permissions System
 *
 * SSOT para controle de acesso por plano.
 * Usar canAccessCategory() e canAccessAI() em OpportunityDetailPage, FeedPage, AlertsPage.
 */

import type { SubscriptionTier, OpportunityCategory, AlertChannel } from '@/types';

export interface PlanPermissions {
  /** Categorias acessíveis: array específico ou 'all' */
  categories: OpportunityCategory[] | 'all';
  /** Canais de alerta disponíveis */
  alertChannels: AlertChannel[];
  /** Máximo de regras de alerta */
  maxAlertRules: number;
  /** Acesso à análise completa da IA */
  aiAnalysisAccess: boolean;
  /** Acesso à API */
  apiAccess: boolean;
  /** Alertas prioritários */
  priorityAlerts: boolean;
}

const PLAN_MAP: Record<SubscriptionTier, PlanPermissions> = {
  free: {
    categories: [],
    alertChannels: [],
    maxAlertRules: 0,
    aiAnalysisAccess: false,
    apiAccess: false,
    priorityAlerts: false,
  },
  explorer: {
    categories: ['vehicle'],
    alertChannels: ['in_app'],
    maxAlertRules: 3,
    aiAnalysisAccess: false,
    apiAccess: false,
    priorityAlerts: false,
  },
  hunter: {
    categories: 'all',
    alertChannels: ['in_app', 'email'],
    maxAlertRules: 10,
    aiAnalysisAccess: true,
    apiAccess: false,
    priorityAlerts: false,
  },
  miner: {
    categories: 'all',
    alertChannels: ['in_app', 'email', 'whatsapp', 'push'],
    maxAlertRules: 50,
    aiAnalysisAccess: true,
    apiAccess: true,
    priorityAlerts: true,
  },
};

export function getPlanPermissions(tier: SubscriptionTier): PlanPermissions {
  return PLAN_MAP[tier];
}

export function canAccessCategory(
  tier: SubscriptionTier,
  category: OpportunityCategory,
): boolean {
  const perms = PLAN_MAP[tier];
  return perms.categories === 'all' || perms.categories.includes(category);
}

export function canAccessAI(tier: SubscriptionTier): boolean {
  return PLAN_MAP[tier].aiAnalysisAccess;
}

export function canCreateAlertRule(
  tier: SubscriptionTier,
  currentRuleCount: number,
): boolean {
  return currentRuleCount < PLAN_MAP[tier].maxAlertRules;
}

export function hasApiAccess(tier: SubscriptionTier): boolean {
  return PLAN_MAP[tier].apiAccess;
}

export function getPlanLabel(tier: SubscriptionTier): string {
  const labels: Record<SubscriptionTier, string> = {
    free: 'Gratuito',
    explorer: 'Explorer',
    hunter: 'Hunter',
    miner: 'Miner',
  };
  return labels[tier];
}

export function isSubscriber(tier: SubscriptionTier): boolean {
  return tier !== 'free';
}
