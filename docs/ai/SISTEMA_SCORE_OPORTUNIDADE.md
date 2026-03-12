# GARIMPO IA™ — Sistema de Score de Oportunidades

Este documento define o sistema de pontuação utilizado pelo GARIMPO IA.

O objetivo é padronizar a avaliação de oportunidades de leilão.

---

# 1. Estrutura do Score

O score final varia de:

0 → 100

Ele é calculado com base em cinco fatores principais.

---

# 2. Fatores Avaliados

## 1. Desconto vs Mercado (0–40)

Comparação entre preço atual e valor de mercado.

Desconto | Pontos
---|---
0–10% | 5
10–25% | 15
25–40% | 25
40–60% | 35
60%+ | 40

---

## 2. Liquidez do Ativo (0–20)

Facilidade de revenda.

Liquidez | Pontos
---|---
Muito baixa | 5
Baixa | 10
Média | 15
Alta | 20

---

## 3. Risco Jurídico / Técnico (0–15)

Quanto menor o risco, maior a pontuação.

Risco | Pontos
---|---
Alto | 3
Moderado | 8
Baixo | 12
Muito baixo | 15

---

## 4. Demanda de Mercado (0–15)

Quanto maior a procura pelo ativo.

Demanda | Pontos
---|---
Baixa | 5
Moderada | 10
Alta | 15

---

## 5. Complexidade Operacional (0–10)

Quanto esforço é necessário para revender.

Complexidade | Pontos
---|---
Alta | 3
Moderada | 6
Baixa | 10

---

# 3. Cálculo Final

score = soma de todos os fatores

---

# 4. Classificação Final

Score | Classificação
---|---
0–30 | Evitar
31–50 | Baixa oportunidade
51–70 | Moderada
71–85 | Boa
86–100 | Excelente

---

# 5. Uso no Produto

Score será exibido em:

- cards de oportunidade
- página de detalhe
- alertas

---

# 6. Evolução futura

O score poderá incorporar:

- histórico de leilões
- dados regionais
- análise de liquidez real
- machine learning
