# SYSTEM_ARCHITECTURE.md

# GARIMPO IA™ — System Architecture

**Tipo:** Arquitetura de plataforma  
**Objetivo:** suportar mineração automática de oportunidades, análise por IA e geração de inteligência de mercado  
**Horizonte:** arquitetura evolutiva (MVP → plataforma de dados escalável)

---

# 1. Visão Geral

O GARIMPO IA é uma plataforma de **mineração e inteligência de ativos físicos**, construída em camadas para permitir evolução contínua.

Arquitetura conceitual:


Internet
↓
Scrapers
↓
Ingestion Pipeline
↓
Database
↓
AI Analysis
↓
Alerts / APIs / Analytics
↓
Users


---

# 2. Camadas da Arquitetura

A plataforma é dividida em **6 camadas principais**.

## 2.1 Data Acquisition Layer

Responsável por coletar dados.

Componentes:

- Scrapers
- Crawlers
- APIs externas
- Upload manual

Responsabilidades:


descobrir oportunidades
coletar dados brutos
detectar mudanças


---

## 2.2 Ingestion Pipeline

Transforma dados brutos em dados estruturados.

Pipeline:


raw data
↓
parse
↓
normalize
↓
validate
↓
deduplicate
↓
insert


Responsabilidades:

- normalização
- validação
- deduplicação
- inserção segura

---

## 2.3 Database Layer

Responsável por armazenar dados estruturados.

Banco recomendado:


PostgreSQL


Principais entidades:

- opportunities
- auction_history
- price_history
- score_history
- alerts
- watchlist
- scraper_runs

Princípios:


integridade
idempotência
histórico completo


---

## 2.4 AI Intelligence Layer

Responsável por analisar oportunidades.

Pipeline:


opportunity
↓
data enrichment
↓
AI scoring
↓
recommendation


Funções:

- estimar ROI
- detectar risco
- priorizar oportunidades
- gerar resumo analítico

---

## 2.5 Delivery Layer

Responsável por entregar valor ao usuário.

Componentes:

- Feed de oportunidades
- Alertas
- Watchlist
- Dashboard
- APIs

Fluxo:


dados
↓
IA
↓
insights
↓
usuário


---

## 2.6 Observability Layer

Permite operar o sistema em produção.

Inclui:

- logs estruturados
- métricas
- monitoramento
- alertas

Ferramentas sugeridas:


Sentry
Prometheus
Grafana


---

# 3. Arquitetura de Execução

O sistema roda em três tipos de serviços.

## 3.1 Frontend

Responsável pela interface do usuário.

Tecnologias sugeridas:


React
TypeScript
Tailwind


---

## 3.2 Backend

Responsável por lógica de negócio.

Exemplos:

- Edge Functions
- APIs
- pipelines

---

## 3.3 Workers

Responsáveis por tarefas pesadas.

Exemplos:

- scraping
- análise IA
- processamento de alertas

---

# 4. Pipeline de Processamento

Fluxo completo:


scraper
↓
raw data
↓
normalization
↓
validation
↓
database
↓
AI analysis
↓
alerts
↓
dashboard


---

# 5. Escalabilidade

A arquitetura deve suportar crescimento.

Estratégias:

- paralelização de scrapers
- batch processing
- caching
- índices otimizados

---

# 6. Segurança

Princípios:


least privilege
defense in depth
auditable actions


Implementações:

- JWT
- RLS
- rate limiting
- validação de payload

---

# 7. Evolução da Arquitetura

### Fase 1 — MVP


scrapers básicos
pipeline simples
AI scoring
dashboard


---

### Fase 2 — Plataforma


fila de jobs
observabilidade
analytics
API pública


---

### Fase 3 — Inteligência


machine learning
previsão de preço
índices proprietários


---

# 8. Princípio central

A arquitetura deve ser desenhada para **acumular dados ao longo do tempo**.

Porque o verdadeiro ativo da empresa é:


dataset proprietário
