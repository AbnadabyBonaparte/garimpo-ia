# SCRAPER_STRATEGY.md

# GARIMPO IA™ — Scraper Strategy

**Objetivo:** minerar oportunidades de mercado automaticamente  
**Tipo:** arquitetura de scraping escalável

---

# 1. Visão Geral

Pipeline:


source
↓
scraper
↓
raw data
↓
parse
↓
normalize
↓
validate
↓
insert
↓
AI scoring


---

# 2. Interface padrão de scraper

Todos os scrapers devem implementar:


ScraperSource


Interface:


id
name
baseUrl

fetchRawData()
parseOpportunities()
normalizeData()


---

# 3. Scrapers prioritários

Fase inicial:


superbid
copart
caixa leilões
olx veículos
mercado livre
webmotors
icarros


---

# 4. Estratégia de execução

Pipeline:


runScraper()
↓
fetch
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


---

# 5. Deduplicação

Estratégia:


hash(
auction_url
title
auction_source
closes_at
)


---

# 6. Validação

Campos obrigatórios:


title
category
auction_url
closes_at


---

# 7. Agendamento

Scrapers devem rodar automaticamente.

Exemplo:


hourly scraping
daily scraping


---

# 8. Controle de requisições

Para evitar bloqueio:


request throttling
delay aleatório
proxy rotation
retry automático


---

# 9. Monitoramento

Registrar:


runs
erros
tempo de execução
itens coletados


Tabela:


scraper_runs


---

# 10. Evolução futura

Fases avançadas:


headless browser scraping
distributed crawling
AI-assisted parsing


---

# 11. Objetivo estratégico

Scrapers não são o ativo principal.

Eles são **apenas o motor que alimenta o dataset**.
