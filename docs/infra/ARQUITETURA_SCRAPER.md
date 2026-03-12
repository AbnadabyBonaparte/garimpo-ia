# GARIMPO IA™ — Arquitetura do Sistema de Scraping

Este documento define como o sistema coleta dados de leilões.

---

# 1. Fluxo Geral

Fontes de leilão
↓
Scraper automático
↓
Supabase
↓
Análise IA
↓
Dashboard

---

# 2. Ferramentas

Stack recomendada:

- n8n (orquestração)
- Apify (scrapers prontos)
- Playwright (fallback)

---

# 3. Arquitetura

Scheduler
↓
Fonte de dados
↓
Coletor
↓
Normalização
↓
Supabase

---

# 4. Frequência de Varredura

Categoria | Frequência
---|---
Carros | 4 horas
Imóveis | 12 horas
Maquinário | 12 horas

---

# 5. Estrutura de Dados Capturados

{
  "titulo": "",
  "categoria": "",
  "localizacao": "",
  "preco_lance": "",
  "url": "",
  "imagens": [],
  "data_encerramento": ""
}

---

# 6. Deduplicação

Antes de salvar:

- gerar hash do item
- comparar com registros existentes

---

# 7. Pipeline

1. coletar dados
2. normalizar
3. salvar em opportunities
4. disparar análise IA

---

# 8. Tabela opportunities

Campos principais:

id  
title  
category  
current_bid  
market_value  
roi_percentage  
score  
risk_level  
auction_url  
created_at  

---

# 9. Segurança

Evitar bloqueios:

- rate limit
- proxies rotativos
- delays aleatórios

---

# 10. Evolução futura

Fases posteriores:

- scraping distribuído
- cluster de coleta
- monitoramento automático
