// GARIMPO IA™ — Stripe Webhook (Supabase Edge Function)
// Updates profiles.subscription_tier and subscription_expires_at on subscription events.
// Env: STRIPE_WEBHOOK_SECRET, STRIPE_SECRET_KEY
// Stripe Dashboard: set webhook URL to https://<project>.supabase.co/functions/v1/stripe-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Map Stripe price id or product id to tier
function mapToTier(priceId: string): 'explorer' | 'hunter' | 'miner' | null {
  const explorer = Deno.env.get('STRIPE_PRICE_EXPLORER');
  const hunter = Deno.env.get('STRIPE_PRICE_HUNTER');
  const miner = Deno.env.get('STRIPE_PRICE_MINER');
  if (priceId === explorer) return 'explorer';
  if (priceId === hunter) return 'hunter';
  if (priceId === miner) return 'miner';
  return null;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!STRIPE_WEBHOOK_SECRET || !STRIPE_SECRET) {
    return new Response('Webhook not configured', { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  const body = await req.text();

  const parts = signature.split(',').reduce((acc, part) => {
    const [k, v] = part.split('=');
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {} as Record<string, string>);
  const timestamp = parts['t'];
  const v1 = parts['v1'];
  if (!timestamp || !v1) {
    return new Response('Invalid signature format', { status: 400 });
  }

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(STRIPE_WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const signedPayload = `${timestamp}.${body}`;
    const expected = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(signedPayload),
    );
    const expectedHex = Array.from(new Uint8Array(expected))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    if (v1 !== expectedHex) {
      return new Response('Invalid signature', { status: 400 });
    }
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  let event: { type: string; data: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(body);
  } catch {
    return new Response('Invalid payload', { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as {
      customer_email?: string;
      subscription?: string;
      client_reference_id?: string;
      metadata?: { user_id?: string };
    };
    const userId = session.metadata?.user_id;
    if (!userId) {
      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // Fetch subscription to get price id and current_period_end
    const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${session.subscription}`, {
      headers: { Authorization: `Bearer ${STRIPE_SECRET}` },
    });
    const sub = await subRes.json();
    const priceId = sub?.items?.data?.[0]?.price?.id;
    const currentPeriodEnd = sub?.current_period_end;
    const tier = priceId ? mapToTier(priceId) : 'hunter';
    if (tier) {
      await supabase
        .from('profiles')
        .update({
          subscription_tier: tier,
          subscription_expires_at: currentPeriodEnd
            ? new Date(currentPeriodEnd * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    }
  } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as {
      metadata?: { user_id?: string };
      items?: { data?: { 0?: { price?: { id?: string } } }[] };
      current_period_end?: number;
      status?: string;
    };
    const userId = sub.metadata?.user_id;
    if (!userId) {
      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const priceId = sub.items?.data?.[0]?.price?.id;
    const tier = sub.status === 'active' && priceId ? mapToTier(priceId) : 'free';
    const expiresAt =
      sub.status === 'active' && sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null;
    await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
