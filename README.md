# GARIMPO IA™

**O Bloomberg Terminal dos Leilões Brasileiros.**

Plataforma SaaS de inteligência em ativos físicos. Robô minerador 24/7 com análise de IA e scoring de oportunidades em leilões brasileiros.

> *"Ouro nas Trevas — Inteligência que Trabalha Enquanto Você Dorme"*

---

## Stack

| Categoria | Tecnologia |
|-----------|-----------|
| Framework UI | React 19 |
| Linguagem | TypeScript 5.8 |
| Build | Vite 6 |
| Estilização | Tailwind CSS + CSS Variables |
| Componentes | shadcn/ui pattern (CVA + Radix) |
| State | Context API |
| Auth | Supabase Auth |
| Database | Supabase (Postgres + RLS + Realtime) |
| IA | Google Gemini 2.5 Pro |
| Pagamentos | Stripe |
| Animações | Framer Motion |
| Roteamento | React Router DOM |
| Deploy | Vercel |

## Início Rápido

```bash
# 1. Clone
git clone https://github.com/alsham-commerce/garimpo-ia.git
cd garimpo-ia

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env.local
# Preencha as variáveis no .env.local

# 4. Rode em desenvolvimento
npm run dev

# 5. Acesse
open http://localhost:5173
```

## Estrutura

```
src/
├── app/routes/          # Páginas (file = route)
├── components/
│   ├── ui/              # shadcn/ui (NUNCA modificar)
│   ├── layout/          # Header, Footer, Sidebar
│   ├── ai/              # Componentes de IA
│   └── cards/           # Cards de domínio
├── hooks/               # Custom hooks
├── lib/                 # supabaseClient.ts (SSOT), utils, env
├── contexts/            # AppContext, ToastContext
├── services/            # Integrações (Gemini AI, Stripe)
├── styles/              # theme.css (SSOT de tokens), globals.css
├── types/               # TypeScript types
└── assets/              # Imagens, SVGs
```

## Padrão ALSHAM — 6 Leis Sagradas

Este projeto segue o **Padrão ALSHAM** de qualidade de código:

1. **ZERO CORES HARDCODED** — Tudo via CSS variables em `theme.css`
2. **COMPONENTES UI PADRONIZADOS** — shadcn/ui, nunca modificar
3. **DADOS 100% REAIS** — Zero mock/fake/placeholder
4. **TEMAS DINÂMICOS** — Dark/Light via `data-theme`
5. **ESTADOS UI COMPLETOS** — Loading + Error + Empty em toda página
6. **ESTRUTURA CANÔNICA** — SSOT para tudo, sem duplicações

## Validação

```bash
# Auditoria completa (roda no pre-commit)
npm run audit:full

# Auditorias individuais
npm run audit:colors     # Zero hex hardcoded
npm run audit:mocks      # Zero dados falsos
npm run audit:tailwind   # Zero classes Tailwind hardcoded
```

## Governança AI

Instruções para AI assistants estão sincronizadas em:
- `CLAUDE.md` — Claude / Claude Code
- `.cursorrules` — Cursor AI
- `.github/copilot-instructions.md` — GitHub Copilot

Todos apontam para as mesmas 6 Leis Sagradas.

## Documentação

- `docs/GarimpoIA_Brandbook_v2.html` — Brandbook visual completo
- `docs/GarimpoIA_MarketBriefing.docx` — Market briefing com análise de mercado
- `ARCHITECTURE.md` — Decisões de arquitetura

---

**GARIMPO IA™** · ALSHAM Commerce Ltda. · Aragarças, Goiás · 2026
