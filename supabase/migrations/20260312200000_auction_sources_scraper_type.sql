-- ═══════════════════════════════════════════════════════════════
-- GARIMPO IA™ — Auction sources: scraper_type + last_run_at (Phase 4)
-- ═══════════════════════════════════════════════════════════════

alter table public.auction_sources
  add column if not exists scraper_type text default 'example_auction',
  add column if not exists last_run_at timestamptz;

comment on column public.auction_sources.scraper_type is 'Identifier of the scraper to use (e.g. example_auction)';

create policy "Authenticated can update auction_sources" on public.auction_sources
  for update using (auth.role() = 'authenticated');
