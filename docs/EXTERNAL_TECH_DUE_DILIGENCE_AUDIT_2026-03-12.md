# GARIMPO IA — Auditoria Técnica Externa (Due Diligence)

Data: 2026-03-12  
Escopo auditado: código-fonte versionado em `/workspace/garimpo-ia` (frontend React/Vite, funções Supabase, schema/migrations SQL, serviços/pipeline TS).  
Método: validação estrita por evidência de código (sem confiar em claims de documentação quando não confirmadas no código).

---

## Sumário executivo (sem açúcar)

**Veredito curto:** o sistema é **crível como MVP funcional**, mas **não está pronto para escala séria nem para diligência técnica “investível sem ressalvas”**. A base é rápida para iterar, porém há riscos altos em segurança operacional, integridade de pipeline e maturidade de engenharia.

**Diagnóstico macro:**
- **MVP:** adequado (rápido, pragmático, entrega valor).
- **Escala startup (10k usuários / 100k oportunidades):** viável com refactors importantes.
- **Plataforma de dados em larga escala (1M+ registros):** arquitetura atual **insuficiente** sem redesenho de ingestão, processamento assíncrono e observabilidade.

---

## 1) Architecture review

### Pontos fortes
- Separação básica frontend/hooks/services presente e compreensível.
- Supabase + RLS reduz complexidade inicial de backend.
- Edge Functions para Stripe e AI estabelecem boundary claro para segredos server-side.

### Falhas críticas
- **Forte acoplamento frontend ↔ backend operacional**: serviços de ingestão, dedupe, scheduler e monitoring rodam no frontend codebase (com `supabase-js` cliente), não num worker backend robusto. Isso limita confiabilidade, segurança de execução e escalabilidade operacional.
- **Pipeline síncrono e serial**: ingestão em loop com inserts um a um e dedupe por consulta por item, sem filas/event bus/job runner.
- **Inconsistência arquitetura declarada vs implementada**: documentação cita tabelas/fluxos não existentes no schema real (sinal de governança fraca de arquitetura).

### Adequação por estágio
- **MVP:** 7/10 (rápido para validar mercado).
- **Startup scale:** 4/10 (gargalos e fragilidade operacional).
- **Data platform large-scale:** 2/10 (faltam primitives de plataforma).

---

## 2) Codebase maturity

### Organização
- Estrutura é legível, com domínio razoavelmente separado em `hooks`, `services`, `routes`, `scrapers`.

### Maturidade de engenharia
- **Type safety parcial**: bom uso de TS/Zod em alguns pontos, porém lacunas em validação end-to-end e casts permissivos.
- **Padrões inconsistentes**: parte da IA usa SDK + Zod (`src/services/aiAnalysis.ts`), outra parte usa fetch manual na Edge Function com parse ad hoc.
- **Qualidade geral moderada/baixa**: lint falha com erros reais (não apenas warnings), inclusive em função crítica de AI e engine de alertas.
- **Testes praticamente ausentes**: não foram encontrados testes unit/E2E no `src`.

### Dívida técnica identificada
- **Alta**: ausência de suite de testes para pipeline crítico.
- **Alta**: lint quebrado em produção.
- **Média**: duplicação de lógica (alert engine em dois lugares, AI em camadas distintas).

---

## 3) Data pipeline (scraper → normalização → validação → ingestão → AI → alertas)

### Estado atual
- Pipeline existe conceitualmente e no código, porém implementação é **best effort** e não resiliente.

### Fragilidades
- Sem fila durável / retries com backoff / dead-letter queue.
- Sem idempotência forte no banco para `opportunities` (dedupe app-level apenas; race condition possível).
- Processamento AI/alertas acoplado à execução de ingestão (efeito cascata em falhas).
- Bulk ingest não usa batch insert real SQL; faz N inserts sequenciais.

### Robustez/fault tolerance
- **Baixa**: falhas de rede/serviço podem gerar perda de processamento silenciosa.

---

## 4) Scraper engine

### Achados
- Arquitetura de interface de scraper está boa como contrato.
- Implementação real é um scraper de exemplo com dados mockados; motor real de scraping ainda não está de fato operacional para fontes externas múltiplas.
- Scheduler é apenas função utilitária sem orquestrador robusto.
- Monitoramento existe no banco (`scraper_runs`), mas sem alerting automático nem SLOs.

### Riscos
- Alto risco de indisponibilidade e inconsistência ao migrar do mock para scraping real.
- Risco legal/compliance não tratado em código (robots.txt, rate-limit, termos de uso, trilha de auditoria jurídica).

---

## 5) AI pipeline

### Pontos positivos
- Prompt estruturado e tentativa de forçar JSON.
- Clamp de score 0–100.

### Riscos relevantes
- Endpoint `run-ai-analysis` sem autenticação/autorização explícita (qualquer caller com URL pode acionar custo).
- Ausência de budget guardrails (rate limit por usuário/fonte, quotas de custo, circuit breaker).
- Cache simplista (`ai_analysis` e score já preenchidos) sem versionamento de prompt/modelo.
- Validação de resposta insuficiente na Edge Function (parse JSON sem schema robusto equivalente ao Zod local).
- Dependência de LLM para campos financeiros sem validação determinística adicional.

---

## 6) Security review

### Pontos bons
- Secrets via env vars (sem hardcode explícito encontrado).
- RLS habilitado nas tabelas principais.
- Stripe webhook faz verificação HMAC.

### Vulnerabilidades/alertas
- Políticas amplas demais para inserts/updates em tabelas sensíveis (`authenticated` genérico) podem abrir abuso por usuário autenticado comum.
- `create-checkout-session` aceita auth opcional; pode gerar sessões sem vínculo de usuário.
- `run-ai-analysis` não valida JWT nem role.
- CORS permissivo (`*`) em funções sensíveis.
- Webhook Stripe valida assinatura mas não aplica janela temporal anti-replay explícita.
- Falta rate limiting e proteção anti-abuso nas funções.

---

## 7) Database design

### Pontos positivos
- Schema inicial objetivo, com checks e alguns índices úteis.
- Colunas geradas para lucro/ROI são boas para leitura.

### Problemas estruturais
- Falta constraint de unicidade de oportunidade em nível DB (chave natural/hash).
- Índices insuficientes para consultas compostas que serão críticas no feed (score+categoria+estado+closes_at).
- Ausência de particionamento/estratégia de arquivamento para histórico longo.
- Migrações liberam update em `auction_sources` para qualquer autenticado.

---

## 8) Product architecture fit

### Suporta hoje
- Feed, detalhes, watchlist, alertas in-app, analytics básico e assinatura.

### Limitações que travam produto
- Alertas em canais reais (email/whatsapp/push) não operacionalizados.
- Analytics é agregação ad hoc no cliente, não camada analítica de verdade.
- IA e scraping ainda não têm confiabilidade para promessa de “Bloomberg dos leilões”.

---

## 9) Escalabilidade (10k usuários, 100k oportunidades, 1M registros)

### 10k / 100k
- Frontend e Supabase aguentam com tuning, mas pipeline atual vira gargalo.

### 1M+
- Alto risco de degradação por:
  - dedupe O(n) com queries por item;
  - analytics puxando amostras grandes para processar em memória no cliente;
  - ausência de jobs assíncronos com paralelismo controlado;
  - observabilidade insuficiente para operar incidentes.

---

## 10) Operações & observabilidade

### Existe
- Registro de runs de scraper e métricas básicas.

### Falta (grave)
- Error tracking centralizado (Sentry/Datadog etc.).
- Métricas de custo e latência de IA por fonte/modelo.
- Alerting operacional (falha de scraper, queda de success rate, fila parada).
- Dashboards de saúde de pipeline com SLO/SLA.

---

## 11) Gap analysis para produção

1. Job queue durável (retry/backoff/DLQ) para ingestão e IA.
2. Idempotência real no banco para oportunidades.
3. Auth forte + rate limit em Edge Functions.
4. RBAC/admin real (não apenas “authenticated”).
5. Testes unitários/integrados/E2E de fluxos críticos.
6. Observabilidade completa (logs estruturados + traces + alertas).
7. Estratégia de custos de IA (quotas, throttling, fallback de modelo).
8. Plano legal de scraping/compliance.
9. Materialized views/ETL para analytics.
10. Runbooks e operação incident response.

---

## 12) Top 10 riscos técnicos (rank)

1. **Abuso de Edge Functions e custo descontrolado de IA** (Crítico)
2. **Permissões excessivas em políticas RLS para atores autenticados** (Crítico)
3. **Pipeline sem fila/idempotência forte** (Crítico)
4. **Ausência de testes automatizados em áreas críticas** (Alto)
5. **Divergência doc vs código (governança fraca)** (Alto)
6. **Dedupe frágil e sujeito a race conditions** (Alto)
7. **Observabilidade insuficiente para operar em produção** (Alto)
8. **Analytics client-side não escalável** (Médio/Alto)
9. **Dependência de scraper “exemplo” para narrativa de automação** (Médio/Alto)
10. **Webhook sem hardening adicional anti-replay/abuso** (Médio)

---

## 13) Due diligence (visão de VC técnico)

- **Sistema é crível?** Sim, como MVP funcional com potencial.
- **Over-engineered?** Não. Na verdade está mais para pragmático/MVP.
- **Under-engineered?** Sim, para tese de plataforma de inteligência em larga escala.
- **Tecnicamente investível hoje?** **Investível com marcos condicionais** (hardening de segurança, confiabilidade de pipeline e maturidade operacional antes de escalar go-to-market).

---

## 14) Scoring (0–10)

- Arquitetura: **5.5**
- Qualidade de código: **4.5**
- Data pipeline: **4.0**
- AI pipeline: **4.0**
- Segurança: **4.5**
- Escalabilidade: **3.5**
- Observabilidade: **3.0**
- Engenharia de produto: **5.5**
- Qualidade sistêmica geral: **4.4**

---

## 15) Roadmap objetivo de melhoria

### Fase 1 (0–30 dias) — “Fechar vazamentos”
- Blindar Edge Functions: JWT obrigatório onde aplicável, rate limiting, validação de payload com Zod, CORS restritivo.
- Revisar RLS: remover políticas genéricas de `authenticated` em ações administrativas.
- Corrigir lint errors e padronizar tratamento de erro.
- Definir e instrumentar logs estruturados + error tracking.

### Fase 2 (30–60 dias) — “Confiabilidade operacional”
- Introduzir fila assíncrona para ingestão e IA (com retries e DLQ).
- Implementar idempotência forte no banco para oportunidades.
- Cobertura de testes mínima para fluxos críticos (ingestão, scoring, alertas, pagamento).

### Fase 3 (60–120 dias) — “Pronto para escalar”
- Migrar analytics para camada analítica (views/materialized views/ETL).
- Orquestração real de scrapers (concorrência controlada, QoS por fonte, compliance).
- FinOps de IA (custo por análise, budget por tenant, fallback de modelos).

---

## Conclusão final

O GARIMPO IA está em um ponto honesto de startup early-stage: **produto com valor claro e base técnica suficiente para aprender rápido**, porém **com riscos estruturais relevantes para segurança, operação e escala**. A boa notícia é que os problemas são corrigíveis sem reescrever tudo. A má notícia é que, sem esse hardening, crescer tráfego/usuário provavelmente vai expor falhas de confiabilidade e custo.

