# GARIMPO IA™ — MANUAL DO ESCRITÓRIO
## Guia de Configuração para Produção

> Este documento lista TUDO que a equipe precisa fazer para colocar o Garimpo IA™
> em produção. O código está 100% pronto. Falta apenas infraestrutura e contas.

---

## CHECKLIST GERAL

- [ ] 1. Criar projeto no Supabase
- [ ] 2. Executar schema SQL no Supabase
- [ ] 3. Configurar autenticação no Supabase
- [ ] 4. Criar conta Google AI Studio (Gemini)
- [ ] 5. Criar conta Stripe
- [ ] 6. Configurar variáveis de ambiente no Vercel
- [ ] 7. Deploy das Edge Functions no Supabase
- [ ] 8. Configurar domínio personalizado
- [ ] 9. Criar primeiro usuário admin
- [ ] 10. Teste final de ponta a ponta

---

## 1. SUPABASE (Banco de Dados + Auth)

### Criar o projeto
1. Acesse https://supabase.com e crie uma conta (se não tiver)
2. Clique em "New Project"
3. Nome: `garimpo-ia`
4. Região: São Paulo (sa-east-1) — mais próximo do Brasil
5. Senha do banco: gere uma senha forte e GUARDE
6. Plano: **Free** (suficiente para começar — 500MB, 2GB transfer)
7. Aguarde a criação (~2 minutos)

### Após criar, anote:
- **Project URL:** `https://xxxx.supabase.co` (Settings → API → Project URL)
- **Anon Key:** `eyJhbG...` (Settings → API → `anon` `public`)
- **Service Role Key:** `eyJhbG...` (Settings → API → `service_role` — SECRETA, nunca exponha)

### Executar o schema SQL
1. No Supabase, vá em **SQL Editor**
2. Abra o arquivo `supabase/schema.sql` do repositório
3. Cole e execute TODO o conteúdo
4. Depois abra `supabase/migrations/20260313000000_complete_schema_v2.sql`
5. Cole e execute TODO o conteúdo
6. Verifique que as tabelas foram criadas: profiles, opportunities, alerts, alert_rules, watchlist, auction_sources, scraper_runs

### Configurar autenticação
1. No Supabase, vá em **Authentication → Providers**
2. Ative **Email** (já vem ativo por padrão)
3. Em **Authentication → URL Configuration**:
   - Site URL: `https://seu-dominio.com` (ou a URL do Vercel por enquanto)
   - Redirect URLs: adicione `https://seu-dominio.com`, `http://localhost:5173`

### Planos Supabase (quando escalar)

| Plano | Preço | Quando usar |
|-------|-------|-------------|
| Free | $0/mês | MVP, testes, até ~50k rows |
| Pro | $25/mês | Produção com usuários reais, até 8GB |
| Team | $599/mês | Escala grande, suporte prioritário |

**Recomendação:** Comece no Free. Migre para Pro quando tiver 100+ usuários ou o banco passar de 400MB.

---

## 2. GOOGLE AI STUDIO (Gemini — Motor de IA)

### Criar API Key
1. Acesse https://aistudio.google.com/apikey
2. Faça login com conta Google
3. Clique em "Create API Key"
4. Selecione ou crie um projeto no Google Cloud
5. Copie a API Key gerada

### IMPORTANTE: Esta chave é usada APENAS nas Edge Functions (server-side)
- **NUNCA** coloque no frontend
- **NUNCA** coloque em variável `VITE_*`
- Vai ser configurada como secret do Supabase Edge Functions

### Planos e custos Gemini

| Modelo | Preço (input) | Preço (output) | Uso |
|--------|---------------|-----------------|-----|
| Gemini 2.0 Flash | Grátis (até 1500 req/dia) | Grátis | Edge Function (produção) |
| Gemini 2.5 Pro | $1.25/1M tokens | $10/1M tokens | Análises premium (futuro) |

**Recomendação:** Comece com Gemini 2.0 Flash (grátis). O free tier dá 1.500 requisições/dia — suficiente para centenas de análises diárias. Só migre para 2.5 Pro quando a receita justificar.

### Configurar no Supabase
```bash
# No terminal, com Supabase CLI instalado:
supabase secrets set GEMINI_API_KEY=sua-chave-aqui
```

Ou no dashboard: **Edge Functions → Secrets → Add new secret → GEMINI_API_KEY**

---

## 3. STRIPE (Pagamentos)

### Criar conta
1. Acesse https://stripe.com e crie conta
2. Complete a verificação (dados da empresa ALSHAM Commerce Ltda.)
3. Ative o modo de produção quando for lançar

### Chaves necessárias
No dashboard do Stripe (https://dashboard.stripe.com/apikeys):
- **Publishable Key:** `pk_test_...` (ou `pk_live_...` em produção)
- **Secret Key:** `sk_test_...` (ou `sk_live_...` em produção)
- **Webhook Signing Secret:** criado ao configurar webhooks

### Criar produtos no Stripe
No Stripe Dashboard → Products, criar 3 produtos:

| Produto | Preço | Billing |
|---------|-------|---------|
| Garimpo IA Explorer | R$ 47/mês | Recurring/Monthly |
| Garimpo IA Hunter | R$ 97/mês | Recurring/Monthly |
| Garimpo IA Miner | R$ 197/mês | Recurring/Monthly |

Para cada produto, anotar o `price_id` (formato: `price_xxxxx`).

### Configurar webhook
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://seu-projeto.supabase.co/functions/v1/stripe-webhook`
3. Eventos para escutar:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copie o **Webhook Signing Secret** (`whsec_...`)

### Configurar secrets no Supabase
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set STRIPE_PRICE_EXPLORER=price_xxx
supabase secrets set STRIPE_PRICE_HUNTER=price_xxx
supabase secrets set STRIPE_PRICE_MINER=price_xxx
```

### Custos Stripe

| Item | Custo |
|------|-------|
| Taxa por transação | 3.99% + R$0,39 (Brasil) |
| Mensalidade | $0 (sem mensalidade fixa) |
| Chargebacks | $15 por disputa |

---

## 4. VERCEL (Deploy)

### O projeto já está conectado ao Vercel
O repo `garimpo-ia` já tem `vercel.json`. Quando fizer push na `main`, o Vercel deploya automaticamente.

### Configurar variáveis de ambiente no Vercel
No Vercel Dashboard → garimpo-ia → Settings → Environment Variables, adicionar:

| Variável | Valor | Ambiente |
|----------|-------|----------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Production + Preview |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbG...` | Production + Preview |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_live_...` | Production |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_test_...` | Preview |
| `VITE_APP_URL` | `https://seu-dominio.com` | Production |
| `VITE_RUN_AI_ANALYSIS_API_URL` | `https://xxx.supabase.co/functions/v1/run-ai-analysis` | Production + Preview |
| `VITE_STRIPE_CHECKOUT_API_URL` | `https://xxx.supabase.co/functions/v1/create-checkout-session` | Production + Preview |

### Depois de adicionar as variáveis
Clique em "Redeploy" para que o novo build use as variáveis corretas.

### Domínio personalizado
1. Vercel Dashboard → garimpo-ia → Settings → Domains
2. Adicionar: `garimpo.ia` ou `garimpoia.com.br` (o que comprar)
3. Configurar DNS conforme instruções do Vercel

### Custos Vercel

| Plano | Preço | Quando usar |
|-------|-------|-------------|
| Hobby | $0/mês | Desenvolvimento e testes |
| Pro | $20/mês | Produção com domínio custom |

---

## 5. EDGE FUNCTIONS (Supabase)

### Deploy das Edge Functions
As Edge Functions estão em `supabase/functions/`. Para deploy:

```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# Login
supabase login

# Linkar ao projeto
supabase link --project-ref seu-project-ref

# Deploy todas as functions
supabase functions deploy run-ai-analysis
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

### Secrets necessários nas Edge Functions

| Secret | Onde conseguir |
|--------|---------------|
| `GEMINI_API_KEY` | Google AI Studio |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks |
| `STRIPE_PRICE_EXPLORER` | Stripe Dashboard → Products |
| `STRIPE_PRICE_HUNTER` | Stripe Dashboard → Products |
| `STRIPE_PRICE_MINER` | Stripe Dashboard → Products |
| `SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API |
| `ALLOWED_ORIGIN` | URL do seu site (ex: `https://garimpoia.com.br`) |

```bash
# Setar todos de uma vez:
supabase secrets set GEMINI_API_KEY=xxx
supabase secrets set STRIPE_SECRET_KEY=sk_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set STRIPE_PRICE_EXPLORER=price_xxx
supabase secrets set STRIPE_PRICE_HUNTER=price_xxx
supabase secrets set STRIPE_PRICE_MINER=price_xxx
supabase secrets set ALLOWED_ORIGIN=https://garimpoia.com.br
```

---

## 6. PRIMEIRO ADMIN

Depois de tudo configurado:

1. Acesse o site e crie uma conta normal (signup)
2. No Supabase Dashboard → Table Editor → profiles
3. Encontre seu usuário
4. Mude a coluna `role` de `user` para `admin`
5. Mude `subscription_tier` para `miner` (acesso total)
6. Agora você tem acesso à página `/admin/opportunities` para inserir oportunidades manualmente

---

## 7. TESTE FINAL

Execute este checklist antes de lançar:

- [ ] Site acessível na URL do Vercel
- [ ] Signup funciona (criar conta nova)
- [ ] Login funciona
- [ ] Dark/Light mode funciona
- [ ] Página de pricing mostra os 3 planos
- [ ] Clicar em "Assinar" redireciona para Stripe Checkout
- [ ] Após pagamento, `subscription_tier` atualiza no banco
- [ ] Admin consegue inserir oportunidade em `/admin/opportunities`
- [ ] Oportunidade inserida aparece no Feed
- [ ] Análise de IA funciona (score é calculado)
- [ ] Alertas funcionam (criar regra, receber alerta in-app)
- [ ] Analytics mostra dados reais
- [ ] Watchlist funciona (favoritar/desfavoritar)

---

## 8. CUSTOS MENSAIS ESTIMADOS

### Cenário: 0-100 usuários (MVP)

| Serviço | Plano | Custo |
|---------|-------|-------|
| Supabase | Free | R$ 0 |
| Google Gemini | Free tier | R$ 0 |
| Stripe | Pay-per-use | ~3.99% por transação |
| Vercel | Hobby | R$ 0 |
| Domínio | .com.br | ~R$ 40/ano |
| **TOTAL** | | **~R$ 0/mês** (+ taxas Stripe) |

### Cenário: 100-1.000 usuários

| Serviço | Plano | Custo |
|---------|-------|-------|
| Supabase | Pro | ~R$ 150/mês |
| Google Gemini | Pay-per-use | ~R$ 50-200/mês |
| Stripe | Pay-per-use | ~3.99% por transação |
| Vercel | Pro | ~R$ 120/mês |
| **TOTAL** | | **~R$ 320-470/mês** |

### Cenário: 1.000+ usuários

| Serviço | Plano | Custo |
|---------|-------|-------|
| Supabase | Pro/Team | R$ 150-3.500/mês |
| Google Gemini | Pay-per-use | R$ 200-2.000/mês |
| Stripe | Pay-per-use | 3.99% |
| Vercel | Pro | R$ 120/mês |
| Sentry (monitoramento) | ~R$ 150/mês |
| **TOTAL** | | **R$ 620-5.770/mês** |

**A receita com 1.000 assinantes Hunter (R$97/mês) = R$ 97.000/mês.**
O custo operacional máximo seria ~6% da receita. Margem excelente.

---

## 9. O QUE AINDA NÃO EXISTE (ROADMAP FUTURO)

Estas funcionalidades estão documentadas mas NÃO implementadas em código:

| Feature | Prioridade | Quando |
|---------|-----------|--------|
| Scraper real (robô que minera leilões) | Alta | Após primeiros 50 assinantes |
| Notificações por email (Resend/SendGrid) | Alta | Após primeiros 100 assinantes |
| Notificações WhatsApp (Twilio) | Média | Após validar email |
| Notificações Push | Baixa | Após validar WhatsApp |
| Sentry (monitoramento de erros) | Alta | Junto com produção |
| Rate limiting | Média | Quando tiver tráfego real |
| Domínio personalizado | Alta | Antes do lançamento |

---

## 10. CONTATOS E ACESSOS

| Serviço | URL | Quem tem acesso |
|---------|-----|-----------------|
| GitHub | github.com/AbnadabyBonaparte/garimpo-ia | Abnadaby |
| Vercel | vercel.com/dashboard | Abnadaby |
| Supabase | supabase.com/dashboard | [a criar] |
| Stripe | dashboard.stripe.com | [a criar] |
| Google AI Studio | aistudio.google.com | [a criar] |

---

**Documento criado em:** 2026-03-16  
**Versão:** 1.0  
**Próxima revisão:** Quando criar as contas dos serviços
