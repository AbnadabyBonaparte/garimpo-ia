/**
 * GARIMPO IA™ — App Root
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { Header } from '@/components/layout/Header';
import { FeedPage } from '@/app/routes/FeedPage';

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
                {/* Future routes:
                <Route path="/opportunity/:id" element={<OpportunityDetailPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                */}
              </Routes>
            </main>
          </div>
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
