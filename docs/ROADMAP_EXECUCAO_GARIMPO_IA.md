# 📄 GARIMPO IA™ — Roadmap de Execução Inicial

**Arquivo:** docs/ROADMAP_EXECUCAO_GARIMPO_IA.md  
**Data:** Março 2026  
**Projeto:** GARIMPO IA™  
**Autor:** Curadoria Estratégica ALSHAM

---

## 1. Propósito do Documento

Este documento define o plano de execução realista para o GARIMPO IA™, considerando:

- projeto SaaS
- founder solo
- arquitetura já iniciada
- necessidade de gerar receita cedo
- visão de longo prazo: plataforma de inteligência de mercado para ativos físicos

O objetivo imediato é **sair de protótipo → produto funcional com receita**.

---

## 2. Situação Atual do Projeto

Baseado no documento de engenharia atual:

**Estado geral do produto:**

| Área | Estado |
|------|--------|
| Arquitetura técnica | ✔ Forte |
| Branding | ✔ Forte |
| Visão de produto | ✔ Clara |
| Produto funcional | ⚠ Parcial |
| Usuários | ❌ Nenhum |
| Receita | ❌ Nenhuma |
| Dados reais | ⚠ Limitado |

**Atualmente existe:**

- Feed de oportunidades
- Estrutura React + Vite
- Supabase schema
- Serviço de IA (Gemini)
- Design system
- Estrutura de projeto

Faltam componentes essenciais para SaaS.

---

## 3. Objetivo da Fase Atual

**Objetivo da Fase 1:**

- transformar o sistema em um **SaaS funcional**
- capaz de gerar as **primeiras assinaturas**

**Meta da fase:**

- **10 usuários pagantes**

Essa meta valida:

- valor do produto
- modelo de monetização
- viabilidade do projeto

---

## 4. Loop Fundamental do Produto

Antes de qualquer expansão, o produto precisa ter o **loop completo de conversão**:

```
visitante
    ↓
vê oportunidade com score
    ↓
tenta ver análise completa
    ↓
paywall
    ↓
assina
    ↓
desbloqueia análise
```

Sem esse loop o sistema é apenas um protótipo.

---

## 5. Funcionalidades Prioritárias (MVP Real)

As seguintes páginas devem ser implementadas primeiro.

**Prioridade máxima**

| Rota | Função |
|------|--------|
| `/opportunity/:id` | página de detalhe da oportunidade |
| `/pricing` | planos e assinatura |
| `/login` | autenticação |
| Stripe checkout | monetização |

Essas quatro partes criam o SaaS funcional.

---

## 6. Estrutura da Página de Oportunidade

A página **/opportunity/:id** é o centro do produto.

**Deve conter:**

- **dados básicos**
  - título
  - categoria
  - localização
  - lance atual
  - valor de mercado
  - lucro potencial
  - ROI estimado
- **score**
  - score IA (0–100)
- **análise da IA**
  - resumo da oportunidade
  - riscos identificados
  - recomendação: **strong_buy** | **buy** | **hold** | **avoid**
- **bloqueio para não assinantes**

**Usuários free veem:**

- score
- dados básicos

**Bloqueado:**

- análise completa
- link do leilão
- detalhes do lote

---

## 7. Monetização Inicial

**Planos recomendados:**

| Plano | Preço | Recursos |
|-------|-------|----------|
| Free | R$0 | ver oportunidades com dados limitados |
| Explorer | R$47 | acesso completo a uma vertical |
| Hunter | R$97 | alertas + análise completa |
| Miner | R$197 | múltiplas verticais |

**Integração com:**

- Stripe Checkout

---

## 8. Estratégia de Dados Inicial

O sistema depende de dados.

Por isso a estratégia inicial deve **evitar complexidade**.

**Fase inicial**

- dados podem ser:
  - inseridos manualmente
  - coletados com scrapers existentes
  - curados manualmente
- **Ferramentas possíveis:**
  - Apify
  - n8n
  - scrapers públicos

**Objetivo inicial:**

- **200 oportunidades reais**
- antes do lançamento público.

---

## 9. Primeira Vertical

Para início do projeto recomenda-se focar em **uma vertical**.

**Vertical sugerida:**

- **veículos em leilão**

**Motivos:**

- dados abundantes
- liquidez alta
- mercado grande
- fácil validação

Outras verticais podem vir depois:

- imóveis
- agro
- maquinário

---

## 10. Estratégia de Lançamento

O lançamento **não deve** começar com marketing amplo.

**Primeiro público:**

- comunidades de leilão
- revendedores de carros
- grupos Telegram
- grupos Facebook

**Oferta inicial:**

- **14 dias grátis**
- para os primeiros usuários.

**Objetivo:**

- **50 usuários ativos**

---

## 11. Métricas de Sucesso Inicial

Durante a fase inicial acompanhar:

| Métrica | Meta |
|--------|------|
| Usuários registrados | 100 |
| Usuários ativos | 50 |
| Usuários pagantes | 10 |
| MRR | R$500+ |

Essas métricas já validam o produto.

---

## 12. Evolução do Produto

Após validação do MVP, o sistema evolui em etapas.

**Fase 2**

- alertas personalizados
  - score mínimo
  - categoria
  - localização

**Fase 3**

- inteligência de mercado
  - histórico de preços
  - ROI médio
  - liquidez
  - tendências

**Fase 4**

- plataforma de dados
  - API
  - relatórios
  - dados agregados
  - parcerias

Isso cria o **Bloomberg de ativos físicos**.

---

## 13. Vantagem Competitiva

A verdadeira vantagem do GARIMPO IA **não é software**.

É:

- **o banco de dados histórico acumulado**

Cada leilão registrado adiciona valor ao sistema.

Em longo prazo o ativo principal será:

- **histórico de preços e oportunidades**

---

## 14. Regras de Execução

Para manter foco do projeto:

- evitar novas features antes do loop de conversão
- priorizar dados reais
- lançar imperfeito
- validar com usuários reais

---

## 15. Visão de Longo Prazo

O objetivo final do projeto é construir:

**plataforma de inteligência de mercado**  
**para ativos físicos no Brasil**

Similar a:

- Bloomberg
- PitchBook
- Zillow
- CoStar

---

## 16. Próximos Passos Imediatos

**Ordem de execução recomendada:**

1. implementar `/opportunity/:id`
2. implementar `/pricing`
3. integrar Stripe
4. ativar login
5. inserir primeiras 200 oportunidades

Depois disso o produto pode ser lançado.

---

## Conclusão

O GARIMPO IA já possui:

- visão forte
- arquitetura sólida
- branding profissional

O próximo passo é simples:

**transformar o protótipo**  
**em um SaaS funcional**

com usuários reais e receita inicial.
