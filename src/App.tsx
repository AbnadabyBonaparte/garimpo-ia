/**
 * GARIMPO IA™ — App Root
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { Header } from '@/components/layout/Header';
import { FeedPage } from '@/app/routes/FeedPage';
import { OpportunityDetailPage } from '@/app/routes/OpportunityDetailPage';
import { LoginPage } from '@/app/routes/LoginPage';
import { PricingPage } from '@/app/routes/PricingPage';
import { AlertsPage } from '@/app/routes/AlertsPage';
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
                <Route path="/opportunity/:id" element={<OpportunityDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/admin/opportunities" element={<AdminOpportunityPage />} />
                {/* Future routes:
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                */}
              </Routes>
            </main>
          </div>
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
