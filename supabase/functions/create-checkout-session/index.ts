// GARIMPO IA™ — Create Stripe Checkout Session (Supabase Edge Function)
// POST body: { planId: 'explorer' | 'hunter' | 'miner' }
// Headers: Authorization: Bearer <supabase_jwt> (optional; if present, metadata.user_id is set for webhook)
// Returns: { url: string }
// Env: STRIPE_SECRET_KEY, STRIPE_PRICE_EXPLORER, STRIPE_PRICE_HUNTER, STRIPE_PRICE_MINER, APP_URL

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_SECRET = Deno.env.get('STRIPE_SECRET_KEY');
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:5173';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const PRICE_IDS: Record<string, string> = {
  explorer: Deno.env.get('STRIPE_PRICE_EXPLORER') || '',
  hunter: Deno.env.get('STRIPE_PRICE_HUNTER') || '',
  miner: Deno.env.get('STRIPE_PRICE_MINER') || '',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!STRIPE_SECRET) {
    return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let userId: string | null = null;
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const jwt = authHeader.slice(7);
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user } } = await supabase.auth.getUser(jwt);
    if (user?.id) userId = user.id;
  }

  try {
    const { planId } = (await req.json()) as { planId?: string };
    if (!planId || !PRICE_IDS[planId]) {
      return new Response(JSON.stringify({ error: 'Invalid planId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const priceId = PRICE_IDS[planId];
    if (!priceId) {
      return new Response(JSON.stringify({ error: 'Price not configured for plan' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const params: Record<string, string> = {
      'mode': 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'success_url': `${APP_URL}/pricing?success=1`,
      'cancel_url': `${APP_URL}/pricing?cancel=1`,
    };
    if (userId) {
      params['metadata[user_id]'] = userId;
      params['subscription_data[metadata][user_id]'] = userId;
    }

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params),
    });

    const data = await res.json();
    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ url: data.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
