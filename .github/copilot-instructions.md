# GitHub Copilot Instructions — GARIMPO IA™

## 6 Leis Sagradas (INVIOLÁVEIS)
1. ZERO CORES HARDCODED — Toda cor via CSS vars em `src/styles/theme.css`
2. COMPONENTES UI PADRONIZADOS — shadcn/ui + CVA em `src/components/ui/`
3. DADOS 100% REAIS — Zero mock. SSOT: `src/lib/supabaseClient.ts`
4. TEMAS DINÂMICOS — Dark/Light via `data-theme`
5. ESTADOS UI COMPLETOS — Loading + Error + Empty em toda página com dados
6. ESTRUTURA CANÔNICA — Sem duplicações, SSOT para tudo

## Stack: React 19 · TypeScript 5.8 · Vite 6 · Tailwind · Supabase · Gemini 2.5 Pro · Stripe

## Tailwind: NUNCA usar bg-white, bg-black, bg-gray-*, text-white, text-gray-*
## Fonts: font-display (títulos), font-body (interface), font-mono-data (valores)
