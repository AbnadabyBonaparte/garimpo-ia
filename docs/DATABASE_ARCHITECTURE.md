# DATABASE_ARCHITECTURE.md

# GARIMPO IA™ — Database Architecture

**Tipo:** Arquitetura de banco de dados  
**Objetivo:** Sustentar mineração de oportunidades, histórico de leilões e inteligência de mercado  
**Banco:** PostgreSQL (via Supabase)  
**Princípios:** integridade, idempotência, histórico completo, consultas eficientes

---

# 1. Visão Geral

Fluxo de dados:


Scrapers
↓
Ingestion Pipeline
↓
Normalization & Validation
↓
Database
↓
AI Analysis
↓
Alerts / Analytics / APIs


Camadas lógicas:

1. **Core Entities** — oportunidades e perfis
2. **Auction Tracking** — histórico de leilões
3. **Market Intelligence** — preço e métricas
4. **AI Layer** — análises e scores
5. **User Interaction** — alertas, watchlist
6. **Operations** — scrapers, logs, métricas

---

# 2. Core Entities

## opportunities

Representa um lote ou ativo encontrado.

Campos sugeridos:


id (uuid, pk)
title
description
category
asset_type
location
state
auction_source
auction_url
initial_price
market_value
estimated_profit
roi_estimate
score
closes_at
created_at
opportunity_hash


Índices recomendados:


index(score)
index(category)
index(state)
index(closes_at)
unique(opportunity_hash)


---

## profiles

Usuários da plataforma.


id
email
subscription_tier
subscription_expires_at
preferred_categories
created_at


---

# 3. Auction Tracking

## auction_history

Histórico de lances.


id
opportunity_id
bid_price
bid_time
bidder_count
created_at


Relacionamento:


opportunities → auction_history (1:N)


---

## auction_sources

Fontes de dados de leilão.


id
name
base_url
scraper_type
is_active
last_run_at
last_scraped_at


---

# 4. Market Intelligence

## price_history

Histórico de preços observados.


id
opportunity_id
observed_price
source
observed_at


---

## opportunity_outcomes

Resultado real do leilão ou revenda.


id
opportunity_id
final_price
resale_price
time_to_sell
profit_real
roi_real
recorded_at


Esse dado é essencial para **treinar modelos de previsão**.

---

# 5. AI Layer

## score_history

Histórico de análises.


id
opportunity_id
score
model_version
prompt_version
analysis
created_at


Benefícios:

- auditoria de decisões
- evolução do modelo
- comparação entre versões

---

# 6. User Interaction

## alerts

Alertas enviados.


id
user_id
opportunity_id
channel
sent_at
read_at


---

## alert_rules

Regras personalizadas.


id
user_id
min_score
categories
states
created_at


---

## watchlist

Itens salvos.


id
user_id
opportunity_id
created_at


Unique index:


unique(user_id, opportunity_id)


---

# 7. Operations

## scraper_runs

Registro de execução de scrapers.


id
source_id
success
fetched_count
parsed_count
inserted_count
duplicates_skipped
invalid_skipped
duration_ms
error_message
created_at


---

# 8. Data Moat Strategy

O banco deve capturar:

- oportunidades descobertas
- histórico de preços
- resultado real
- histórico de score

Isso cria um dataset proprietário com:


preço histórico
liquidez
ROI real
tempo de venda


---

# 9. Escalabilidade

Para crescer para milhões de registros:

- índices compostos
- particionamento por data
- materialized views
- ETL analítico

---

# 10. Princípios finais

O banco deve ser projetado para:


histórico completo
dados auditáveis
evolução de modelos
consultas rápidas


O dataset acumulado será o **principal ativo da empresa**.
