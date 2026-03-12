/**
 * GARIMPO IA™ — Admin: Insert Opportunity (Phase 2)
 *
 * Simple form to insert one opportunity. Requires auth.
 * Score and ai_analysis can be filled later by the AI pipeline.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabaseClient';
import { triggerRunAiAnalysis, isRunAiAnalysisConfigured } from '@/services/runAiAnalysis';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { OpportunityCategory } from '@/types';

const CATEGORIES: OpportunityCategory[] = ['vehicle', 'property', 'agriculture', 'machinery', 'electronics', 'other'];

const defaultForm = {
  title: '',
  category: 'vehicle' as OpportunityCategory,
  location: '',
  state: '',
  year: '',
  current_bid: '',
  market_value: '',
  auction_source: '',
  auction_url: '',
  closes_at: '',
};

export function AdminOpportunityPage() {
  const { isAuthenticated } = useApp();
  const { addToast } = useToast();
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !isAuthenticated) {
      addToast({ type: 'error', title: 'Faça login para continuar.' });
      return;
    }

    const current_bid = Number(form.current_bid);
    const market_value = Number(form.market_value);
    if (Number.isNaN(current_bid) || Number.isNaN(market_value) || current_bid < 0 || market_value < 0) {
      addToast({ type: 'error', title: 'Lance e valor de mercado devem ser números positivos.' });
      return;
    }

    const closesAt = form.closes_at ? new Date(form.closes_at).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    setSubmitting(true);
    try {
      const { data: inserted, error } = await supabase
        .from('opportunities')
        .insert({
          title: form.title.trim(),
          category: form.category,
          location: form.location.trim(),
          state: form.state.trim().toUpperCase().slice(0, 2),
          year: form.year ? Number(form.year) : null,
          current_bid,
          market_value,
          auction_source: form.auction_source.trim() || 'Manual',
          auction_url: form.auction_url.trim() || '',
          closes_at: closesAt,
          score: 0,
          risk_level: 'medium',
          liquidity: 'medium',
        })
        .select('id')
        .single();

      if (error) throw error;
      addToast({ type: 'success', title: 'Oportunidade inserida.' });
      setForm(defaultForm);

      if (inserted?.id && isRunAiAnalysisConfigured()) {
        triggerRunAiAnalysis(inserted.id).then(
          () => addToast({ type: 'success', title: 'Análise IA em andamento. Score e alertas serão atualizados em breve.' }),
          () => { /* non-blocking */ },
        );
      }
    } catch (err) {
      addToast({ type: 'error', title: err instanceof Error ? err.message : 'Erro ao inserir.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-center">
        <p className="font-body text-foreground-muted">Acesso restrito. Faça login.</p>
        <Button variant="primary" className="mt-4" asChild>
          <Link to="/login">Entrar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="font-display mb-6 text-2xl font-bold text-foreground">
        Admin — Inserir oportunidade
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block font-body text-xs text-foreground-muted">Título</label>
          <Input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ex: Fiat Uno 2015" />
        </div>
        <div>
          <label className="mb-1 block font-body text-xs text-foreground-muted">Categoria</label>
          <select
            className="flex h-10 w-full rounded-md border border-border bg-background-surface px-3 py-2 font-body text-sm text-foreground"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as OpportunityCategory }))}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block font-body text-xs text-foreground-muted">Localização</label>
          <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Cidade" />
        </div>
        <div>
          <label className="mb-1 block font-body text-xs text-foreground-muted">Estado (UF)</label>
          <Input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} placeholder="SP" maxLength={2} />
        </div>
        <div>
          <label className="mb-1 block font-body text-xs text-foreground-muted">Ano (opcional)</label>
          <Input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} placeholder="2015" />
        </div>
        <div>
          <label className="mb-1 block font-body text-xs text-foreground-muted">Lance atual (R$)</label>
          <Input type="number" required min={0} value={form.current_bid} onChange={(e) => setForm((f) => ({ ...f, current_bid: e.target.value }))} placeholder="25000" />
        </div>
        <div>
          <label className="mb-1 block font-body text-xs text-foreground-muted">Valor de mercado (R$)</label>
          <Input type="number" required min={0} value={form.market_value} onChange={(e) => setForm((f) => ({ ...f, market_value: e.target.value }))} placeholder="32000" />
        </div>
        <div>
          <label className="mb-1 block font-body text-xs text-foreground-muted">Fonte do leilão</label>
          <Input value={form.auction_source} onChange={(e) => setForm((f) => ({ ...f, auction_source: e.target.value }))} placeholder="Ex: Manual" />
        </div>
        <div>
          <label className="mb-1 block font-body text-xs text-foreground-muted">URL do leilão</label>
          <Input type="url" value={form.auction_url} onChange={(e) => setForm((f) => ({ ...f, auction_url: e.target.value }))} placeholder="https://..." />
        </div>
        <div>
          <label className="mb-1 block font-body text-xs text-foreground-muted">Data de fechamento (ISO ou vazio = +7 dias)</label>
          <Input type="datetime-local" value={form.closes_at} onChange={(e) => setForm((f) => ({ ...f, closes_at: e.target.value }))} />
        </div>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Inserindo...' : 'Inserir oportunidade'}
        </Button>
      </form>

      <p className="mt-8">
        <Link to="/" className="font-body text-sm text-foreground-muted hover:text-foreground">
          ← Voltar ao feed
        </Link>
      </p>
    </div>
  );
}
