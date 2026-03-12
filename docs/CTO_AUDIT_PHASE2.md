# GARIMPO IA™ — CTO Audit & Phase 2 Plan

**Role:** CTO / Senior Engineer  
**Date:** March 2026  
**Scope:** Post–Priority 1 repository audit, security, UX flow, Phase 2 roadmap, and next 10 tasks.

---

# STEP 1 — REPOSITORY RE-SCAN (Project Map)

## Pages & routes

| Path | File | Purpose |
|------|------|--------|
| `/` | `src/app/routes/FeedPage.tsx` | Feed de oportunidades: filtros por categoria, useOpportunities, loading/error/empty, grid de OpportunityCard; onViewAnalysis → navigate(`/opportunity/${id}`), onSubscribe → navigate(`/pricing`). |
| `/opportunity/:id` | `src/app/routes/OpportunityDetailPage.tsx` | Detalhe: useOpportunity(id), dados básicos + score + paywall (Análise IA + link leilão só para assinantes). |
| `/login` | `src/app/routes/LoginPage.tsx` | Form signIn/signUp, redirect com returnTo, toasts. |
| `/pricing` | `src/app/routes/PricingPage.tsx` | Planos Free/Explorer/Hunter/Miner, redirectToCheckout(planId), success/cancel query handling. |

**Router:** `App.tsx` — BrowserRouter, Routes para `/`, `/opportunity/:id`, `/login`, `/pricing`. Comentadas: `/alerts`, `/analytics`, `/profile`.

---

## Components

| Path | Purpose |
|------|--------|
| `src/components/layout/Header.tsx` | Logo (Link), nav (Feed, Alertas, Analytics), theme toggle, Entrar/User+Bell; React Router Link. |
| `src/components/cards/OpportunityCard.tsx` | Card com score, categoria, dados, CTA Ver Análise / Assinar; paywall overlay; onViewAnalysis, onSubscribe. |
| `src/components/ui/Button.tsx` | CVA (primary, secondary, danger, ghost, outline; sm, md, lg, icon); Radix Slot (asChild). |
| `src/components/ui/Badge.tsx` | CVA (high, medium, low, ai, new). |
| `src/components/ui/Input.tsx` | Input base (theme tokens, focus ring). |
| `src/components/ui/Skeleton.tsx` | Pulse + OpportunityCardSkeleton. |
| `src/components/ui/StateDisplay.tsx` | ErrorState, EmptyState. |
| `src/components/ai/` | (vazio) |

---

## Hooks

| File | Purpose |
|------|--------|
| `src/hooks/useOpportunities.ts` | Lista oportunidades (Supabase), filtros, paginação, loading/error/empty. |
| `src/hooks/useOpportunity.ts` | Uma oportunidade por id; loading, error, not-found. |

---

## Services

| File | Purpose |
|------|--------|
| `src/services/aiAnalysis.ts` | analyzeOpportunity(request) → Gemini 2.5 Pro → AIAnalysisResponse; não chamado por nenhuma UI; sem cache em DB. |
| `src/services/stripeCheckout.ts` | redirectToCheckout(planId), envia JWT; isCheckoutConfigured(). |

---

## Contexts

| File | Purpose |
|------|--------|
| `src/contexts/AppContext.tsx` | Session, profile, signIn/signUp/signOut, theme, toggleTheme; fetch profile; lida com supabase null. |
| `src/contexts/ToastContext.tsx` | toasts in-memory, addToast, removeToast. |

---

## Lib & types

| File | Purpose |
|------|--------|
| `src/lib/supabaseClient.ts` | Cliente único Supabase; null se env ausente. |
| `src/lib/env.ts` | env opcional (Zod); isSupabaseConfigured(); STRIPE_CHECKOUT_API_URL. |
| `src/lib/utils.ts` | cn, formatBRL, formatPercent, formatTimeRemaining, getCategoryLabel, getCategoryEmoji. |
| `src/types/index.ts` | Opportunity, UserProfile, Alert, AsyncState, PaginatedResponse, FilterOptions, AIAnalysis*, ToastMessage, enums. |

---

## Database schema (Supabase)

| Tabela | Uso |
|--------|-----|
| `profiles` | id, email, full_name, avatar_url, subscription_tier, subscription_expires_at, preferred_*, notification_*, created_at, updated_at. RLS: select/update own. Trigger: handle_new_user. |
| `opportunities` | id, title, category, score, location, state, year, current_bid, market_value, profit_potential, roi_percentage, auction_*, closes_at, risk_*, liquidity, ai_analysis (text), images, is_featured, created_at, updated_at. RLS: select true. Índices: score, category, state, closes_at, created_at. |
| `alerts` | user_id, opportunity_id, channel, sent_at, read_at. RLS: select/update own. |
| `auction_sources` | name, url, scrape_frequency_minutes, last_scraped_at, is_active. RLS: select true. |

**Ausente:** tabela de regras de alerta (alert_rules); ai_analysis é text (pode ser JSONB para estrutura).

---

## Edge functions

| Function | Purpose |
|----------|--------|
| `supabase/functions/create-checkout-session/index.ts` | POST { planId }; opcional Authorization Bearer (JWT); cria Stripe Checkout Session com metadata.user_id e subscription_data.metadata.user_id; retorna { url }. |
| `supabase/functions/stripe-webhook/index.ts` | Valida stripe-signature (HMAC SHA256); checkout.session.completed e customer.subscription.updated/deleted → atualiza profiles.subscription_tier e subscription_expires_at. |

---

## Environment variables

| Variável | Onde | Uso |
|----------|------|-----|
| VITE_SUPABASE_URL | Frontend | Cliente Supabase |
| VITE_SUPABASE_ANON_KEY | Frontend | Cliente Supabase |
| VITE_GEMINI_API_KEY | Frontend | aiAnalysis (não usado ainda em fluxo) |
| VITE_STRIPE_PUBLIC_KEY | Frontend | (não usado no código atual) |
| VITE_STRIPE_CHECKOUT_API_URL | Frontend | stripeCheckout redirect |
| VITE_APP_URL | Frontend | (opcional) |
| STRIPE_SECRET_KEY, STRIPE_PRICE_* | Edge | create-checkout-session |
| STRIPE_WEBHOOK_SECRET | Edge | stripe-webhook |
| APP_URL | Edge | success/cancel URLs |
| SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY | Edge | Supabase client |

---

## Dependencies (package.json)

- **Usados:** react, react-dom, react-router-dom, @supabase/supabase-js, @google/generative-ai, framer-motion, lucide-react, clsx, tailwind-merge, class-variance-authority, zod, date-fns, @radix-ui/react-slot.
- **Não usados no src:** @stripe/stripe-js, recharts, @radix-ui/react-dialog, @radix-ui/react-dropdown-menu, @radix-ui/react-toast, @radix-ui/react-tooltip.

---

# STEP 2 — VALIDATE PRIORITY 1 IMPLEMENTATION

| Feature | Status | Notes |
|---------|--------|--------|
| OpportunityDetailPage | ✔ Correctly implemented | useParams, useOpportunity(id), paywall (AnalysisBlock), ErrorState, skeleton, navigate back/pricing. |
| useOpportunity hook | ✔ Correctly implemented | Fetch by id, loading/error/not-found, refetch. |
| React Router navigation | ✔ Correctly implemented | Link no Header; useNavigate no Feed e Detail; rotas em App. |
| LoginPage | ✔ Correctly implemented | signIn/signUp, toasts, returnTo, redirect. |
| PricingPage | ✔ Correctly implemented | Planos, redirectToCheckout, success/cancel toasts. |
| Stripe checkout integration | ✔ Correctly implemented | stripeCheckout.ts chama API com JWT, redirect para url. |
| Edge Function checkout | ✔ Correctly implemented | Cria sessão, metadata user_id, subscription_data.metadata. |
| Stripe webhook → profiles | ✔ Correctly implemented | Verificação de assinatura; atualiza subscription_tier e subscription_expires_at. |
| Paywall logic | ✔ Correctly implemented | Detail: isSubscriber → análise + link; Feed: card overlay. |

**Nenhum item incorreto ou quebrado.** Único ponto: profile não é revalidado automaticamente após checkout (usuário pode precisar recarregar ou refazer login para ver tier atualizado); recomendado revalidar profile na PricingPage quando ?success=1.

---

# STEP 3 — SECURITY AND ARCHITECTURE CHECK

| Item | Status | Fix / note |
|------|--------|------------|
| Stripe webhook verification | ✔ | HMAC SHA256 com timestamp.body; formato t=, v1= parseado. |
| JWT when calling Edge | ✔ | stripeCheckout envia Authorization: Bearer session.access_token. |
| Supabase RLS | ✔ | profiles e alerts: own row only; opportunities e auction_sources: read-only público. |
| Env usage | ✔ | Secrets só em Edge (STRIPE_SECRET_KEY, SERVICE_ROLE); frontend só VITE_*. |
| Secret leakage | ✔ | Nenhum secret em frontend; .env.example sem valores reais. |
| Webhook idempotency | ⚠ | Múltiplos eventos podem atualizar o mesmo profile; último evento vence. Para idempotência forte: checar subscription.id e só atualizar se evento mais recente (timestamp). Opcional. |
| Error handling | ⚠ | aiAnalysis não tem try/catch de rede nem retry; Gemini pode falhar ou devolver não-JSON. Recomendado: try/catch, validação Zod do JSON, retry com backoff. |
| AI request failures | ⚠ | Nenhum pipeline chama analyzeOpportunity hoje; quando chamar (Edge ou job), tratar rate limit e timeout. |

**Ajuste recomendado (opcional):** Na PricingPage, quando ?success=1, chamar refetch do profile (ex.: revalidar session ou atualizar contexto) para desbloquear UI sem reload.

---

# STEP 4 — UX FLOW VALIDATION

| Step | Status | Note |
|------|--------|------|
| Feed | ✔ | Lista oportunidades; filtros; cards com CTA. |
| Click "Ver Análise" | ✔ | navigate(`/opportunity/${id}`). |
| Opportunity page | ✔ | Dados + score; assinante vê análise e link. |
| Paywall (não assinante) | ✔ | Blur + CTA "Ver planos — Assinar". |
| Click Assinar | ✔ | navigate(`/pricing`). |
| Pricing | ✔ | Escolhe plano → redirectToCheckout(planId). |
| Stripe checkout | ✔ | Redirect para Stripe; success/cancel URLs. |
| Webhook | ✔ | Atualiza profiles.subscription_tier. |
| Profile subscription update | ✔ | Dados no DB; frontend lê profile do AppContext. |
| Access unlocked | ⚠ | Desbloqueio depende de o AppContext ter o profile atualizado (após checkout o usuário volta em /pricing?success=1; se não revalidar session/profile, pode continuar vendo como free até reload ou novo login). |

**Quebra possível:** Profile não revalidado após checkout. **Fix:** Em PricingPage ao detectar ?success=1, além do toast, chamar algo como `supabase.auth.getSession()` e refetch profile no AppContext (ou expor refetchProfile no contexto).

---

# STEP 5 — PERFORMANCE IMPROVEMENTS

| Melhoria | Descrição |
|----------|-----------|
| Cache AI em DB | Sempre que analyzeOpportunity rodar (pipeline ou on-demand), persistir resultado em `opportunities.ai_analysis` (text ou JSONB) para não chamar Gemini de novo para o mesmo lote. |
| Evitar chamadas repetidas Gemini | No pipeline ou na UI, checar se `opportunity.ai_analysis` já existe antes de chamar analyzeOpportunity. |
| Otimizar queries Supabase | useOpportunities já usa índices (score, category, etc.); possível adicionar .limit() explícito e paginação “load more” para listas grandes. |
| Remover dependências não usadas | recharts, @radix-ui (exceto Slot), @stripe/stripe-js (se não for usar Stripe Elements) para reduzir bundle. |

---

# STEP 6 — CLEANUP TASKS

| Item | Ação |
|------|------|
| recharts | Não importado em nenhum arquivo. **Remover** do package.json ou planejar uso (ex.: Analytics). |
| @radix-ui/react-dialog, -dropdown-menu, -toast, -tooltip | Não importados (apenas Slot). **Remover** ou manter para Phase 2 (modais, dropdowns). |
| @stripe/stripe-js | Não importado. **Manter** se for usar Stripe Elements (ex.: gerenciar assinatura); senão remover. |
| Dead code | Nenhum arquivo órfão detectado. |
| Unused imports | Verificar com lint; não identificados em bloco. |

---

# STEP 7 — NEXT PHASE (PHASE 2) DEVELOPMENT PLAN

**Objetivo:** Lançar publicamente e conquistar primeiros pagantes; suportar oportunidades reais, pipeline de score com IA, alertas básicos e uso estável em produção.

**Prioridades Phase 2:**

1. **Dados reais** — Ingestão de oportunidades (manual ou script) + pipeline de IA que preenche score e ai_analysis.
2. **Cache de análise** — Persistir resultado da IA em `opportunities.ai_analysis` e usar como fonte de verdade na UI.
3. **Alertas** — Tabela alert_rules (user, min_score, categories, states); job ou trigger que gera alertas e notifica (email, in-app).
4. **Admin** — Tela simples para inserir/editar oportunidades (protegida por role ou secret).
5. **Estabilidade** — Tratamento de erro e retry na IA; revalidação de profile pós-checkout; monitoramento básico (logs/errors).

---

# STEP 8 — DATABASE IMPROVEMENTS

**Sugestões:**

1. **alert_rules** — Nova tabela para regras de alerta por usuário (min_score, categories[], states[]).
2. **ai_analysis** — Manter como text para flexibilidade (JSON stringificado); opcional migrar para JSONB e indexar campos se precisar filtrar por score/recommendation.
3. **subscriptions** — Opcional: tabela para histórico de assinaturas; hoje Stripe + profiles é suficiente para MVP.
4. **Índices** — Já existem os principais; para alertas por score/category/state, índices atuais cobrem.

**SQL sugerido (alert_rules):** Incluído no bloco de código gerado abaixo.

---

# STEP 9 — CODE GENERATION (Phase 2)

Será gerado em seguida:

- **SQL:** alert_rules table + policy RLS.
- **AI pipeline:** Serviço/Edge Function que, dado opportunity_id, chama analyzeOpportunity e atualiza opportunities (score, ai_analysis).
- **Hooks/types:** useAlertRules, AlertRule type; uso da tabela alert_rules.
- **AlertsPage (básica):** Listar regras e alertas; formulário simples para criar regra (min_score, category, state).
- **Admin page:** Formulário para inserir uma oportunidade (campos mínimos); rota protegida (ex.: query param ou role).

---

# STEP 10 — NEXT 10 ENGINEERING TASKS

1. **Revalidar profile após checkout** — Em PricingPage quando ?success=1, chamar refetch do profile (expor refetchProfile no AppContext e chamar aqui). **Arquivos:** AppContext.tsx, PricingPage.tsx. **Resultado:** Assinante vê acesso desbloqueado sem reload.
2. **Adicionar tabela alert_rules** — Executar SQL no Supabase (ver seção Code abaixo). **Arquivos:** supabase/migrations ou schema. **Resultado:** Suporte a regras de alerta por usuário.
3. **Tipos e hook useAlertRules** — Criar tipo AlertRule em types/index.ts; criar useAlertRules (fetch/insert/delete). **Arquivos:** src/types/index.ts, src/hooks/useAlertRules.ts. **Resultado:** Frontend pode listar e criar regras.
4. **AlertsPage (lista + formulário)** — Página /alerts: listar alert_rules do usuário e alertas recentes; form para nova regra (min_score, category, state). **Arquivos:** src/app/routes/AlertsPage.tsx, App.tsx (rota). **Resultado:** Usuário define alertas.
5. **AI pipeline (salvar no DB)** — Função que recebe opportunity_id, busca opportunity, chama analyzeOpportunity, atualiza opportunities (score, ai_analysis). **Arquivos:** supabase/functions/run-ai-analysis/index.ts ou src/services/aiPipeline.ts chamado por Edge. **Resultado:** Novas oportunidades podem receber score e análise persistidos.
6. **Cache de análise na UI** — Na OpportunityDetailPage, se ai_analysis vazio e usuário assinante, opcionalmente disparar análise (ou exibir “Solicitar análise”); caso contrário apenas exibir ai_analysis do DB. **Arquivos:** OpportunityDetailPage.tsx (ou hook). **Resultado:** Evita chamadas Gemini desnecessárias quando já existe análise.
7. **Admin: página de inserção de oportunidade** — Rota /admin/opportunities (ou /admin) com form (title, category, location, state, current_bid, market_value, auction_source, auction_url, closes_at, etc.). Proteção: checar session e role ou token. **Arquivos:** src/app/routes/AdminOpportunityPage.tsx, App.tsx. **Resultado:** Inserção manual de oportunidades.
8. **Edge Function run-ai-analysis** — Invocável com body { opportunityId }; lê opportunity, chama Gemini via fetch ao serviço ou Deno-compatible Gemini client; atualiza opportunities. **Arquivos:** supabase/functions/run-ai-analysis/index.ts. **Resultado:** Pipeline acionável após inserção (manual ou por scraper).
9. **Tratamento de erro e retry em aiAnalysis** — try/catch, Zod para validar resposta Gemini, retry com backoff. **Arquivos:** src/services/aiAnalysis.ts. **Resultado:** Menos falhas silenciosas e respostas inválidas.
10. **Remover dependências não usadas** — Remover recharts (ou deixar para Analytics); remover Radix não usados (dialog, dropdown, toast, tooltip) se não forem usados em Phase 2. **Arquivos:** package.json, npm install. **Resultado:** Bundle menor.

---

*Fim do documento de auditoria. O código gerado (SQL, hooks, AlertsPage, admin, AI pipeline) segue na implementação abaixo.*
