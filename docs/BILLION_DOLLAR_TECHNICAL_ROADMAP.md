
# GARIMPO IA™ — Billion-Dollar Technical Roadmap

**Tipo:** Roadmap Técnico Estratégico
**Objetivo:** Evoluir o GARIMPO IA de um **MVP funcional** para uma **plataforma global de inteligência de ativos físicos**
**Escopo:** Checklist técnico completo (A → Z)
**Horizonte:** 12–36 meses
**Versão:** 1.0
**Data:** 2026

---

# 0. Visão Técnica da Plataforma

A arquitetura final da plataforma GARIMPO IA será baseada em **mineração massiva de oportunidades de mercado**, processamento inteligente e geração de insights.

### Arquitetura Conceitual

```
Internet
   ↓
Scrapers
   ↓
Data Pipeline
   ↓
AI Scoring Engine
   ↓
Historical Dataset
   ↓
Market Intelligence
   ↓
Users / Alerts / APIs
```

### Ativo Estratégico da Empresa

O principal ativo da empresa será:

**Dataset proprietário de oportunidades e resultados de leilões**

Quem controla **dados históricos estruturados de mercado** controla a **inteligência do mercado**.

---

# 1. Hardening do Sistema (Segurança)

**Objetivo:** eliminar riscos técnicos críticos e fortalecer a superfície de segurança da plataforma.

### Checklist

* [ ] Exigir **JWT** em todas Edge Functions sensíveis
* [ ] Implementar **rate limit por IP**
* [ ] Implementar **rate limit por usuário**
* [ ] Validar payloads com **Zod** em todas APIs
* [ ] Bloquear chamadas externas diretas em funções internas
* [ ] Implementar **RBAC (Role-Based Access Control)**

  * admin
  * user
  * system
* [ ] Restringir **CORS** em funções críticas
* [ ] Aplicar **security headers**

  * CSP
  * XSS Protection
  * Frameguard
* [ ] Auditar dependências automaticamente
* [ ] Rotacionar **secrets** periodicamente

---

# 2. Hardening do Webhook Stripe

### Checklist

* [ ] Validar **assinatura do webhook**
* [ ] Validar **timestamp do evento**
* [ ] Bloquear **replay attacks**
* [ ] Aceitar apenas **eventos permitidos**
* [ ] Registrar eventos inválidos
* [ ] Garantir **idempotência no processamento**

---

# 3. Pipeline de Dados Resiliente

**Objetivo:** tornar ingestão e processamento robustos.

### Checklist

* [ ] Criar **job queue durável**
* [ ] Implementar **retry automático**
* [ ] Implementar **backoff exponencial**
* [ ] Criar **dead-letter queue**
* [ ] Mover ingestão para **worker dedicado**
* [ ] Limitar concorrência
* [ ] Suportar **processamento paralelo**
* [ ] Permitir **reprocessamento manual**
* [ ] Implementar **checkpointing** em pipeline longo
* [ ] Implementar **batch processing real**

---

# 4. Idempotência de Oportunidades

### Checklist

* [ ] Criar coluna `opportunity_hash`
* [ ] Criar **unique index** no banco
* [ ] Bloquear duplicatas no banco
* [ ] Gerar hash baseado em **titulo + fonte + data**
* [ ] Validar duplicatas antes do insert

---

# 5. Scraper Engine

**Objetivo:** mineração automática massiva.

### Checklist

* [ ] Criar **classe base `ScraperSource`**
* [ ] Implementar scraper **Superbid**
* [ ] Implementar scraper **Copart**
* [ ] Implementar scraper **Caixa Leilões**
* [ ] Implementar scraper **OLX veículos**
* [ ] Implementar scraper **Mercado Livre**
* [ ] Implementar scraper **Webmotors**
* [ ] Implementar scraper **iCarros**
* [ ] Implementar **crawler genérico**
* [ ] Implementar **proxy rotation**

---

# 6. Compliance de Scraping

### Checklist

* [ ] Respeitar **robots.txt**
* [ ] Limitar requisições por host
* [ ] Implementar delays aleatórios
* [ ] Identificar **user-agent claro**
* [ ] Registrar fontes auditadas

---

# 7. Normalização de Dados

### Checklist

* [ ] Padronizar categorias
* [ ] Padronizar estados
* [ ] Normalizar valores monetários
* [ ] Padronizar datas
* [ ] Remover HTML residual
* [ ] Detectar entidades (marca, modelo)
* [ ] Enriquecer dados automaticamente

---

# 8. Engine de Qualidade de Dados

### Checklist

* [ ] Validar URLs
* [ ] Validar datas de leilão
* [ ] Validar valores numéricos
* [ ] Detectar inconsistências
* [ ] Pontuar qualidade de dados
* [ ] Rejeitar registros inválidos

---

# 9. Data Moat

**Objetivo:** construir banco de dados proprietário.

### Checklist

* [ ] Registrar histórico de oportunidades
* [ ] Registrar preço final de leilões
* [ ] Registrar histórico de score
* [ ] Registrar liquidez por categoria
* [ ] Registrar tempo até venda
* [ ] Registrar ROI real

---

# 10. Historical Data Engine

### Checklist

* [ ] Criar tabela `auction_history`
* [ ] Criar tabela `price_history`
* [ ] Registrar evolução de lances
* [ ] Registrar eventos do leilão

---

# 11. AI Scoring Engine

### Checklist

* [ ] Versionar prompts
* [ ] Versionar modelos
* [ ] Registrar histórico de análises
* [ ] Validar respostas da IA
* [ ] Detectar respostas inválidas
* [ ] Fallback automático de modelo

---

# 12. Controle de Custo de IA (FinOps)

### Checklist

* [ ] Registrar custo por análise
* [ ] Limite diário de IA
* [ ] Limite por usuário
* [ ] Alertas de custo
* [ ] Fallback para modelo barato

---

# 13. Alert Engine Avançado

### Checklist

* [ ] Alertas por score
* [ ] Alertas por ROI
* [ ] Alertas por categoria
* [ ] Alertas por estado
* [ ] Alertas por liquidez
* [ ] Alertas personalizados

---

# 14. Sistema de Notificações

### Checklist

* [ ] Email alerts
* [ ] Push notifications
* [ ] WhatsApp alerts
* [ ] Telegram alerts

---

# 15. Watchlist Evoluída

### Checklist

* [ ] Múltiplas listas
* [ ] Tags personalizadas
* [ ] Compartilhamento

---

# 16. Dashboard Inteligente

### Checklist

* [ ] Recomendações personalizadas
* [ ] Oportunidades sugeridas
* [ ] Histórico de interações

---

# 17. Analytics Avançado

### Checklist

* [ ] Oportunidades por estado
* [ ] Oportunidades por categoria
* [ ] Score médio por fonte
* [ ] ROI médio
* [ ] Volume de mercado

---

# 18. Data Warehouse

### Checklist

* [ ] Materialized views
* [ ] ETL diário
* [ ] Agregações pré-calculadas

---

# 19. API Pública

### Checklist

* [ ] Endpoint oportunidades
* [ ] Endpoint analytics
* [ ] Endpoint alertas
* [ ] Autenticação API

---

# 20. Market Intelligence

### Checklist

* [ ] Ranking de oportunidades
* [ ] Ranking de categorias
* [ ] Ranking de fontes

---

# 21. Machine Learning

### Checklist

* [ ] Modelo previsão de preço
* [ ] Modelo previsão ROI
* [ ] Modelo liquidez

---

# 22. Observabilidade

### Checklist

* [ ] Sentry para erros
* [ ] Logs estruturados
* [ ] Métricas do pipeline
* [ ] Alertas operacionais

---

# 23. Monitoramento

### Checklist

* [ ] Monitorar falha de scrapers
* [ ] Monitorar custo IA
* [ ] Monitorar latência APIs

---

# 24. Testes

### Checklist

* [ ] Testes unitários
* [ ] Testes pipeline
* [ ] Testes E2E

---

# 25. DevOps

### Checklist

* [ ] CI pipeline
* [ ] Build automatizado
* [ ] Deploy seguro

---

# 26. Backups

### Checklist

* [ ] Backup automático banco
* [ ] Retenção de dados

---

# 27. Performance

### Checklist

* [ ] Índices banco
* [ ] Caching

---

# 28. Escala

### Checklist

* [ ] Paralelizar scrapers
* [ ] Paralelizar pipeline

---

# 29. Segurança Avançada

### Checklist

* [ ] Auditoria de segurança
* [ ] Pentest

---

# 30. Roadmap de Execução

### Semana 1 — Segurança

* Hardening do sistema
* Hardening do Stripe
* RBAC
* Rate limiting

### Semana 2 — Pipeline

* Job queue
* Workers
* Idempotência
* Retry/backoff

### Semana 3 — Observabilidade

* Logs
* Métricas
* Sentry
* Monitoramento

### Semana 4 — Testes

* Unit tests
* Pipeline tests
* E2E tests

### Semana 5 — Scrapers reais

* Superbid
* Copart
* Caixa
* OLX
* Webmotors

---

# Nota Técnica Esperada Após Execução

| Área        | Nota |
| ----------- | ---- |
| Arquitetura | 8    |
| Pipeline    | 8    |
| Segurança   | 8    |
| Escala      | 7    |
| Produto     | 8    |

**Nota geral esperada**

**8 / 10**

---

# Conclusão

Hoje:

**GARIMPO IA = MVP funcional**

Após execução deste roadmap:

**GARIMPO IA = plataforma de dados escalável**

O verdadeiro ativo será:

**Dataset proprietário de inteligência de ativos físicos**

Porque:

**Quem controla os dados controla o mercado.**
