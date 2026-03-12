# GARIMPO IA™ — Phase 2 Verification & Phase 3 Spec

## STEP 1 — Phase 2 Completion Verification

| System | Status | Notes |
|--------|--------|--------|
| **AI scoring pipeline** | ✅ | `run-ai-analysis` Edge Function: fetch opportunity → Gemini → update score + ai_analysis. |
| **Alerts engine** | ✅ | Inside run-ai-analysis: loads alert_rules, filters by score/category/state, inserts into `alerts` (channel in_app). **Issue:** No duplicate prevention (same user+opportunity can get multiple alerts). |
| **Admin opportunity insertion** | ✅ | AdminOpportunityPage: insert with `.select('id').single()`, then `triggerRunAiAnalysis(inserted.id)` when URL configured. |
| **Notification badge** | ✅ | Header uses `useAlerts()`, `unreadCount`, Link to /alerts with Badge. |
| **Alert rules table** | ✅ | Migration `20260312000000_alert_rules.sql`: table + RLS + policy "Authenticated can insert opportunities". |
| **run-ai-analysis Edge Function** | ✅ | Cache: skip Gemini if `ai_analysis` and score already set. Alerts engine runs after update. |
| **AI caching logic** | ✅ | `if (!analysisText?.trim() \|\| score <= 0)` then call Gemini and update; otherwise reuse. |
| **Profile subscription update** | ✅ | stripe-webhook: checkout.session.completed, customer.subscription.updated/deleted → update profiles.subscription_tier and subscription_expires_at. |

**Risks / improvements:**  
- Prevent duplicate alerts (unique constraint or check before insert).  
- Optional: batch endpoint to process multiple pending opportunities.

---

## Phase 3 Implementation Summary

- **Step 2:** `opportunityIngestion.ts` (createOpportunity, bulkInsertOpportunities, normalizeOpportunityData + trigger AI).
- **Step 3:** Batch AI processing (processPendingOpportunities).
- **Step 4:** `alertEngine.ts` (evaluateAlertRules, dedup).
- **Step 5:** `notifications.ts` (in-app + email-ready).
- **Step 6:** Analytics dashboard `/analytics`.
- **Step 7:** User dashboard `/dashboard`.
- **Step 8:** Watchlist table + UI.
- **Step 9:** Performance (cache, queries, bundle).
- **Step 10:** Next 10 engineering tasks.
