# GARIMPO IA™ — Apresentação do Sistema para Engenharia

**Documento de handoff para Engenheiro de Sistemas (SaaS)**  
Versão 1.0 · Março 2026 · ALSHAM Commerce Ltda.

---

## 1. Visão geral

| Item | Descrição |
|------|-----------|
| **Produto** | GARIMPO IA™ — O Bloomberg Terminal dos Leilões Brasileiros |
| **Tipo** | Plataforma SaaS B2C de inteligência em ativos físicos |
| **Proposta de valor** | Robô minerador 24/7 que monitora 50+ fontes de leilão, aplica análise de IA (Gemini) e scoring 0–100 para surfacear oportunidades. Visitantes veem cards com CTA de assinatura; assinantes desbloqueiam análise completa. |
| **Deploy** | Vercel (SPA). App sobe mesmo sem Supabase/Gemini/Stripe configurados (env opcional para MVP). |

---

## 2. O que o sistema faz (funcionalidades)

- **Feed de oportunidades** — Listagem paginada com filtros por categoria (Veículos, Imóveis, Agro, Maquinário), score, ROI e estado. Estados de UI: loading (skeleton), erro (retry), vazio (mensagem + “Limpar filtros”).
- **Autenticação** — Supabase Auth (login, cadastro, logout). Perfil em `profiles` (tier de assinatura, preferências, notificações).
- **Tema** — Dark/Light via `data-theme` + toggle no header; persistido em `localStorage` (key: `garimpo-ia-theme`).
- **Análise por IA** — Serviço `aiAnalysis.ts` com Google Gemini 2.5 Pro: recebe dados do lote, retorna score, resumo, riscos, recomendação (strong_buy | buy | hold | avoid), custo e lucro estimado. Exige `VITE_GEMINI_API_KEY` apenas quando a feature é usada.
- **Planos (regra de negócio)** — Free, Explorer (R$ 47), Hunter (R$ 97), Miner (R$ 197). Assinantes veem análise completa; visitantes veem overlay + CTA.
- **Qualidade de código** — 6 “Leis” ALSHAM: zero cores hardcoded, UI padronizada (shadcn), dados reais (sem mock), temas dinâmicos, estados completos (loading/error/empty), estrutura canônica (SSOT). Auditorias pré-commit: cores, mocks, Tailwind, build.

---

## 3. Stack técnica

| Camada | Tecnologia |
|--------|------------|
| UI | React 19, TypeScript 5.8 |
| Build | Vite 6 |
| Estilos | Tailwind CSS, CSS Variables (`theme.css`), CVA, Radix (Dialog, Dropdown, Toast, Tooltip, Slot) |
| Estado global | React Context API (AppContext, ToastContext) |
| Roteamento | React Router DOM 7 |
| Backend / Auth / DB | Supabase (Auth, Postgres, RLS, Realtime) |
| IA | Google Gemini 2.5 Pro (`@google/generative-ai`) |
| Pagamentos | Stripe (`@stripe/stripe-js`) |
| Animações | Framer Motion |
| Deploy | Vercel (SPA, rewrites para `index.html`, headers de segurança, CSP) |
| Qualidade | ESLint 9, Prettier, Vitest, Testing Library, Husky + lint-staged |

---

## 4. Arquitetura (resumo)

- **SPA** — React + Vite, sem SSR. Conteúdo principal atrás de uso/assinatura; SEO não crítico para MVP.
- **Backend** — Supabase como único backend (auth, DB, realtime). RLS em todas as tabelas.
- **Cores** — SSOT em `src/styles/theme.css`; Tailwind estendido no `tailwind.config.ts` para usar variáveis.
- **Estado** — Context API; sem Redux/Zustand no escopo atual.
- **Fluxo de dados (conceitual)**  
  Leilões (web) → Scraper (n8n, futuro) → Supabase → Gemini AI (score) → Assinante (push/WhatsApp/email) → Dashboard com Realtime.

Decisões detalhadas em `ARCHITECTURE.md` (ADR-001 a ADR-007).

---

## 5. Estrutura do projeto (arquivos)

```
garimpo-ia/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── eslint.config.js
├── .prettierrc
├── .env.example
├── .gitignore
├── vercel.json
├── CLAUDE.md                 # Regras para IA (6 Leis)
├── ARCHITECTURE.md           # ADRs e decisões
├── README.md
│
├── .github/
│   └── workflows/
│       └── ci.yml
│   └── copilot-instructions.md
│
├── .husky/                   # Hooks (pre-commit: lint-staged + audit:full)
│
├── docs/
│   ├── APRESENTACAO_SISTEMA_ENGENHARIA.md  # Este documento
│   ├── GarimpoIA_Brandbook_v2.html
│   └── GarimpoIA_Brandbook_v2_10de10.html
│
├── supabase/
│   └── schema.sql            # Schema Postgres (profiles, opportunities, alerts, auction_sources, RLS, triggers)
│
└── src/
    ├── main.tsx              # Bootstrap: carrega App ou tela de erro se falha no load
    ├── App.tsx               # Router, providers, layout (Header + main)
    ├── vite-env.d.ts
    │
    ├── app/
    │   └── routes/
    │       └── FeedPage.tsx  # Página principal (Oportunidades)
    │
    ├── components/
    │   ├── layout/
    │   │   └── Header.tsx    # Logo, nav (Feed, Alertas, Analytics), tema, Entrar
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Skeleton.tsx  # OpportunityCardSkeleton
    │   │   └── StateDisplay.tsx  # ErrorState, EmptyState
    │   └── cards/
    │       └── OpportunityCard.tsx
    │
    ├── contexts/
    │   ├── AppContext.tsx    # Auth, theme, profile, signIn/signUp/signOut
    │   └── ToastContext.tsx
    │
    ├── hooks/
    │   └── useOpportunities.ts  # Lista oportunidades (Supabase), filtros, paginação, estados
    │
    ├── lib/
    │   ├── supabaseClient.ts # SSOT Supabase (null se env não configurado)
    │   ├── env.ts            # Variáveis de ambiente (opcionais), isSupabaseConfigured()
    │   └── utils.ts          # cn()
    │
    ├── services/
    │   └── aiAnalysis.ts      # Gemini: analyzeOpportunity(request) → AIAnalysisResponse
    │
    ├── styles/
    │   ├── theme.css         # SSOT cores e tokens (--background-deep, --foreground, etc.)
    │   └── globals.css
    │
    └── types/
        └── index.ts          # Opportunity, UserProfile, Alert, AsyncState, PaginatedResponse, FilterOptions, AIAnalysis*, ToastMessage, etc.
```

**Contagem aproximada de arquivos de código (src/):**  
~20 arquivos (ts/tsx/css) principais; sem contar duplicatas de path (ex.: barras invertidas).

---

## 6. Páginas e rotas

| Status | Rota | Componente | Descrição |
|--------|------|------------|-----------|
| ✅ Implementada | `/` | `FeedPage` | Feed de oportunidades: filtros por categoria, loading/error/empty, cards |
| 🔲 Planejada | `/opportunity/:id` | `OpportunityDetailPage` | Detalhe da oportunidade (análise IA desbloqueada para assinante) |
| 🔲 Planejada | `/alerts` | `AlertsPage` | Alertas enviados (WhatsApp, email, push, in-app) |
| 🔲 Planejada | `/analytics` | `AnalyticsPage` | Analytics do produto |
| 🔲 Planejada | `/profile` | `ProfilePage` | Perfil do usuário |
| 🔲 Planejada | `/login` | `LoginPage` | Login (hoje só botão “Entrar” no header) |
| 🔲 Planejada | `/pricing` | `PricingPage` | Planos e checkout Stripe |

**Total:** **1 página implementada** (Feed); **6 rotas planejadas** (comentadas em `App.tsx`).

---

## 7. Banco de dados (Supabase / Postgres)

Schema em `supabase/schema.sql`. Principais tabelas:

| Tabela | Uso |
|--------|-----|
| `profiles` | Estende `auth.users`: email, full_name, avatar_url, subscription_tier, subscription_expires_at, preferred_categories, preferred_states, notificações. RLS: usuário lê/atualiza só o próprio perfil. Trigger: cria profile no signup. |
| `opportunities` | Oportunidades de leilão: title, category, score, location, state, current_bid, market_value, profit_potential (generated), roi_percentage (generated), auction_source, auction_url, closes_at, risk_level, liquidity, ai_analysis, images, is_featured. RLS: leitura pública. Índices: score, category, state, closes_at, created_at. |
| `alerts` | Alertas enviados: user_id, opportunity_id, channel (whatsapp, email, push, in_app), sent_at, read_at. RLS: usuário lê/atualiza só os próprios. |
| `auction_sources` | Fontes de leilão: name, url, scrape_frequency_minutes, last_scraped_at, is_active. RLS: leitura pública. |

Triggers: `handle_new_user` (cria profile), `update_updated_at` (profiles e opportunities).

---

## 8. Integrações externas

| Serviço | Uso | Variável de ambiente |
|---------|-----|----------------------|
| **Supabase** | Auth, Postgres, Realtime. Cliente em `lib/supabaseClient.ts`; null se URL/key vazios. | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| **Google Gemini** | Análise de oportunidades (score, resumo, riscos, recomendação). Serviço `services/aiAnalysis.ts`; exige key só ao chamar. | `VITE_GEMINI_API_KEY` |
| **Stripe** | Pagamentos/assinaturas (checkout). Ainda não usado em tela. | `VITE_STRIPE_PUBLIC_KEY` |
| **Vercel** | Build (`npm run build`), output `dist`, SPA rewrites, headers (CSP, X-Frame-Options, etc.). | — |

Todas as variáveis são **opcionais** para o app subir; sem elas o app exibe feed vazio, auth desabilitado ou mensagem ao usar IA/Stripe.

---

## 9. Qualidade e governança

- **6 Leis ALSHAM** (CLAUDE.md): zero cores hardcoded, componentes UI padronizados, dados reais, temas dinâmicos, estados UI completos, estrutura canônica.
- **Pré-commit (Husky):** lint-staged (ESLint + Prettier em `src/**/*.{ts,tsx}` e CSS) + `npm run audit:full` (audit:colors, audit:mocks, audit:tailwind, build). No Windows o audit pode falhar por sintaxe shell; é possível usar `git commit --no-verify` se necessário.
- **CI:** `.github/workflows/ci.yml` (ajustar conforme repositório).
- **Tipografia (Brandbook):** Space Grotesk (títulos), Inter (UI), JetBrains Mono (valores financeiros). Paleta: fundos escuros, âmbar (ação), ciano (IA), verde (lucro), vermelho (risco).

---

## 10. Variáveis de ambiente e deploy

Exemplo em `.env.example`. Para produção (Vercel), configurar em **Settings → Environment Variables**:

| Variável | Obrigatória para | Descrição |
|----------|------------------|-----------|
| `VITE_SUPABASE_URL` | Auth e feed real | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Auth e feed real | Chave anon do Supabase |
| `VITE_GEMINI_API_KEY` | Análise por IA | API key do Google Gemini |
| `VITE_STRIPE_PUBLIC_KEY` | Checkout/assinaturas | Chave pública Stripe |
| `VITE_APP_URL` | Opcional | URL do app (ex.: https://garimpo-ia.vercel.app) |

Build: `npm run build` → `tsc -b && vite build`. Output: `dist/`. Framework: Vite (em `vercel.json`).

---

## 11. Resumo executivo para engenharia

- **O que está pronto:** SPA em produção (Vercel) com 1 página (Feed de oportunidades), header com navegação e tema, auth e feed integrados ao Supabase quando as env estão configuradas, análise por IA (Gemini) disponível quando a key está configurada, schema Postgres e RLS definidos, padrão de qualidade (6 Leis) e auditorias.
- **O que falta implementar:** 6 páginas (detalhe da oportunidade, alertas, analytics, perfil, login, pricing); fluxo de checkout Stripe; scraper/n8n para popular `opportunities`; notificações (WhatsApp, email, push).
- **Arquivos críticos:** `src/App.tsx` (rotas), `src/lib/supabaseClient.ts` (SSOT Supabase), `src/lib/env.ts` (env opcional), `src/contexts/AppContext.tsx` (auth/tema), `src/hooks/useOpportunities.ts` (feed), `src/services/aiAnalysis.ts` (Gemini), `supabase/schema.sql` (schema).

Este documento reflete o estado do repositório e do produto para uso em handoff e apresentação a engenharia de sistemas SaaS.
