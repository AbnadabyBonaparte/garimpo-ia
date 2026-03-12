# GARIMPO IA™ — Phase 3: Next 10 Engineering Tasks

**Objetivo:** Escalar o produto com dados reais, automação e crescimento.

---

## 1. Admin: usar opportunityIngestion e botão “Processar pendentes”

**Arquivos:** `src/app/routes/AdminOpportunityPage.tsx`, `src/services/opportunityIngestion.ts`  
**Resultado:** Formulário admin chama `createOpportunity(payload)` em vez de insert manual; botão “Processar oportunidades sem análise” chama `processPendingOpportunities(20)` e exibe toasts com resultado.  
**Explicação:** Unificar ingestão em um único serviço; dar visibilidade ao processamento em lote de IA.

---

## 2. Edge Function: ingestão por API (opcional)

**Arquivos:** `supabase/functions/ingest-opportunity/index.ts` (novo), `docs/API.md`  
**Resultado:** POST com body normalizado insere oportunidade e dispara run-ai-analysis; autenticação por API key ou service role.  
**Explicação:** Scripts e integrações externas podem criar oportunidades sem passar pelo frontend.

---

## 3. Índice e RPC para analytics

**Arquivos:** `supabase/migrations/`, `src/hooks/useAnalytics.ts`  
**Resultado:** View ou RPC que retorna totais, média de score e contagens por categoria/estado; useAnalytics consome isso em vez de buscar 2000 linhas.  
**Explicação:** Reduz carga no cliente e no Postgres em bases grandes.

---

## 4. Watchlist no Dashboard e no Feed

**Arquivos:** `src/app/routes/DashboardPage.tsx`, `src/components/cards/OpportunityCard.tsx`  
**Resultado:** Dashboard exibe “Minha lista” com oportunidades salvas (join watchlist + opportunities); card no feed mostra ícone “Salvar” quando logado.  
**Explicação:** Aumentar engajamento e retenção com lista de interesse.

---

## 5. Notificações por e-mail (enfileiramento)

**Arquivos:** `src/services/notifications.ts`, `supabase/functions/send-alert-email/index.ts`, tabela ou fila  
**Resultado:** Quando um alerta for criado com canal `email`, enfileirar envio (Resend/SendGrid) ou chamar Edge Function; manter in_app como padrão.  
**Explicação:** Arquitetura já preparada em notifications.ts; falta implementar o envio real.

---

## 6. Realtime para contagem de alertas no Header

**Arquivos:** Já implementado em `useAlerts.ts` (postgres_changes).  
**Resultado:** Verificado que a subscription está ativa; em caso de falha, fallback para refetch periódico.  
**Explicação:** Garantir que o badge de notificações atualize assim que um novo alerta for inserido.

---

## 7. Testes E2E do fluxo crítico

**Arquivos:** `e2e/` ou `cypress/` (configurar), specs para login → feed → detalhe → paywall → pricing → checkout.  
**Resultado:** Pipeline CI executa E2E em staging; relatório de cobertura do fluxo de conversão.  
**Explicação:** Evitar regressões em funil de assinatura e uso core.

---

## 8. Monitoramento e logging de erros

**Arquivos:** `src/main.tsx` ou error boundary, integração com Sentry/LogRocket (opcional)  
**Resultado:** Erros de frontend e falhas de API reportados; logs da run-ai-analysis no Supabase.  
**Explicação:** Visibilidade para debugging e estabilidade em produção.

---

## 9. Rate limit e custo da IA

**Arquivos:** `supabase/functions/run-ai-analysis/index.ts`, tabela `ai_analysis_calls` ou uso de quotas  
**Resultado:** Limitar chamadas Gemini por oportunidade/usuário por dia; evitar custo excessivo e abuso.  
**Explicação:** Controle de custo e previsibilidade do uso de Gemini.

---

## 10. Documentação de deploy e variáveis

**Arquivos:** `docs/DEPLOY.md`, `.env.example`  
**Resultado:** Lista completa de variáveis (Vite, Supabase, Stripe, Gemini) e passos para deploy na Vercel e configuração do Supabase (Edge Functions, webhooks Stripe).  
**Explicação:** Onboarding de novos devs e deploys consistentes.
