# GARIMPO IA™ — MVP Audit & Gap Analysis

**Role:** Senior SaaS Architect & Code Auditor  
**Date:** March 2026  
**Scope:** Full repository scan for MVP launch readiness

---

# OUTPUT 1 — PROJECT MAP

## Pages (routes)

| File | Purpose |
|------|--------|
| `src/app/routes/FeedPage.tsx` | **Only implemented page.** Feed of opportunities: category filters, `useOpportunities` hook, loading/error/empty states, grid of `OpportunityCard`. Renders `isSubscriber` from `profile?.subscription_tier !== 'free'`. Does **not** pass `onViewAnalysis` or `onSubscribe` to cards (CTAs are no-ops). |

**Other routes:** Declared in comments in `App.tsx` only (not implemented): `/opportunity/:id`, `/alerts`, `/analytics`, `/profile`, `/login`, `/pricing`.

---

## Components

| Path | Purpose |
|------|--------|
| `src/components/layout/Header.tsx` | Logo, nav links (Feed, Alertas, Analytics), theme toggle, conditional "Entrar" or Bell/User icons. Uses `<a href="/login">` (no React Router Link). |
| `src/components/cards/OpportunityCard.tsx` | Card UI: score badge, category, title, location, bid/market value/ROI, liquidity/risk badges, timer, CTA. Props: `opportunity`, `isUnlocked`, optional `onViewAnalysis`, `onSubscribe`. Locked overlay for non-subscribers. **Callbacks not wired from FeedPage.** |
| `src/components/ui/Button.tsx` | CVA-based button (primary, secondary, danger, ghost, outline; sm, md, lg, icon). Uses Radix Slot for `asChild`. |
| `src/components/ui/Badge.tsx` | CVA badge (high, medium, low, ai, new). |
| `src/components/ui/Skeleton.tsx` | Pulse skeleton + `OpportunityCardSkeleton` for loading state. |
| `src/components/ui/StateDisplay.tsx` | `ErrorState` (message + retry button), `EmptyState` (title, description, action button). |
| `src/components/ai/` | **Empty folder.** No AI-specific UI components. |

---

## Services

| File | Purpose |
|------|--------|
| `src/services/aiAnalysis.ts` | `analyzeOpportunity(request: AIAnalysisRequest)` → calls Google Gemini 2.5 Pro, returns `AIAnalysisResponse` (score, summary, risks, recommendation, estimated_total_cost, estimated_net_profit). Throws if `VITE_GEMINI_API_KEY` not set. **Not used by any page or component** (no UI calls it). |

---

## Contexts

| File | Purpose |
|------|--------|
| `src/contexts/AppContext.tsx` | Session, profile, `isAuthenticated`, `isLoading`, `signIn`, `signUp`, `signOut`, theme, `toggleTheme`. Fetches profile from `profiles` when session exists. Handles `supabase === null` (no auth when env missing). |
| `src/contexts/ToastContext.tsx` | In-memory toasts: `toasts`, `addToast`, `removeToast`. **Not using Radix Toast** (custom implementation). |

---

## Hooks

| File | Purpose |
|------|--------|
| `src/hooks/useOpportunities.ts` | Fetches opportunities from Supabase `opportunities` with filters (categories, states, min_score, max_score, min_roi, sort). Returns `data`, `isLoading`, `isError`, `isEmpty`, `error`, `refetch`. Returns empty state when `supabase` is null. |

---

## Database / backend

| File | Purpose |
|------|--------|
| `supabase/schema.sql` | Postgres schema: `profiles` (auth extension, subscription_tier, preferences, notifications), `opportunities` (full opportunity fields, RLS select for all), `alerts` (user_id, opportunity_id, channel), `auction_sources` (scraper config). Triggers: `handle_new_user`, `update_updated_at`. Indexes on opportunities (score, category, state, closes_at, created_at), alerts (user_id). **No `subscriptions` or `stripe_customers` table.** |

---

## Lib / config

| File | Purpose |
|------|--------|
| `src/lib/supabaseClient.ts` | Single Supabase client; `null` when `VITE_SUPABASE_*` not set. |
| `src/lib/env.ts` | Zod-validated env (all optional): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, `STRIPE_PUBLIC_KEY`, `APP_URL`. `isSupabaseConfigured()`. |
| `src/lib/utils.ts` | `cn()`, `formatBRL`, `formatPercent`, `formatTimeRemaining`, `getCategoryLabel`, `getCategoryEmoji`. |
| `src/types/index.ts` | SSOT types: Opportunity, UserProfile, Alert, AuctionSource, AsyncState, PaginatedResponse, FilterOptions, AIAnalysisRequest/Response, ToastMessage, enums. |
| `vite.config.ts` | React plugin, `@` alias, manual chunks (vendor, supabase, charts, motion). |
| `vercel.json` | Build command, output `dist`, headers (CSP, X-Frame-Options, etc.), SPA rewrites. |
| `.env.example` | Documents `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_API_KEY`, `VITE_STRIPE_PUBLIC_KEY`, `VITE_APP_URL`. |

---

## Configuration files (root)

| File | Purpose |
|------|--------|
| `package.json` | Dependencies: React 19, Vite 6, TS, Tailwind, Supabase, Gemini, **Stripe** (unused in code), Framer Motion, Radix (Dialog, Dropdown, Toast, Tooltip, Slot — only Slot used), CVA, Zod, date-fns, **recharts** (unused). Scripts: audit:colors, audit:mocks, audit:tailwind, audit:full. |
| `tsconfig.json` | TypeScript config. |
| `tailwind.config.ts` | Tailwind + theme extension (design tokens). |
| `index.html` | Entry HTML, `data-theme="dark"`, fonts, favicon. |
| `src/main.tsx` | Bootstrap: dynamic import of App; on failure renders `EnvErrorScreen` (env instructions). |
| `src/App.tsx` | Router, providers, Header, single route `/` → FeedPage. |

---

# OUTPUT 2 — MVP GAP ANALYSIS

## What is already implemented

- **Architecture:** React 19, Vite 6, TypeScript, Tailwind, design tokens (theme.css), CVA components.
- **Auth:** Supabase Auth wired in AppContext (getSession, onAuthStateChange, signIn, signUp, signOut, profile fetch). Works when Supabase env is set.
- **Data layer:** Single Supabase client, RLS-ready schema (profiles, opportunities, alerts, auction_sources).
- **Feed:** One page with real Supabase query, filters (category), loading/error/empty states, opportunity cards with score and paywall-style overlay for non-subscribers.
- **AI service:** Gemini analysis function implemented and typed; not connected to any UI.
- **Theme:** Dark/light toggle and persistence.
- **Env:** Optional env vars; app runs without backend configured.

## What is partially implemented

- **Paywall / subscription:** Card shows locked state and “Assinar” but no navigation to pricing, no Stripe, and `onSubscribe` / `onViewAnalysis` are never passed from FeedPage — **buttons do nothing**.
- **Navigation:** Header links to `/alerts`, `/analytics`, `/login` but those routes do not exist (404 or SPA fallback to same layout with empty main).
- **Profile:** Fetched and stored in context; no profile page or settings UI.
- **Stripe:** In dependencies and env; **zero usage** in codebase.

## What is missing

- **Opportunity detail page** (`/opportunity/:id`): Does not exist. No fetch by id, no display of full analysis, no paywall on detail.
- **Login page** (`/login`): Does not exist. Only header “Entrar” link.
- **Pricing page** (`/pricing`): Does not exist. No plan selection, no Stripe Checkout.
- **Stripe integration:** No `loadStripe`, no checkout session, no webhook handler, no subscription status sync to `profiles.subscription_tier`.
- **Paywall logic:** No centralized “can view full analysis” check; card only uses `isSubscriber` from profile. No redirect to pricing when user tries to unlock.
- **Alert system:** Table and types exist; no UI to list alerts, create alert rules, or send notifications (WhatsApp, email, push).
- **Scraper integration:** No code calling n8n/Apify or writing into `opportunities`; schema and docs only.
- **AI scoring pipeline:** No job or UI that (1) takes an opportunity, (2) calls `analyzeOpportunity`, (3) writes score/ai_analysis back to DB.
- **useOpportunity(id):** No hook to fetch a single opportunity by id for the detail page.
- **React Router Link/navigate:** Feed uses `<a href="/">` and cards have no navigation; no `Link` or `useNavigate` to `/opportunity/:id` or `/pricing`.

---

# OUTPUT 3 — MISSING PAGES (ROUTE STATUS)

| Route | Status | Notes |
|-------|--------|--------|
| `/opportunity/:id` | **Missing** | Commented in App.tsx. No page component, no route, no fetch by id. |
| `/pricing` | **Missing** | Commented. No page, no Stripe. |
| `/login` | **Missing** | Commented. No login form; header links to /login. |
| `/profile` | **Missing** | Commented. No profile/settings page. |
| `/alerts` | **Missing** | Commented. No alerts list or rules UI. |
| `/analytics` | **Missing** | Commented. No analytics dashboard. |

**Summary:** All six routes are **missing**. Only `/` (Feed) exists.

---

# OUTPUT 4 — FEATURES REQUIRED TO LAUNCH (CHECKLIST)

- [ ] **Opportunity detail page** — `/opportunity/:id`, fetch one opportunity, show full data + AI analysis for subscribers.
- [ ] **Wire card to detail** — Pass `onViewAnalysis={(id) => navigate(\`/opportunity/${id}\`)}` (or `<Link>`) from FeedPage to OpportunityCard.
- [ ] **Paywall on detail page** — If not subscriber, show blurred/locked analysis + CTA to pricing.
- [ ] **Pricing page** — `/pricing`, list plans (Free, Explorer, Hunter, Miner), CTA to checkout.
- [ ] **Stripe Checkout** — Create checkout session (e.g. from backend or Supabase Edge Function), redirect to Stripe, return URL handling.
- [ ] **Stripe webhook** — Update `profiles.subscription_tier` and `subscription_expires_at` on subscription events (or sync via Stripe Customer Portal / API).
- [ ] **Login page** — `/login`, form (email/password) calling `signIn`, redirect after success; optional signUp link.
- [ ] **Post-login redirect** — After login, redirect to `/` or intended page.
- [ ] **Subscribe CTA wiring** — Pass `onSubscribe={() => navigate('/pricing')}` (or open checkout) from FeedPage to OpportunityCard.
- [ ] **useOpportunity(id) hook** — Fetch single opportunity by id from Supabase for detail page.
- [ ] **Optional: AI analysis on demand** — Detail page: if opportunity has no `ai_analysis`, call `analyzeOpportunity` and persist to DB (or show loading then result).
- [ ] **Optional: subscriptions table** — If not relying only on Stripe + profile fields, add `subscriptions` table and sync.

---

# OUTPUT 5 — PRIORITY ROADMAP

## Priority 1 — Critical to launch

1. **Opportunity detail page** — Implement `OpportunityDetailPage`, route `/opportunity/:id`, hook `useOpportunity(id)`.
2. **Navigation from feed** — Wire `onViewAnalysis` and `onSubscribe` in FeedPage (navigate to detail or pricing).
3. **Paywall on detail** — Show full content only when `profile?.subscription_tier !== 'free'`; otherwise locked view + “Assinar”.
4. **Login page** — Form + `signIn`/`signUp`, redirect after auth.
5. **Pricing page** — Static or dynamic plan list + “Assinar” → Stripe Checkout.
6. **Stripe Checkout** — At least one product/price (e.g. Hunter R$97/mês), create session, redirect, success/cancel URLs.
7. **Stripe → profile sync** — Webhook or periodic sync to set `subscription_tier` / `subscription_expires_at` in `profiles`.

## Priority 2 — Important

8. **Profile page** — View/edit profile, show subscription status, link to manage subscription (Stripe Customer Portal).
9. **Success/cancel URLs** — After Stripe checkout, land on a thank-you or pricing page and refresh profile.
10. **Error handling** — Toasts or inline errors on login/signUp/checkout failures.
11. **Protected routes** — Optional: redirect unauthenticated users from /profile (or show login prompt).

## Priority 3 — Post-launch

12. **Alert system** — AlertsPage, list alerts, create rules (score, category, state), notify via email/push/WhatsApp.
13. **Analytics page** — Dashboards (e.g. recharts) for trends, ROI, volume.
14. **Scraper pipeline** — Populate `opportunities` (n8n, Apify, or custom).
15. **AI scoring pipeline** — Backfill or real-time scoring with `analyzeOpportunity` and persist to `opportunities`.
16. **Realtime** — Supabase realtime on `opportunities` for live updates (optional).

---

# OUTPUT 6 — ARCHITECTURE RISKS

- **Scalability:** SPA + Supabase is fine for MVP. If traffic grows, consider connection pooling and read replicas; RLS is already in place.
- **Database:** No `subscriptions` table — subscription state lives in `profiles` and (ideally) Stripe. If you need history or multi-plan logic, add a subscriptions table and sync from Stripe.
- **Indexes:** Existing indexes on `opportunities` (score, category, state, closes_at, created_at) and `alerts(user_id)` are adequate for current queries. Add composite indexes if you add filters like (category, score) together.
- **Security:** 
  - RLS on `profiles` and `alerts` is correct (own row only). `opportunities` is public read — intended for feed.
  - Env vars are optional and client-side (VITE_*) — acceptable for Supabase anon key and Stripe publishable key. **Never** put Stripe secret key in frontend.
  - Stripe webhook must verify signature and run in a secure backend (Supabase Edge Function or separate service); not present yet.
- **Environment:** All env vars optional — good for dev; ensure production Vercel has all required vars (Supabase, Gemini, Stripe) set. No server-side env validation at runtime (only client).
- **Broken/non-functional UX:** Feed card “Ver Análise Completa” and “Assinar” do nothing because callbacks are not passed — high user-facing risk until fixed.
- **Schema/type mismatch:** `profiles.preferred_categories` is `text[]` in DB; TypeScript has `OpportunityCategory[]`. Cast or map when reading; ensure insert/update use compatible format.
- **Unused dependencies:** `@stripe/stripe-js` unused; `recharts` unused; `@radix-ui/react-dialog`, `-dropdown-menu`, `-toast`, `-tooltip` unused (only Slot used). Consider removing or planning use to avoid bundle bloat.

---

# OUTPUT 7 — CODE IMPROVEMENTS

- **Folder structure:** Keep current canonic structure. Add `src/app/routes/` for all route components (OpportunityDetailPage, LoginPage, PricingPage, etc.) and optionally `src/features/` later if you split by domain.
- **Type safety:** Types are centralized in `src/types/index.ts`. Ensure DB JSON/arrays (e.g. `ai_analysis` as JSONB if you store full AI response) match types; add runtime parse with Zod if needed for external/API data.
- **Data models:** Consider a single “subscription status” type derived from profile + Stripe (e.g. `getSubscriptionStatus()`) so UI has one source of truth. Add DTOs for Stripe webhook payloads.
- **Error handling:** Wrap `signIn`/`signUp`/checkout in try/catch and call `addToast` (ToastContext) with error message. Add error boundary at route level for detail page (e.g. invalid id).
- **API layer:** Supabase is the API. For Stripe, add a small backend (Supabase Edge Function or Next.js API route) to create checkout sessions and handle webhooks; do not expose secret key. Optionally add `src/services/stripe.ts` that calls your backend to get session URL.
- **AI service:** Add retry/backoff for Gemini; validate Gemini response with Zod against `AIAnalysisResponse` before returning; consider caching in `opportunities.ai_analysis` (or `ai_analyses` table) to avoid repeated calls. Handle rate limits and timeouts.
- **Navigation:** Replace `<a href="/login">` and `<a href="/">` with React Router `<Link to="...">` and use `useNavigate()` for post-login/checkout redirects so SPA state is preserved.
- **Tests:** Add unit tests for `useOpportunities`, `analyzeOpportunity` (mocked Gemini), and integration test for Feed loading/empty/error states.

---

# OUTPUT 8 — NEXT 10 TASKS FOR THE ENGINEER

1. **Implement `useOpportunity(id)` hook** — In `src/hooks/useOpportunity.ts`, fetch one opportunity by id from Supabase (`opportunities` table), return `{ data, isLoading, error, refetch }`. Handle not found (e.g. 404).

2. **Create `OpportunityDetailPage` component** — New file `src/app/routes/OpportunityDetailPage.tsx`. Use `useParams()` to get `id`, call `useOpportunity(id)`. Render loading/error states and, on success, show title, category, location, bid, market value, ROI, score, closes_at, risk/liquidity. Reserve a section for “Análise IA” (summary, risks, recommendation).

3. **Add route `/opportunity/:id`** — In `App.tsx`, import `OpportunityDetailPage` and add `<Route path="/opportunity/:id" element={<OpportunityDetailPage />} />`.

4. **Paywall on detail page** — In `OpportunityDetailPage`, if `!isSubscriber` (from `useApp().profile`), show score and basic data but blur or hide “Análise IA” and auction link; show CTA “Assinar para ver análise” linking to `/pricing`.

5. **Wire FeedPage card actions** — In `FeedPage`, pass `onViewAnalysis={(id) => navigate(\`/opportunity/${id}\`)}` and `onSubscribe={() => navigate('/pricing')}` to each `OpportunityCard`. Use `useNavigate()` from react-router-dom.

6. **Create Login page** — New file `src/app/routes/LoginPage.tsx`: form (email, password), “Entrar” calling `signIn`, “Criar conta” calling `signUp` (with fullName). On success, `navigate('/')` or return URL. Use `useApp()` and `useToast()` for errors.

7. **Add route `/login`** — In `App.tsx`, add `<Route path="/login" element={<LoginPage />} />`. Change Header “Entrar” to `<Link to="/login">`.

8. **Create Pricing page** — New file `src/app/routes/PricingPage.tsx`: list plans (Free R$0, Explorer R$47, Hunter R$97, Miner R$197) with features; each paid plan has “Assinar” button that triggers Stripe Checkout (see task 9).

9. **Integrate Stripe Checkout** — Add backend (e.g. Supabase Edge Function) that creates a Stripe Checkout Session for selected price id and returns `session.url`. In frontend, add `src/services/stripeCheckout.ts`: function `redirectToCheckout(priceIdOrPlanId)` that calls your backend and `window.location.href = session.url`. Use it from Pricing page. Set success/cancel URLs (e.g. `/pricing?success=1` and `/pricing?cancel=1`).

10. **Stripe webhook to update profile** — Implement webhook endpoint (Edge Function or separate API) that on `checkout.session.completed` or `customer.subscription.updated` maps Stripe product/price to tier (explorer/hunter/miner), then updates `profiles.subscription_tier` and `subscription_expires_at` for the customer’s user id (store `user_id` or email in Stripe metadata when creating checkout session). Ensure webhook verifies Stripe signature.

---

*End of MVP Audit & Gap Analysis. Base the implementation order on OUTPUT 5 and OUTPUT 8.*
