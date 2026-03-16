/**
 * GARIMPO IA™ — App Root
 * All routes registered. Navigate to / for unknown paths.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { Header } from '@/components/layout/Header';
import { FeedPage } from '@/app/routes/FeedPage';
import { LoginPage } from '@/app/routes/LoginPage';
import { OpportunityDetailPage } from '@/app/routes/OpportunityDetailPage';
import { AlertsPage } from '@/app/routes/AlertsPage';
import { AnalyticsPage } from '@/app/routes/AnalyticsPage';
import { PricingPage } from '@/app/routes/PricingPage';
import { ProfilePage } from '@/app/routes/ProfilePage';
import { WatchlistPage } from '@/app/routes/WatchlistPage';
import { AdminOpportunityPage } from '@/app/routes/AdminOpportunityPage';

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          <div className="flex min-h-screen flex-col bg-background-deep">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<FeedPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/opportunity/:id" element={<OpportunityDetailPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/watchlist" element={<WatchlistPage />} />
                <Route path="/admin/opportunities" element={<AdminOpportunityPage />} />
                {/* Backwards compat */}
                <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
