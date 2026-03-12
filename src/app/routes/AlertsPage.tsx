/**
 * GARIMPO IA™ — Alerts Page (Phase 2)
 *
 * List alert rules and create new ones (min_score, category, state).
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAlertRules } from '@/hooks/useAlertRules';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/components/ui/StateDisplay';
import { getCategoryLabel } from '@/lib/utils';
import type { OpportunityCategory } from '@/types';

const CATEGORIES: { value: OpportunityCategory; label: string }[] = [
  { value: 'vehicle', label: 'Veículos' },
  { value: 'property', label: 'Imóveis' },
  { value: 'agriculture', label: 'Agro' },
  { value: 'machinery', label: 'Maquinário' },
];

export function AlertsPage() {
  const { isAuthenticated } = useApp();
  const { rules, isLoading, isError, error, createRule, deleteRule, refetch } = useAlertRules();
  const { addToast } = useToast();

  const [minScore, setMinScore] = useState(70);
  const [categories, setCategories] = useState<OpportunityCategory[]>([]);
  const [states, setStates] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleCategory = (cat: OpportunityCategory) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createRule({
        min_score: minScore,
        categories,
        states: states ? states.split(',').map((s) => s.trim()).filter(Boolean) : [],
      });
      addToast({ type: 'success', title: 'Regra de alerta criada.' });
      setCategories([]);
      setStates('');
    } catch (err) {
      addToast({ type: 'error', title: err instanceof Error ? err.message : 'Erro ao criar.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRule(id);
      addToast({ type: 'success', title: 'Regra removida.' });
    } catch (err) {
      addToast({ type: 'error', title: err instanceof Error ? err.message : 'Erro ao remover.' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="font-body text-foreground-muted">
          Faça login para configurar alertas.
        </p>
        <Button variant="primary" className="mt-4" asChild>
          <Link to="/login">Entrar</Link>
        </Button>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <ErrorState message={error ?? undefined} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display mb-6 text-2xl font-bold text-foreground">
        Alertas
      </h1>
      <p className="mb-6 font-body text-sm text-foreground-muted">
        Receba notificações quando surgirem oportunidades que atendam aos critérios.
      </p>

      <form onSubmit={handleCreate} className="mb-8 rounded-lg border border-border bg-background-surface p-6">
        <h2 className="font-display mb-4 text-lg font-semibold text-foreground">
          Nova regra
        </h2>
        <div className="mb-4">
          <label className="mb-1 block font-body text-xs text-foreground-muted">
            Score mínimo (0–100)
          </label>
          <Input
            type="number"
            min={0}
            max={100}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value) || 0)}
          />
        </div>
        <div className="mb-4">
          <span className="mb-2 block font-body text-xs text-foreground-muted">
            Categorias
          </span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => toggleCategory(cat.value)}
                className={`rounded-full border px-3 py-1.5 text-xs ${
                  categories.includes(cat.value)
                    ? 'border-amber bg-amber/10 text-amber'
                    : 'border-border text-foreground-muted hover:border-foreground-muted'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="mb-1 block font-body text-xs text-foreground-muted">
            Estados (siglas separadas por vírgula, ex: SP, MG)
          </label>
          <Input
            type="text"
            placeholder="SP, MG, RJ"
            value={states}
            onChange={(e) => setStates(e.target.value)}
          />
        </div>
        <Button type="submit" variant="primary" disabled={submitting}>
          <Plus className="h-4 w-4" />
          Criar regra
        </Button>
      </form>

      <h2 className="font-display mb-4 text-lg font-semibold text-foreground">
        Suas regras
      </h2>
      {isLoading ? (
        <p className="font-body text-sm text-foreground-muted">Carregando...</p>
      ) : rules.length === 0 ? (
        <p className="font-body text-sm text-foreground-muted">
          Nenhuma regra. Crie uma acima.
        </p>
      ) : (
        <ul className="space-y-3">
          {rules.map((rule) => (
            <li
              key={rule.id}
              className="flex items-center justify-between rounded-lg border border-border bg-background-surface p-4"
            >
              <div>
                <span className="font-mono-data text-sm font-semibold text-foreground">
                  Score ≥ {rule.min_score}
                </span>
                {rule.categories?.length > 0 && (
                  <span className="ml-2 font-body text-xs text-foreground-muted">
                    {rule.categories.map(getCategoryLabel).join(', ')}
                  </span>
                )}
                {rule.states?.length > 0 && (
                  <span className="ml-2 font-body text-xs text-foreground-muted">
                    · {rule.states.join(', ')}
                  </span>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)}>
                <Trash2 className="h-4 w-4 text-red" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8">
        <Link to="/" className="font-body text-sm text-foreground-muted hover:text-foreground">
          ← Voltar ao feed
        </Link>
      </p>
    </div>
  );
}
