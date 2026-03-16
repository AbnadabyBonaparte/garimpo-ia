# GARIMPO IA™ — Phase 4: Next 10 Engineering Tasks

**Objetivo:** Escalar o motor de mineração automatizada e a qualidade dos dados.

---

## 1. Vercel Cron ou API route para scrape agendado

**Arquivos:** `vercel.json`, `src/app/api/cron/scrape/route.ts` (ou similar)  
**Resultado:** Endpoint protegido (CRON_SECRET ou Vercel cron header) que chama `runScheduledScrape()`. Configurar em Vercel Cron para horário diário ou horário.  
**Explicação:** Automatizar a execução do pipeline sem intervenção manual; Vercel Cron chama a URL e o pipeline roda.

---

## 2. Admin: botão "Executar scrapers" e lista de fontes

**Arquivos:** `src/app/routes/AdminOpportunityPage.tsx` ou nova `AdminScrapersPage.tsx`, `auctionSourceRegistry.ts`  
**Resultado:** Página admin lista `auction_sources` ativos; botão "Executar agora" chama `scheduleScrapers()` e exibe resultado (inseridos, duplicatas, erros).  
**Explicação:** Permitir disparo manual do pipeline e visibilidade das fontes configuradas.

---

## 3. Inserir seed em auction_sources para example_auction

**Arquivos:** Migration ou seed SQL, ou script  
**Resultado:** Um registro em `auction_sources` com `name`, `url`, `scraper_type = 'example_auction'`, `is_active = true` para o scraper de exemplo aparecer no pipeline.  
**Explicação:** Sem fontes ativas, `scheduleScrapers()` não insere nada; o seed garante um exemplo funcional.

---

## 4. Scraper real para um leilão público (ex.: Justiça Federal)

**Arquivos:** `src/scrapers/justicaFederalScraper.ts` (ou outro), registro em `scraperPipeline.ts`  
**Resultado:** Novo scraper que faz fetch real (ou em staging com HTML salvo), parse e normalização; registrado como tipo em `SCRAPER_REGISTRY`.  
**Explicação:** Levar o mining engine a uma fonte real; respeitar robots.txt e termos de uso.

---

## 5. Média de score por fonte (auction_source)

**Arquivos:** `src/services/scraperMonitoring.ts` ou novo RPC/view, `useScraperMetrics.ts`, `AnalyticsPage.tsx`  
**Resultado:** Query que agrupa oportunidades por `auction_source` e retorna `avg(score)`; exibir no dashboard "Mining Engine" (avg score por fonte).  
**Explicação:** Métrica de qualidade por origem; pode exigir view ou RPC no Supabase.

---

## 6. Retry e backoff no pipeline

**Arquivos:** `src/services/scraperPipeline.ts`  
**Resultado:** Em falha de `fetchRawData()` ou insert, retry com backoff (ex.: 2 tentativas com 2s e 5s); registrar falha em `scraper_runs` após esgotar.  
**Explicação:** Reduzir impacto de falhas temporárias de rede ou do destino.

---

## 7. Rate limit por fonte

**Arquivos:** `src/scrapers/types.ts` ou config por scraper, `scraperPipeline.ts`  
**Resultado:** Respeitar um delay mínimo entre requisições por baseUrl (ex.: 1 req/2s por domínio) para não sobrecarregar o site alvo.  
**Explicação:** Boas práticas de scraping e redução de risco de bloqueio.

---

## 8. Fila de processamento IA (opcional)

**Arquivos:** Supabase tabela `ai_analysis_queue` ou uso de `processPendingOpportunities` em cron  
**Resultado:** Após insert em massa, enfileirar opportunity_ids para análise; worker ou cron consome a fila e chama run-ai-analysis. Evita disparar dezenas de chamadas simultâneas.  
**Explicação:** Controle de carga no Gemini e na Edge Function.

---

## 9. Alertas quando scraper falha

**Arquivos:** `scraperMonitoring.ts`, integração com notificações (toast in-app ou email)  
**Resultado:** Se `success: false` em uma execução agendada, criar alerta para admin (ex.: inserir em `alerts` com canal in_app para role admin) ou enviar email.  
**Explicação:** Visibilidade rápida de falhas no pipeline.

---

## 10. Documentação do contrato ScraperSource

**Arquivos:** `docs/SCRAPERS.md` ou seção em `APRESENTACAO_SISTEMA_ENGENHARIA.md`  
**Resultado:** Documento que descreve a interface `ScraperSource`, como registrar um novo scraper, formato esperado de `OpportunityIngestionPayload` e como testar com mock.  
**Explicação:** Facilitar onboarding de novos scrapers e manutenção do mining engine.
