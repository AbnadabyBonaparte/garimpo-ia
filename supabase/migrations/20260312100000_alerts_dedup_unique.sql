-- ═══════════════════════════════════════════════════════════════
-- GARIMPO IA™ — Alerts: prevent duplicate (user, opportunity, channel)
-- Phase 3
-- ═══════════════════════════════════════════════════════════════

create unique index if not exists idx_alerts_user_opportunity_channel
  on public.alerts (user_id, opportunity_id, channel);
