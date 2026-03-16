// GARIMPO IA™ — Run AI Analysis (Secure)
// POST body: { opportunityId: string }
// Authorization: Bearer <supabase_jwt> (required)
// Env: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ALLOWED_ORIGIN

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// @deno-types="https://deno.land/x/zod@v3.22.4/mod.ts"
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') ?? 'http://localhost:5173';

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const AIResponseSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string().max(2000),
  risks: z.array(z.string()),
  recommendation: z.enum(['strong_buy', 'buy', 'hold', 'avoid']),
  estimated_total_cost: z.number().nonnegative(),
  estimated_net_profit: z.number(),
});

function jsonError(msg: string, status: number) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return jsonError('Method not allowed', 405);

  // ── 1. JWT Authentication ──────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonError('Token obrigatório', 401);
  }
  const token = authHeader.replace('Bearer ', '');

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) {
    return jsonError('Token inválido', 401);
  }

  // ── 2. Validação de configuração ───────────────────────
  if (!GEMINI_API_KEY) {
    return jsonError('GEMINI_API_KEY não configurado', 500);
  }

  // ── 3. Parse body ──────────────────────────────────────
  let opportunityId: string;
  try {
    const body = await req.json() as { opportunityId?: string };
    opportunityId = body.opportunityId ?? '';
    if (!opportunityId) return jsonError('opportunityId obrigatório', 400);
  } catch {
    return jsonError('JSON inválido', 400);
  }

  // ── 4. Fetch opportunity ───────────────────────────────
  const { data: opp, error: fetchErr } = await supabaseAdmin
    .from('opportunities')
    .select('*')
    .eq('id', opportunityId)
    .single();

  if (fetchErr || !opp) return jsonError('Oportunidade não encontrada', 404);

  // ── 5. Cache: pular Gemini se já analisado ─────────────
  let score = Number(opp.score) || 0;
  let analysisText = (opp.ai_analysis as string) ?? '';

  if (!analysisText?.trim() || score <= 0) {
    const prompt = `Analise esta oportunidade de leilão. Retorne APENAS um JSON válido, sem markdown, com as chaves: score (0-100), summary (string, máx 200 palavras), risks (array de strings), recommendation ("strong_buy"|"buy"|"hold"|"avoid"), estimated_total_cost (number), estimated_net_profit (number).

Categoria: ${opp.category}
Lance atual: R$ ${Number(opp.current_bid).toLocaleString('pt-BR')}
Valor de mercado: R$ ${Number(opp.market_value).toLocaleString('pt-BR')}
Localização: ${opp.location}, ${opp.state}
${opp.risk_notes ? `Riscos conhecidos: ${opp.risk_notes}` : ''}

Regras: score>=85="strong_buy", 70-84="buy", 50-69="hold", <50="avoid". Seja conservador.`;

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
        return jsonError(`Gemini error: ${t}`, 502);
      }

      const geminiData = await geminiRes.json();
      const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const cleaned = text.replace(/```json\n?|```\n?/g, '').trim();

      // ── Validação Zod da resposta da IA ─────────────────
      const validation = AIResponseSchema.safeParse(JSON.parse(cleaned));
      if (!validation.success) {
        console.error('[run-ai-analysis] AI response validation failed:', validation.error.flatten());
        return jsonError('AI response inválida — estrutura inesperada', 502);
      }

      const analysis = validation.data;
      score = analysis.score;
      analysisText = [
        analysis.summary,
        analysis.risks?.length ? `Riscos: ${analysis.risks.join('; ')}` : '',
        analysis.recommendation ? `Recomendação: ${analysis.recommendation}` : '',
        analysis.estimated_total_cost != null
          ? `Custo total estimado: R$ ${analysis.estimated_total_cost.toLocaleString('pt-BR')}`
          : '',
        analysis.estimated_net_profit != null
          ? `Lucro líquido estimado: R$ ${analysis.estimated_net_profit.toLocaleString('pt-BR')}`
          : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      const { error: updateErr } = await supabaseAdmin
        .from('opportunities')
        .update({ score, ai_analysis: analysisText, updated_at: new Date().toISOString() })
        .eq('id', opportunityId);

      if (updateErr) return jsonError(updateErr.message, 500);
    } catch (e) {
      return jsonError(String(e), 500);
    }
  }

  // ── 6. Alert engine (com paginação) ───────────────────
  const oppCategory = (opp.category as string) ?? '';
  const oppState = ((opp.state as string) ?? '').toUpperCase();
  const PAGE = 100;
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data: rules, error: rulesErr } = await supabaseAdmin
      .from('alert_rules')
      .select('id, user_id, min_score, categories, states')
      .eq('is_active', true)
      .range(from, from + PAGE - 1);

    if (rulesErr || !rules?.length) break;
    hasMore = rules.length === PAGE;
    from += PAGE;

    for (const rule of rules) {
      const minScore = Number(rule.min_score) || 0;
      if (score < minScore) continue;

      const categories = (rule.categories as string[]) ?? [];
      if (categories.length > 0 && !categories.includes(oppCategory)) continue;

      const states = (rule.states as string[]) ?? [];
      if (states.length > 0 && !states.some((s: string) => oppState === String(s).toUpperCase())) continue;

      const { count } = await supabaseAdmin
        .from('alerts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', rule.user_id)
        .eq('opportunity_id', opportunityId)
        .eq('channel', 'in_app');

      if (count && count > 0) continue;

      await supabaseAdmin.from('alerts').insert({
        user_id: rule.user_id,
        opportunity_id: opportunityId,
        channel: 'in_app',
      });
    }
  }

  return new Response(JSON.stringify({ success: true, score }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
