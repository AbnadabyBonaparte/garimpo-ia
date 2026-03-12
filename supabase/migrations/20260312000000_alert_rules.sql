-- ═══════════════════════════════════════════════════════════════
-- GARIMPO IA™ — Alert Rules (Phase 2)
-- ═══════════════════════════════════════════════════════════════
-- Run in Supabase SQL Editor if not using migrations.

create table if not exists public.alert_rules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  min_score integer not null default 0 check (min_score >= 0 and min_score <= 100),
  categories text[] default '{}',
  states text[] default '{}',
  created_at timestamptz default now()
);

alter table public.alert_rules enable row level security;

create policy "Users can read own alert_rules" on public.alert_rules
  for select using (auth.uid() = user_id);
create policy "Users can insert own alert_rules" on public.alert_rules
  for insert with check (auth.uid() = user_id);
create policy "Users can update own alert_rules" on public.alert_rules
  for update using (auth.uid() = user_id);
create policy "Users can delete own alert_rules" on public.alert_rules
  for delete using (auth.uid() = user_id);

create index idx_alert_rules_user_id on public.alert_rules(user_id);

-- Allow authenticated users to insert opportunities (admin / manual ingestion)
create policy "Authenticated can insert opportunities" on public.opportunities
  for insert with check (auth.role() = 'authenticated');
