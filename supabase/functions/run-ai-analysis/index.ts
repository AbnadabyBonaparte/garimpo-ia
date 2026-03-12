// GARIMPO IA™ — Run AI Analysis (Phase 2)
// POST body: { opportunityId: string }
// Fetches opportunity, calls Gemini, updates opportunities.score and opportunities.ai_analysis
// Env: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not set' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  let opportunityId: string;
  try {
    const body = await req.json() as { opportunityId?: string };
    opportunityId = body.opportunityId ?? '';
    if (!opportunityId) {
      return new Response(JSON.stringify({ error: 'opportunityId required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: opp, error: fetchErr } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', opportunityId)
    .single();

  if (fetchErr || !opp) {
    return new Response(JSON.stringify({ error: 'Opportunity not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const prompt = `Analise esta oportunidade de leilão. Retorne APENAS um JSON válido, sem markdown, com as chaves: score (0-100), summary (string), risks (array de strings), recommendation ("strong_buy"|"buy"|"hold"|"avoid"), estimated_total_cost (number), estimated_net_profit (number).

Categoria: ${opp.category}
Lance atual: R$ ${Number(opp.current_bid).toLocaleString('pt-BR')}
Valor de mercado: R$ ${Number(opp.market_value).toLocaleString('pt-BR')}
Localização: ${opp.location}
Estado: ${opp.state}
${opp.risk_notes ? `Riscos conhecidos: ${opp.risk_notes}` : ''}`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        }),
      },
    );

    if (!geminiRes.ok) {
      const t = await geminiRes.text();
      return new Response(JSON.stringify({ error: `Gemini error: ${t}` }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const geminiData = await geminiRes.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned) as { score?: number; summary?: string; risks?: string[]; recommendation?: string; estimated_total_cost?: number; estimated_net_profit?: number };

    const score = Math.min(100, Math.max(0, Number(parsed.score) ?? 0));
    const analysisText = [
      parsed.summary,
      parsed.risks?.length ? `Riscos: ${parsed.risks.join('; ')}` : '',
      parsed.recommendation ? `Recomendação: ${parsed.recommendation}` : '',
      parsed.estimated_total_cost != null ? `Custo total estimado: R$ ${parsed.estimated_total_cost}` : '',
      parsed.estimated_net_profit != null ? `Lucro líquido estimado: R$ ${parsed.estimated_net_profit}` : '',
    ].filter(Boolean).join('\n\n');

    const { error: updateErr } = await supabase
      .from('opportunities')
      .update({ score, ai_analysis: analysisText, updated_at: new Date().toISOString() })
      .eq('id', opportunityId);

    if (updateErr) {
      return new Response(JSON.stringify({ error: updateErr.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, score }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
