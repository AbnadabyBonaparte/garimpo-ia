# AI_SCORING_SYSTEM.md

# GARIMPO IA™ — AI Scoring System

**Tipo:** sistema de avaliação de oportunidades  
**Objetivo:** identificar ativos com maior potencial de lucro

---

# 1. Visão Geral

O AI Scoring System transforma dados brutos em **insights acionáveis**.

Pipeline:


opportunity
↓
data enrichment
↓
AI analysis
↓
score
↓
recommendation


---

# 2. Estrutura da análise

A IA deve retornar:


score
summary
risks
recommendation
estimated_profit
estimated_total_cost


---

# 3. Escala de score


0–30 → evitar
30–60 → risco alto
60–80 → oportunidade
80–100 → excelente oportunidade


---

# 4. Fatores analisados

## 1. Desconto


market_value - auction_price


---

## 2. Liquidez

Tempo médio para revenda.

---

## 3. Demanda

Popularidade do ativo.

---

## 4. Custos ocultos


ITBI
documentação
taxas
transporte


---

# 5. Versionamento

Cada análise deve registrar:


model_version
prompt_version
analysis_date


---

# 6. Histórico de score

Registrar em:


score_history


Isso permite:


comparar versões
melhorar modelos
auditar decisões


---

# 7. Controle de custo

Para evitar custo excessivo:


cache de análises
limite diário
fallback de modelo


---

# 8. Evolução futura

Quando houver dados suficientes:


previsão de preço
previsão de liquidez
previsão de ROI


---

# 9. Índices proprietários

Exemplos:


Garimpo Opportunity Score
Garimpo Liquidity Index
Garimpo ROI Index


Esses índices são parte do **Data Moat da empresa**.

---

# 10. Princípio central

A IA não substitui dados.

Ela **interpreta dados históricos**.

Quanto maior o dataset:


melhor a previsão
melhor o score
melhor o produto
