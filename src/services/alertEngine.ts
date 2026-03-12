/**
 * GARIMPO IA™ — Alert Engine (Phase 3)
 *
 * Evaluate alert rules against an opportunity and create in_app alerts.
 * Prevents duplicate alerts (same user + opportunity + channel).
 * Use with service role Supabase when inserting for multiple users (e.g. Edge Function).
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export interface OpportunityForAlerts {
  id: string;
  score: number;
  category: string;
  state: string;
}

export interface AlertRuleRow {
  id: string;
  user_id: string;
  min_score: number;
  categories: string[] | null;
  states: string[] | null;
}

const CHANNEL_IN_APP = 'in_app';

/**
 * Returns true if the rule matches the opportunity (score, category, state).
 */
export function ruleMatchesOpportunity(
  rule: AlertRuleRow,
  opportunity: OpportunityForAlerts,
): boolean {
  const minScore = Number(rule.min_score) ?? 0;
  if (opportunity.score < minScore) return false;
  const categories = (rule.categories ?? []) as string[];
  if (categories.length > 0 && !categories.includes(opportunity.category)) return false;
  const states = (rule.states ?? []) as string[];
  const oppState = (opportunity.state ?? '').toUpperCase();
  if (states.length > 0 && !states.some((s) => oppState === String(s).toUpperCase())) return false;
  return true;
}

export interface EvaluateAlertRulesResult {
  matchingRuleIds: string[];
  insertedCount: number;
  skippedDuplicate: number;
}

/**
 * Load all alert rules, filter by opportunity, insert in_app alerts for matching users.
 * Skips insert when an alert (user_id, opportunity_id, channel) already exists.
 * Requires Supabase client with permission to read alert_rules and insert into alerts (e.g. service role).
 */
export async function evaluateAlertRules(
  supabase: SupabaseClient,
  opportunity: OpportunityForAlerts,
): Promise<EvaluateAlertRulesResult> {
  const matchingRuleIds: string[] = [];
  let insertedCount = 0;
  let skippedDuplicate = 0;

  const { data: rules, error: rulesErr } = await supabase
    .from('alert_rules')
    .select('id, user_id, min_score, categories, states');

  if (rulesErr || !rules?.length) return { matchingRuleIds, insertedCount, skippedDuplicate };

  const matching = rules.filter((r) =>
    ruleMatchesOpportunity(r as AlertRuleRow, opportunity),
  );

  for (const rule of matching) {
    matchingRuleIds.push(rule.id);
    const { count } = await supabase
      .from('alerts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', rule.user_id)
      .eq('opportunity_id', opportunity.id)
      .eq('channel', CHANNEL_IN_APP);

    if (count && count > 0) {
      skippedDuplicate += 1;
      continue;
    }

    const { error: insertErr } = await supabase.from('alerts').insert({
      user_id: rule.user_id,
      opportunity_id: opportunity.id,
      channel: CHANNEL_IN_APP,
    });

    if (!insertErr) insertedCount += 1;
  }

  return { matchingRuleIds, insertedCount, skippedDuplicate };
}
