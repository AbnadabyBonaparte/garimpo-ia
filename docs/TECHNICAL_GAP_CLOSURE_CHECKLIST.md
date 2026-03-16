Perfeito. Vou te entregar **o tipo de documento que um CTO faria após uma due-diligence brutal**.
Sem suavizar nada. Sem “talvez”. Sem “opcional”.

Objetivo:
👉 transformar o GARIMPO IA de **MVP funcional** → **plataforma tecnicamente sólida e operável**.

Use isso como:

```text
docs/TECHNICAL_GAP_CLOSURE_CHECKLIST.md
```

---

# GARIMPO IA — Technical Gap Closure Checklist

**Tipo:** Hardening técnico pós-auditoria
**Objetivo:** eliminar riscos críticos antes de escalar usuários
**Status atual:** MVP funcional com riscos estruturais
**Prioridade:** Segurança → Confiabilidade → Operação → Escala

---

# 0. RESUMO HONESTO

Hoje o sistema:

✔ funciona
✔ entrega valor
✔ tem arquitetura coerente para MVP

Mas faltam **fundamentos de produção**:

* segurança real
* pipeline resiliente
* observabilidade
* testes
* operação

Sem isso, crescer usuários pode gerar:

* custo descontrolado
* falhas silenciosas
* bugs difíceis de rastrear

---

# 1. SEGURANÇA (CRÍTICO)

## 1.1 Proteger run-ai-analysis

Problema:

```text
qualquer pessoa pode chamar a função
```

Checklist:

```
[ ] exigir JWT válido
[ ] validar usuário autenticado
[ ] validar role (admin ou internal)
[ ] validar opportunityId
[ ] validar payload schema (Zod)
[ ] adicionar rate limit
[ ] bloquear chamadas externas diretas
```

Implementação recomendada:

```
edge middleware
+
header token interno
```

---

## 1.2 Rate limit em Edge Functions

Criar limite para:

```
run-ai-analysis
create-checkout-session
scraper triggers
```

Checklist:

```
[ ] rate limit por IP
[ ] rate limit por usuário
[ ] rate limit por minuto
[ ] bloqueio temporário
```

Ferramentas:

```
Upstash
Supabase rate limit
custom middleware
```

---

## 1.3 Harden Stripe webhook

Checklist:

```
[ ] verificar assinatura
[ ] validar timestamp
[ ] evitar replay attack
[ ] validar eventos permitidos
[ ] ignorar eventos inesperados
```

---

## 1.4 Revisar RLS

Checklist:

```
[ ] remover políticas genéricas authenticated
[ ] separar roles admin
[ ] bloquear update indevido em opportunities
[ ] garantir alerts só via engine
```

---

# 2. PIPELINE DE DADOS

## 2.1 Idempotência real de oportunidades

Problema:

dedupe só no app.

Checklist:

```
[ ] criar unique hash opportunity_key
[ ] index no banco
[ ] bloquear duplicata no DB
```

Estratégia:

```
hash(title + source + closing_date)
```

---

## 2.2 Batch insert real

Problema:

loop de insert.

Checklist:

```
[ ] usar insert array
[ ] limite batch size
[ ] fallback retry
```

---

## 2.3 Retry de pipeline

Checklist:

```
[ ] retry scraper
[ ] retry AI
[ ] retry alert engine
```

Estratégia:

```
exponential backoff
```

---

## 2.4 Dead letter queue

Criar tabela:

```
failed_jobs
```

Checklist:

```
[ ] salvar payload falho
[ ] salvar erro
[ ] permitir reprocessar
```

---

# 3. FILA DE PROCESSAMENTO

Hoje não existe.

Precisa existir para:

```
scraping
AI
alerts
```

Checklist:

```
[ ] job queue
[ ] retries
[ ] DLQ
[ ] concorrência controlada
```

Opções:

```
pg-boss
BullMQ
Upstash QStash
Supabase queue
```

---

# 4. SCRAPER ENGINE

## 4.1 Scrapers reais

Checklist:

```
[ ] superbid scraper
[ ] copart scraper
[ ] caixa scraper
[ ] olx vehicles scraper
[ ] mercadolivre scraper
```

---

## 4.2 Compliance scraping

Checklist:

```
[ ] respeitar robots.txt
[ ] rate limit
[ ] headers adequados
[ ] delay entre requests
```

---

## 4.3 Failover

Checklist:

```
[ ] retry scraper
[ ] fallback source
[ ] registrar falhas
```

---

# 5. CRON / AGENDAMENTO

Hoje não configurado.

Checklist:

```
[ ] Vercel cron
[ ] job schedule
[ ] rodar runScheduledScrape
[ ] logar execução
```

---

# 6. OBSERVABILIDADE

Hoje quase inexistente.

---

## 6.1 Error tracking

Adicionar:

```
Sentry
```

Checklist:

```
[ ] frontend errors
[ ] edge function errors
[ ] scraper errors
[ ] AI failures
```

---

## 6.2 Logs estruturados

Checklist:

```
[ ] request logs
[ ] pipeline logs
[ ] AI logs
[ ] scraper logs
```

---

## 6.3 Alerting

Criar alertas para:

```
scraper falhou
AI falhou
alert engine travou
stripe webhook erro
```

---

# 7. FINOPS (CUSTO DE IA)

Sem controle hoje.

Checklist:

```
[ ] limite diário de IA
[ ] limite por usuário
[ ] custo por análise
[ ] fallback de modelo
```

---

# 8. TESTES

Hoje inexistentes.

Obrigatório mínimo:

---

## 8.1 Unit tests

Criar:

```
alertEngine.test.ts
dedupe.test.ts
validation.test.ts
```

---

## 8.2 Pipeline tests

```
scraperPipeline.test.ts
aiProcessing.test.ts
```

---

## 8.3 E2E

Fluxo:

```
login
criar oportunidade
rodar IA
gerar alerta
abrir alerta
```

---

# 9. ANALYTICS REAL

Hoje analytics é client-side.

Checklist:

```
[ ] materialized views
[ ] agregações server-side
[ ] índices analytics
```

---

# 10. GOVERNANÇA DE ARQUITETURA

Problema:

docs ≠ código.

Checklist:

```
[ ] alinhar docs com código
[ ] remover arquitetura fictícia
[ ] definir ADRs
```

---

# 11. DEPLOY E INFRA

Checklist:

```
[ ] documentar env vars
[ ] criar script deploy
[ ] validar build pipeline
[ ] configurar backups DB
```

---

# 12. SEGURANÇA EXTRA

Checklist:

```
[ ] CSP headers
[ ] audit dependências
[ ] secrets rotation
[ ] token expiration
```

---

# 13. DATA MOAT

Começar a capturar:

```
closing_price
time_to_sell
price_history
```

---

# ESTEIRA DE EXECUÇÃO (ORDEM REAL)

## Semana 1 — segurança

```
1 proteger run-ai-analysis
2 revisar RLS
3 rate limit
4 stripe webhook hardening
```

---

## Semana 2 — pipeline

```
5 batch insert
6 idempotência DB
7 retry
8 DLQ
```

---

## Semana 3 — observabilidade

```
9 Sentry
10 logs estruturados
11 alerting
```

---

## Semana 4 — testes

```
12 unit tests
13 pipeline tests
14 e2e
```

---

## Semana 5 — escala

```
15 fila
16 analytics server-side
17 scrapers reais
```

---

# NOTA FINAL APÓS HARDENING

Se tudo acima for feito:

| área        | nota |
| ----------- | ---- |
| Arquitetura | 8    |
| Pipeline    | 8    |
| Segurança   | 8    |
| Escala      | 7    |
| Produto     | 8    |

Nota geral:

```
8 / 10
```

---

# VERDADE FINAL

Hoje você tem:

```
MVP técnico funcional
```

Depois desse checklist:

```
plataforma pronta para escalar
```

---


