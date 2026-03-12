/**
 * GARIMPO IA™ — useAlerts Hook
 *
 * Fetch in-app alerts for the current user. Mark as read.
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useApp } from '@/contexts/AppContext';
import type { Alert } from '@/types';

const LIMIT = 20;

export function useAlerts() {
  const { session } = useApp();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id;

  const fetchAlerts = useCallback(async () => {
    if (!supabase || !userId) {
      setAlerts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('alerts')
      .select('id, opportunity_id, channel, sent_at, read_at')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .limit(LIMIT);

    if (error) {
      setAlerts([]);
    } else {
      setAlerts((data as Alert[]) ?? []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void fetchAlerts();
  }, [fetchAlerts]);

  // Realtime: new alerts appear instantly
  useEffect(() => {
    if (!supabase || !userId) return;
    const channel = supabase
      .channel('alerts-in-app')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts', filter: `user_id=eq.${userId}` },
        () => {
          void fetchAlerts();
        },
      )
      .subscribe();
    return () => {
      supabase?.removeChannel(channel);
    };
  }, [supabase, userId, fetchAlerts]);

  const markAsRead = useCallback(
    async (alertId: string) => {
      if (!supabase) return;
      await supabase.from('alerts').update({ read_at: new Date().toISOString() }).eq('id', alertId).eq('user_id', userId!);
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, read_at: new Date().toISOString() } : a)));
    },
    [userId],
  );

  const unreadCount = alerts.filter((a) => !a.read_at).length;

  return { alerts, loading, unreadCount, refetch: fetchAlerts, markAsRead };
}
