# ARCHITECTURE.md — Garimpo IA™

## Decisões de Arquitetura

### ADR-001: React + Vite (sem Next.js)
**Decisão:** SPA com React 19 + Vite 6, sem meta-framework.
**Motivo:** O produto é um dashboard B2C que não precisa de SSR para SEO (o conteúdo é atrás de login). Vite oferece DX superior e build mais rápido. Se SEO se tornar crítico para landing pages, migraremos apenas as páginas públicas para Next.js.

### ADR-002: Supabase como backend completo
**Decisão:** Supabase para auth, database, realtime, e storage.
**Motivo:** Operação 100% cloud sem servidor próprio. Free tier generoso para MVP. RLS (Row Level Security) para segurança a nível de banco. Realtime para alertas de novas oportunidades.

### ADR-003: CSS Variables como SSOT de cores
**Decisão:** Todas as cores definidas em `src/styles/theme.css` via CSS custom properties, mapeadas no `tailwind.config.ts`.
**Motivo:** Permite tema dark/light sem duplicar código. Garante consistência visual. Facilita auditoria (grep por hex = violação).

### ADR-004: Context API (sem Zustand/Redux)
**Decisão:** Usar React Context API para estado global.
**Motivo:** O estado global é limitado (auth + theme + toasts). Não justifica dependência adicional. Se a complexidade crescer, Zustand será a escolha.

### ADR-005: Gemini 2.5 Pro para análise de IA
**Decisão:** Google Gemini como motor de análise de oportunidades.
**Motivo:** Melhor custo-benefício para análise financeira em português. Context window grande para incluir dados completos do lote. Suporte nativo a JSON structured output.

### ADR-006: Stripe para pagamentos
**Decisão:** Stripe para gestão de assinaturas.
**Motivo:** Checkout pré-construído, webhooks robustos, suporte a BRL. MercadoPago como fallback futuro para Pix.

### ADR-007: shadcn/ui pattern (sem instalar shadcn)
**Decisão:** Seguir o padrão shadcn/ui (CVA + Radix + cn()) sem usar o CLI.
**Motivo:** Controle total sobre os componentes. Mesma arquitetura, sem lock-in. Componentes nunca são modificados — apenas estendidos via variants.

## Schema do Banco (Supabase/Postgres)

```sql
-- Tabelas principais
profiles              -- Perfis de usuário (extends auth.users)
opportunities         -- Oportunidades de leilão
alerts                -- Alertas enviados
auction_sources       -- Fontes de leilão monitoradas
subscriptions         -- Assinaturas ativas
ai_analyses           -- Cache de análises da IA
user_favorites        -- Oportunidades favoritadas
user_searches         -- Histórico de buscas
```

## Fluxo de Dados

```
Leilão (web) → Scraper (n8n) → Supabase → Gemini AI → Score
                                    ↓
                              Assinante ← Push/WhatsApp/Email
                                    ↓
                              Dashboard ← Realtime updates
```
