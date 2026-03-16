/**
 * GARIMPO IA™ — Permissions Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  canAccessCategory,
  canAccessAI,
  getPlanPermissions,
  canCreateAlertRule,
  isSubscriber,
} from '../permissions';

describe('canAccessCategory', () => {
  it('free cannot access any category', () => {
    expect(canAccessCategory('free', 'vehicle')).toBe(false);
    expect(canAccessCategory('free', 'property')).toBe(false);
    expect(canAccessCategory('free', 'electronics')).toBe(false);
  });

  it('explorer can only access vehicle', () => {
    expect(canAccessCategory('explorer', 'vehicle')).toBe(true);
    expect(canAccessCategory('explorer', 'property')).toBe(false);
    expect(canAccessCategory('explorer', 'agriculture')).toBe(false);
  });

  it('hunter can access all categories', () => {
    expect(canAccessCategory('hunter', 'vehicle')).toBe(true);
    expect(canAccessCategory('hunter', 'property')).toBe(true);
    expect(canAccessCategory('hunter', 'agriculture')).toBe(true);
    expect(canAccessCategory('hunter', 'machinery')).toBe(true);
    expect(canAccessCategory('hunter', 'electronics')).toBe(true);
    expect(canAccessCategory('hunter', 'other')).toBe(true);
  });

  it('miner can access all categories', () => {
    expect(canAccessCategory('miner', 'vehicle')).toBe(true);
    expect(canAccessCategory('miner', 'property')).toBe(true);
    expect(canAccessCategory('miner', 'electronics')).toBe(true);
  });
});

describe('canAccessAI', () => {
  it('free cannot access AI', () => {
    expect(canAccessAI('free')).toBe(false);
  });

  it('explorer cannot access AI', () => {
    expect(canAccessAI('explorer')).toBe(false);
  });

  it('hunter can access AI', () => {
    expect(canAccessAI('hunter')).toBe(true);
  });

  it('miner can access AI', () => {
    expect(canAccessAI('miner')).toBe(true);
  });
});

describe('getPlanPermissions', () => {
  it('returns correct permissions for free', () => {
    const perms = getPlanPermissions('free');
    expect(perms.maxAlertRules).toBe(0);
    expect(perms.aiAnalysisAccess).toBe(false);
    expect(perms.apiAccess).toBe(false);
    expect(perms.priorityAlerts).toBe(false);
    expect(Array.isArray(perms.categories)).toBe(true);
    expect((perms.categories as string[]).length).toBe(0);
  });

  it('returns correct permissions for explorer', () => {
    const perms = getPlanPermissions('explorer');
    expect(perms.maxAlertRules).toBe(3);
    expect(perms.aiAnalysisAccess).toBe(false);
    expect(perms.alertChannels).toContain('in_app');
    expect(perms.alertChannels).not.toContain('email');
  });

  it('returns correct permissions for hunter', () => {
    const perms = getPlanPermissions('hunter');
    expect(perms.maxAlertRules).toBe(10);
    expect(perms.aiAnalysisAccess).toBe(true);
    expect(perms.categories).toBe('all');
    expect(perms.alertChannels).toContain('email');
    expect(perms.apiAccess).toBe(false);
  });

  it('returns correct permissions for miner', () => {
    const perms = getPlanPermissions('miner');
    expect(perms.maxAlertRules).toBe(50);
    expect(perms.aiAnalysisAccess).toBe(true);
    expect(perms.apiAccess).toBe(true);
    expect(perms.priorityAlerts).toBe(true);
    expect(perms.alertChannels).toContain('whatsapp');
    expect(perms.alertChannels).toContain('push');
  });
});

describe('canCreateAlertRule', () => {
  it('free cannot create any rules', () => {
    expect(canCreateAlertRule('free', 0)).toBe(false);
  });

  it('explorer can create up to 3 rules', () => {
    expect(canCreateAlertRule('explorer', 0)).toBe(true);
    expect(canCreateAlertRule('explorer', 2)).toBe(true);
    expect(canCreateAlertRule('explorer', 3)).toBe(false);
  });

  it('hunter can create up to 10 rules', () => {
    expect(canCreateAlertRule('hunter', 9)).toBe(true);
    expect(canCreateAlertRule('hunter', 10)).toBe(false);
  });

  it('miner can create up to 50 rules', () => {
    expect(canCreateAlertRule('miner', 49)).toBe(true);
    expect(canCreateAlertRule('miner', 50)).toBe(false);
  });
});

describe('isSubscriber', () => {
  it('free is not a subscriber', () => {
    expect(isSubscriber('free')).toBe(false);
  });

  it('explorer is a subscriber', () => {
    expect(isSubscriber('explorer')).toBe(true);
  });

  it('hunter is a subscriber', () => {
    expect(isSubscriber('hunter')).toBe(true);
  });

  it('miner is a subscriber', () => {
    expect(isSubscriber('miner')).toBe(true);
  });
});
