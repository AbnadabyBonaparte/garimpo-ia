-- ═══════════════════════════════════════════════════════════════
-- GARIMPO IA™ — Database Schema (Supabase/Postgres)
-- ═══════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor to set up the database.
-- RLS (Row Level Security) enabled on all tables.
-- ═══════════════════════════════════════════════════════════════

-- ── Profiles (extends auth.users) ──
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'explorer', 'hunter', 'miner')),
  subscription_expires_at timestamptz,
  preferred_categories text[] default '{}',
  preferred_states text[] default '{}',
  notification_whatsapp boolean default false,
  notification_email boolean default true,
  notification_push boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Opportunities ──
create table public.opportunities (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null
    check (category in ('vehicle', 'property', 'agriculture', 'machinery', 'electronics', 'other')),
  score integer not null default 0 check (score >= 0 and score <= 100),
  location text not null,
  state text not null,
  year integer,
  current_bid bigint not null,
  market_value bigint not null,
  profit_potential bigint generated always as (market_value - current_bid) stored,
  roi_percentage numeric generated always as (
    case when current_bid > 0
      then round(((market_value - current_bid)::numeric / current_bid) * 100, 1)
      else 0
    end
  ) stored,
  auction_source text not null,
  auction_url text not null,
  closes_at timestamptz not null,
  risk_level text not null default 'medium'
    check (risk_level in ('low', 'medium', 'high')),
  risk_notes text,
  liquidity text not null default 'medium'
    check (liquidity in ('high', 'medium', 'low')),
  ai_analysis text,
  images text[] default '{}',
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.opportunities enable row level security;
-- Public read (cards are visible but locked for non-subscribers)
create policy "Anyone can read opportunities" on public.opportunities
  for select using (true);

-- ── Alerts ──
create table public.alerts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  opportunity_id uuid references public.opportunities(id) on delete cascade not null,
  channel text not null check (channel in ('whatsapp', 'email', 'push', 'in_app')),
  sent_at timestamptz default now(),
  read_at timestamptz
);

alter table public.alerts enable row level security;
create policy "Users can read own alerts" on public.alerts
  for select using (auth.uid() = user_id);
create policy "Users can update own alerts" on public.alerts
  for update using (auth.uid() = user_id);

-- ── Auction Sources ──
create table public.auction_sources (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  url text not null,
  scrape_frequency_minutes integer not null default 60,
  last_scraped_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.auction_sources enable row level security;
create policy "Anyone can read auction sources" on public.auction_sources
  for select using (true);

-- ── Indexes ──
create index idx_opportunities_score on public.opportunities(score desc);
create index idx_opportunities_category on public.opportunities(category);
create index idx_opportunities_state on public.opportunities(state);
create index idx_opportunities_closes_at on public.opportunities(closes_at);
create index idx_opportunities_created_at on public.opportunities(created_at desc);
create index idx_alerts_user_id on public.alerts(user_id);

-- ── Updated_at trigger ──
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger update_opportunities_updated_at
  before update on public.opportunities
  for each row execute function public.update_updated_at();
