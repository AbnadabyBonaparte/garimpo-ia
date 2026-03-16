-- ═══════════════════════════════════════════════════════════════
-- GARIMPO IA™ — Complete Schema v2
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Role + stripe_customer_id em profiles ──────────────────
alter table public.profiles
  add column if not exists role text not null default 'user'
    check (role in ('user', 'admin'));

alter table public.profiles
  add column if not exists stripe_customer_id text;

-- ── 2. Tabela watchlist ───────────────────────────────────────
create table if not exists public.watchlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  opportunity_id uuid references public.opportunities(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, opportunity_id)
);

alter table public.watchlist enable row level security;

drop policy if exists "Users manage own watchlist" on public.watchlist;
create policy "Users manage own watchlist" on public.watchlist
  for all using (auth.uid() = user_id);

-- ── 3. Tabela alert_rules (atualizada com novos campos) ───────
create table if not exists public.alert_rules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  min_score integer not null default 0 check (min_score >= 0 and min_score <= 100),
  min_roi numeric not null default 0,
  categories text[] default '{}',
  states text[] default '{}',
  channels text[] default '{in_app}',
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.alert_rules enable row level security;

drop policy if exists "Users can read own alert_rules" on public.alert_rules;
drop policy if exists "Users can insert own alert_rules" on public.alert_rules;
drop policy if exists "Users can update own alert_rules" on public.alert_rules;
drop policy if exists "Users can delete own alert_rules" on public.alert_rules;
drop policy if exists "Users manage own rules" on public.alert_rules;

create policy "Users manage own alert_rules" on public.alert_rules
  for all using (auth.uid() = user_id);

-- Adicionar colunas novas se a tabela já existe mas sem elas
alter table public.alert_rules
  add column if not exists min_roi numeric not null default 0;
alter table public.alert_rules
  add column if not exists channels text[] default '{in_app}';
alter table public.alert_rules
  add column if not exists is_active boolean default true;

-- ── 4. Tabela scraper_runs ────────────────────────────────────
create table if not exists public.scraper_runs (
  id uuid default gen_random_uuid() primary key,
  source_id uuid references public.auction_sources(id),
  started_at timestamptz default now(),
  finished_at timestamptz,
  status text default 'running' check (status in ('running', 'success', 'failed')),
  opportunities_found integer default 0,
  opportunities_new integer default 0,
  error_message text
);

alter table public.scraper_runs enable row level security;

create policy "Admins can read scraper_runs" on public.scraper_runs
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── 5. Unique index em alerts (dedup) ─────────────────────────
create unique index if not exists idx_alerts_user_opportunity_channel
  on public.alerts (user_id, opportunity_id, channel);

-- ── 6. Indexes de performance ─────────────────────────────────
create index if not exists idx_opportunities_active_score
  on public.opportunities(score desc)
  where closes_at > now();

create index if not exists idx_watchlist_user
  on public.watchlist(user_id);

create index if not exists idx_watchlist_opportunity
  on public.watchlist(opportunity_id);

create index if not exists idx_alert_rules_user
  on public.alert_rules(user_id);

create index if not exists idx_alert_rules_active
  on public.alert_rules(user_id) where is_active = true;

create index if not exists idx_scraper_runs_source
  on public.scraper_runs(source_id);

-- ── 7. Fix RLS: só admin insere/atualiza/deleta opportunities ──
drop policy if exists "Authenticated can insert opportunities" on public.opportunities;
drop policy if exists "Only admins can insert opportunities" on public.opportunities;

create policy "Only admins can insert opportunities" on public.opportunities
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can update opportunities" on public.opportunities
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can delete opportunities" on public.opportunities
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── 8. RPC Functions para Analytics ──────────────────────────
create or replace function get_analytics_summary()
returns json
language sql
security definer
as $$
  select json_build_object(
    'total_opportunities', count(*),
    'avg_score',           round(coalesce(avg(score), 0)::numeric, 1),
    'avg_roi',             round(coalesce(avg(roi_percentage), 0)::numeric, 1),
    'total_potential_profit', coalesce(sum(profit_potential), 0),
    'active_count',        count(*) filter (where closes_at > now()),
    'high_score_count',    count(*) filter (where score >= 70)
  )
  from public.opportunities;
$$;

create or replace function get_category_distribution()
returns json
language sql
security definer
as $$
  select coalesce(json_agg(row_to_json(t)), '[]'::json)
  from (
    select
      category,
      count(*)::int as count,
      round(coalesce(avg(score), 0)::numeric, 1) as avg_score,
      round(coalesce(avg(roi_percentage), 0)::numeric, 1) as avg_roi
    from public.opportunities
    group by category
    order by count desc
  ) t;
$$;

create or replace function get_state_distribution()
returns json
language sql
security definer
as $$
  select coalesce(json_agg(row_to_json(t)), '[]'::json)
  from (
    select
      state,
      count(*)::int as count,
      round(coalesce(avg(score), 0)::numeric, 1) as avg_score
    from public.opportunities
    group by state
    order by count desc
    limit 15
  ) t;
$$;

create or replace function get_score_history()
returns json
language sql
security definer
as $$
  select coalesce(json_agg(row_to_json(t)), '[]'::json)
  from (
    select
      date_trunc('day', created_at)::date as day,
      round(coalesce(avg(score), 0)::numeric, 1) as avg_score,
      count(*)::int as count
    from public.opportunities
    where created_at > now() - interval '30 days'
    group by day
    order by day
  ) t;
$$;

-- ── 9. Grants para anon/authenticated acessar RPCs ───────────
grant execute on function get_analytics_summary() to anon, authenticated;
grant execute on function get_category_distribution() to anon, authenticated;
grant execute on function get_state_distribution() to anon, authenticated;
grant execute on function get_score_history() to anon, authenticated;
