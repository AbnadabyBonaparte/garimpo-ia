-- ═══════════════════════════════════════════════════════════════
-- GARIMPO IA™ — Scraper runs monitoring (Phase 4)
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.scraper_runs (
  id uuid default gen_random_uuid() primary key,
  source_id text not null,
  source_name text not null,
  success boolean not null,
  fetched_count int not null default 0,
  parsed_count int not null default 0,
  inserted_count int not null default 0,
  duplicates_skipped int not null default 0,
  invalid_skipped int not null default 0,
  error_message text,
  duration_ms int not null default 0,
  created_at timestamptz default now()
);

alter table public.scraper_runs enable row level security;

create policy "Anyone can read scraper_runs" on public.scraper_runs
  for select using (true);
create policy "Authenticated can insert scraper_runs" on public.scraper_runs
  for insert with check (auth.role() = 'authenticated');

create index idx_scraper_runs_created_at on public.scraper_runs(created_at desc);
create index idx_scraper_runs_source_id on public.scraper_runs(source_id);
