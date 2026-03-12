-- ═══════════════════════════════════════════════════════════════
-- GARIMPO IA™ — Watchlist (Phase 3)
-- user_id, opportunity_id, created_at
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.watchlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  opportunity_id uuid references public.opportunities(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, opportunity_id)
);

alter table public.watchlist enable row level security;

create policy "Users can read own watchlist" on public.watchlist
  for select using (auth.uid() = user_id);
create policy "Users can insert own watchlist" on public.watchlist
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own watchlist" on public.watchlist
  for delete using (auth.uid() = user_id);

create index idx_watchlist_user_id on public.watchlist(user_id);
create index idx_watchlist_opportunity_id on public.watchlist(opportunity_id);
