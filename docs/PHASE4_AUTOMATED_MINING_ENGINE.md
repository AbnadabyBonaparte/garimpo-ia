# GARIMPO IA™ — Phase 4: Automated Mining Engine

**Projeto:** GARIMPO IA  
**Fase:** Phase 4  
**Objetivo:** Automatizar descoberta e ingestão de oportunidades  
**Data:** 2026

---

# 1. Objetivo da Phase 4

Após concluir:

- arquitetura SaaS
- pipeline de IA
- alertas
- watchlist
- analytics
- dashboard
- ingestão manual

o próximo passo é transformar o sistema em um **minerador automático de oportunidades**.

Objetivo principal:

- descobrir oportunidades automaticamente
- analisar com IA
- alertar usuários
- construir base de dados proprietária

---

# 2. Arquitetura atual do sistema

Arquitetura existente:

Frontend (React)  
↓  
Supabase Auth  
↓  
Database  
- profiles  
- opportunities  
- alerts  
- alert_rules  
- watchlist  
↓  
Edge Functions  
- create-checkout-session  
- stripe-webhook  
- run-ai-analysis  
↓  
Services  
- opportunityIngestion  
- aiProcessing  
- alertEngine  
- notifications  
↓  
Stripe  
↓  
Gemini AI  

Essa arquitetura já suporta ingestão automática.

---

# 3. Arquitetura da mineração automática

Nova camada adicionada:

Scrapers  
↓  
Scraper Pipeline  
↓  
Opportunity Normalization  
↓  
Opportunity Ingestion  
↓  
AI Analysis  
↓  
Alert Engine  
↓  
Notifications  
↓  
Users  

---

# 4. Estrutura de scrapers

Nova pasta:

src/scrapers/

Interface base:

```ts
export interface ScraperSource {
  name: string
  fetchRawData(): Promise<any>
  parseOpportunities(data: any): Promise<any[]>
}
