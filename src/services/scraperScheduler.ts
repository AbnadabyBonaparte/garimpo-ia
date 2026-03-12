/**
 * GARIMPO IA™ — Scraper Scheduler (Phase 4)
 *
 * Entry points for cron / Supabase scheduled function / Vercel cron.
 * scheduleDailyScrape and scheduleHourlyScrape run the pipeline; caller is responsible for invoking at the desired frequency.
 */

import { scheduleScrapers } from '@/services/scraperPipeline';

/**
 * Run the full scraper pipeline (all active sources).
 * Call this from:
 * - Vercel Cron: vercel.json "crons": [{ "path": "/api/cron/scrape", "schedule": "0 * * * *" }]
 * - Supabase pg_cron: select net.http_post(...) or Edge Function on schedule
 * - External cron: GET/POST to a protected API route that calls this
 */
export async function runScheduledScrape(): Promise<Awaited<ReturnType<typeof scheduleScrapers>>> {
  return scheduleScrapers();
}

/**
 * Schedule daily scrape — run once per day (e.g. 6:00 AM).
 * Returns a cron expression for reference; actual scheduling is done by the host.
 */
export function scheduleDailyScrape(): { cronExpression: string; description: string } {
  return {
    cronExpression: '0 6 * * *',
    description: 'Every day at 06:00 UTC',
  };
}

/**
 * Schedule hourly scrape — run every hour.
 */
export function scheduleHourlyScrape(): { cronExpression: string; description: string } {
  return {
    cronExpression: '0 * * * *',
    description: 'Every hour at minute 0',
  };
}
