/**
 * GARIMPO IA™ — Notification Layer (Phase 3)
 *
 * In-app notifications via Supabase alerts table.
 * Architecture ready for future email/push (enqueue or call external service).
 */

import { supabase } from '@/lib/supabaseClient';
import type { Alert, AlertChannel } from '@/types';

const CHANNEL_IN_APP: AlertChannel = 'in_app';

export interface NotificationPayload {
  user_id: string;
  opportunity_id: string;
  channel?: AlertChannel;
}

/**
 * Create an in-app notification (insert into alerts).
 * Used by backend/Edge Function; frontend typically reads via useAlerts.
 */
export async function createInAppNotification(
  payload: NotificationPayload,
): Promise<Alert | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('alerts')
    .insert({
      user_id: payload.user_id,
      opportunity_id: payload.opportunity_id,
      channel: payload.channel ?? CHANNEL_IN_APP,
    })
    .select()
    .single();

  if (error) return null;
  return data as Alert;
}

/**
 * Mark notification as read. Frontend: use useAlerts().markAsRead(alertId).
 */
export async function markNotificationRead(alertId: string, userId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('alerts')
    .update({ read_at: new Date().toISOString() })
    .eq('id', alertId)
    .eq('user_id', userId);
  return !error;
}

/**
 * Future: enqueue or send email. Placeholder for Phase 3+.
 */
export async function sendEmailNotification(
  _userId: string,
  _opportunityId: string,
  _subject: string,
  _body: string,
): Promise<boolean> {
  return false;
}
