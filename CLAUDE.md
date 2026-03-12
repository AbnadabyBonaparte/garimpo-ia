# CLAUDE.md — Instruções para Claude AI

## Projeto
**GARIMPO IA™** — O Bloomberg Terminal dos Leilões Brasileiros.
Plataforma SaaS de inteligência em ativos físicos por ALSHAM Commerce Ltda.

## Stack
React 19 · TypeScript 5.8 · Vite 6 · Tailwind CSS · shadcn/ui pattern · Supabase (Auth + Postgres + Realtime) · Google Gemini 2.5 Pro · Stripe · Framer Motion · React Router DOM · Vercel

## As 6 Leis Sagradas ALSHAM

Estas leis são INVIOLÁVEIS. Qualquer código que quebre uma lei deve ser rejeitado.

### LEI 1: ZERO CORES HARDCODED
- Toda cor vem de `src/styles/theme.css` via CSS variables.
- Nenhum hex (#fff, #000, etc.) aparece em .tsx ou .ts.
- No Tailwind, usar APENAS classes mapeadas para CSS vars (bg-background-deep, text-foreground, text-amber, etc.).
- NUNCA usar bg-white, bg-black, bg-gray-*, text-white, text-black, text-gray-*.
- Validação: `grep -rn "#[0-9a-fA-F]{3,8}" src/ --include="*.tsx" --include="*.ts" | grep -v theme.css` → DEVE ser vazio.

### LEI 2: COMPONENTES UI PADRONIZADOS
- Componentes base ficam em `src/components/ui/`.
- Seguem o padrão shadcn/ui com CVA (class-variance-authority).
- NUNCA modificar um componente base. Para customizar, use as variants do CVA ou crie um wrapper.
- Todos os componentes usam `cn()` de `src/lib/utils.ts`.

### LEI 3: DADOS 100% REAIS
- Zero mock, fake, placeholder, dummy, lorem em qualquer arquivo que não seja test.
- Toda query ao banco passa por `src/lib/supabaseClient.ts` (SSOT ÚNICO).
- Validação: `grep -rn "mock\|fake\|placeholder\|dummy\|lorem" src/ | grep -v test` → DEVE ser vazio.

### LEI 4: TEMAS DINÂMICOS
- Dark e Light themes via `data-theme` attribute no `<html>`.
- Toggle persiste em localStorage (key: `garimpo-ia-theme`).
- Gerenciado por `src/contexts/AppContext.tsx`.
- Todas as cores se adaptam automaticamente via CSS variables em theme.css.

### LEI 5: ESTADOS UI COMPLETOS
- TODA página que busca dados DEVE ter 3 estados:
  1. **Loading**: Skeleton components animados
  2. **Error**: Mensagem + botão "Tentar novamente"
  3. **Empty**: Mensagem amigável + ação sugerida
- Componentes de estado: `src/components/ui/Skeleton.tsx` e `src/components/ui/StateDisplay.tsx`.

### LEI 6: ESTRUTURA CANÔNICA
```
src/
├── app/routes/          # Páginas (file = route)
├── components/ui/       # shadcn/ui (NUNCA MODIFICAR)
├── components/layout/   # Header, Footer, Sidebar
├── components/ai/       # Componentes de IA
├── components/cards/    # Cards de domínio (OpportunityCard)
├── hooks/               # Custom hooks (useAuth, useOpportunities)
├── lib/                 # supabaseClient.ts (SSOT), utils.ts, env.ts
├── contexts/            # AppContext, ToastContext
├── services/            # Integrações externas (aiAnalysis.ts)
├── styles/              # theme.css (SSOT), globals.css
├── types/               # TypeScript types (index.ts)
└── assets/              # Imagens, SVGs
```

## Formato de Commit
```
<type>: <description>
- bullet 1
- bullet 2
BLOCO X - <Nome do Bloco> ✅
```

Types: feat, fix, refactor, style, docs, test, chore

## Validação Pré-Commit
```bash
npm run audit:full
```
Roda: audit:colors + audit:mocks + audit:tailwind + build

## Tipografia (Brandbook §04)
- **Space Grotesk**: Títulos, números de impacto. NUNCA para corpo de texto.
- **Inter**: Interface, parágrafos, labels, navegação.
- **JetBrains Mono**: Valores financeiros, scores, timestamps, código. NUNCA para texto corrido.

## Paleta (Brandbook §03)
- 60% fundos escuros (bg-deep, bg-surface)
- 30% cards/painéis (bg-surface-alt, borders)
- 10% acentos (amber, cyan, green)
- Âmbar = ação/riqueza, Ciano = IA/análise, Verde = lucro, Vermelho = risco

## Regras de Negócio
- Score de oportunidade: 0-100 (calculado por Gemini AI)
- Visitantes veem cards com overlay blur + CTA de assinatura
- Assinantes veem análise completa desbloqueada
- Planos: Free, Explorer (R$47), Hunter (R$97), Miner (R$197)
