/**
 * GARIMPO IA™ — Stripe Checkout
 *
 * Redirects to Stripe Checkout. Backend (Supabase Edge Function create-checkout-session)
 * creates the session and returns { url }. Set VITE_STRIPE_CHECKOUT_API_URL.
 * Sends Supabase JWT when available so the backend can set metadata.user_id for webhook.
 */

import { envConfig } from '@/lib/env';
import { supabase } from '@/lib/supabaseClient';
import type { SubscriptionTier } from '@/types';

const CHECKOUT_API = envConfig.STRIPE_CHECKOUT_API_URL?.trim();

export interface CheckoutSessionResponse {
  url: string;
}

/**
 * Redirect to Stripe Checkout for the given plan.
 * Sends Authorization: Bearer <supabase_jwt> when user is logged in.
 */
export async function redirectToCheckout(planId: SubscriptionTier): Promise<boolean> {
  if (!CHECKOUT_API) {
    throw new Error('Checkout não configurado. Configure VITE_STRIPE_CHECKOUT_API_URL.');
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  }

  const res = await fetch(CHECKOUT_API, {
    method: 'POST',
    headers,
    body: JSON.stringify({ planId }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ao criar sessão de checkout (${res.status})`);
  }

  const data = (await res.json()) as CheckoutSessionResponse;
  if (data?.url) {
    window.location.href = data.url;
    return true;
  }

  throw new Error('Resposta inválida do servidor de checkout.');
}

/** True if checkout API URL is configured. */
export function isCheckoutConfigured(): boolean {
  return !!CHECKOUT_API;
}
