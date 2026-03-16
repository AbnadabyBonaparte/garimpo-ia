/**
 * GARIMPO IA™ — useProfile Hook
 *
 * Update profile data (name, avatar, preferences, notifications).
 */

import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useApp } from '@/contexts/AppContext';
import type { OpportunityCategory } from '@/types';

export interface UpdateProfileInput {
  full_name?: string;
  avatar_url?: string | null;
  preferred_categories?: OpportunityCategory[];
  preferred_states?: string[];
  notification_whatsapp?: boolean;
  notification_email?: boolean;
  notification_push?: boolean;
}

export function useProfile() {
  const { session, refetchProfile } = useApp();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useCallback(
    async (input: UpdateProfileInput): Promise<boolean> => {
      if (!supabase || !session?.user?.id) return false;
      setIsUpdating(true);
      setError(null);
      try {
        const { error: e } = await supabase
          .from('profiles')
          .update({ ...input, updated_at: new Date().toISOString() })
          .eq('id', session.user.id);
        if (e) throw e;
        await refetchProfile();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil.');
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [session?.user?.id, refetchProfile],
  );

  return { updateProfile, isUpdating, error };
}
