/**
 * GARIMPO IA™ — Alerts Page (Redesign)
 *
 * Seção 1: Regras de alerta (CRUD)
 * Seção 2: Alertas recentes (Realtime)
 * LEI 5: Loading/Error/Empty completos.
 */

import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Plus, Trash2, RefreshCw, Loader2, Check, Settings } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { useAlertRules } from '@/hooks/useAlertRules';
import { useAlerts } from '@/hooks/useAlerts';
import { canCreateAlertRule, getPlanPermissions } from '@/lib/permissions';
import { getCategoryLabel, formatTimeRemaining } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Slider } from '@/components/ui/Slider';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { AlertRule, OpportunityCategory, AlertChannel } from '@/types';

const CATEGORIES: OpportunityCategory[] = [
  'vehicle',
  'property',
  'agriculture',
  'machinery',
  'electronics',
  'other',
];
const STATES_BR = [
  'AC',
  'AL',
  'AM',
  'AP',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MG',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'PR',
  'RJ',
  'RN',
  'RO',
  'RR',
  'RS',
  'SC',
  'SE',
  'SP',
  'TO',
];

const CHANNEL_INFO: Record<AlertChannel, { label: string; soon: boolean }> = {
  in_app: { label: 'In-App', soon: false },
  email: { label: 'Email', soon: false },
  whatsapp: { label: 'WhatsApp', soon: true },
  push: { label: 'Push', soon: true },
};

export function AlertsPage() {
  const { isAuthenticated, isLoading: appLoading, profile } = useApp();
  const { addToast } = useToast();
  const tier = profile?.subscription_tier ?? 'free';
  const perms = getPlanPermissions(tier);

  const {
    rules,
    isLoading: rulesLoading,
    error: rulesError,
    createRule,
    deleteRule,
    fetchRules,
  } = useAlertRules();
  const { alerts, unreadCount, markAsRead, loading: alertsLoading } = useAlerts();

  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formCats, setFormCats] = useState<OpportunityCategory[]>([]);
  const [formStates, setFormStates] = useState<string[]>([]);
  const [formMinScore, setFormMinScore] = useState(50);
  const [formMinRoi, setFormMinRoi] = useState(10);
  const [formChannels, setFormChannels] = useState<AlertChannel[]>(['in_app']);
  const [creating, setCreating] = useState(false);

  if (appLoading)
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );

  if (!isAuthenticated) return <Navigate to="/login?returnTo=/alerts" replace />;

  function resetForm() {
    setFormCats([]);
    setFormStates([]);
    setFormMinScore(50);
    setFormMinRoi(10);
    setFormChannels(['in_app']);
  }

  async function handleCreateRule() {
    setCreating(true);
    const ok = await createRule({
      categories: formCats,
      states: formStates,
      min_score: formMinScore,
      min_roi: formMinRoi,
      channels: formChannels,
    });
    setCreating(false);
    if (ok) {
      addToast({ type: 'success', title: 'Regra criada!' });
      resetForm();
      setShowModal(false);
    } else addToast({ type: 'error', title: 'Erro ao criar regra.' });
  }

  async function handleDeleteRule(id: string) {
    setDeletingId(id);
    const ok = await deleteRule(id);
    setDeletingId(null);
    if (ok) addToast({ type: 'success', title: 'Regra removida.' });
    else addToast({ type: 'error', title: 'Erro ao remover regra.' });
  }

  const canCreate = canCreateAlertRule(tier, rules.length);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* ── Seção 1: Regras ── */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
                <Settings className="h-5 w-5 text-amber" /> Minhas Regras de Alerta
              </h1>
              <p className="mt-0.5 font-body text-xs text-foreground-muted">
                {rules.length}/{perms.maxAlertRules} regras usadas
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              disabled={!canCreate}
              onClick={() => {
                if (canCreate) setShowModal(true);
                else
                  addToast({
                    type: 'warning',
                    title: `Limite de ${perms.maxAlertRules} regras no plano ${tier}.`,
                    description: 'Faça upgrade para criar mais regras.',
                  });
              }}
              title={canCreate ? 'Criar nova regra' : 'Limite de regras atingido'}
            >
              <Plus className="h-4 w-4" /> Nova regra
            </Button>
          </div>

          {rulesLoading && (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          )}
          {!rulesLoading && rulesError && (
            <div className="border-red/20 rounded-xl border bg-background-surface p-6 text-center">
              <p className="font-body text-sm text-red">{rulesError}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={fetchRules}>
                <RefreshCw className="mr-2 h-3 w-3" /> Tentar novamente
              </Button>
            </div>
          )}
          {!rulesLoading && !rulesError && rules.length === 0 && (
            <div className="rounded-xl border border-border bg-background-surface p-10 text-center">
              <Bell className="mx-auto mb-3 h-10 w-10 text-foreground-muted" />
              <p className="font-display font-bold text-foreground">
                Nenhuma regra configurada
              </p>
              <p className="mt-1 font-body text-sm text-foreground-muted">
                Crie uma regra para receber alertas quando surgir uma oportunidade que
                combine com você.
              </p>
              {perms.maxAlertRules === 0 && (
                <Button variant="primary" size="sm" className="mt-4" asChild>
                  <Link to="/pricing">Ver planos</Link>
                </Button>
              )}
            </div>
          )}

          {rules.map((rule, i) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              index={i}
              onDelete={() => handleDeleteRule(rule.id)}
              isDeleting={deletingId === rule.id}
            />
          ))}
        </section>

        {/* ── Seção 2: Alertas recentes ── */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
              <Bell className="h-5 w-5 text-cyan" /> Alertas Recentes
            </h2>
            {unreadCount > 0 && <Badge variant="ai">{unreadCount} novos</Badge>}
          </div>

          {alertsLoading && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          )}
          {!alertsLoading && alerts.length === 0 && (
            <div className="rounded-xl border border-border bg-background-surface p-10 text-center">
              <p className="font-body text-sm text-foreground-muted">
                Nenhum alerta ainda. Configure uma regra acima.
              </p>
            </div>
          )}
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to={`/opportunity/${alert.opportunity_id}`}
                onClick={() => {
                  if (!alert.read_at) markAsRead(alert.id);
                }}
                className={`hover:border-amber/50 mb-2 flex items-center justify-between rounded-lg border px-4 py-3 transition-all ${
                  alert.read_at
                    ? 'border-border bg-background-surface opacity-60'
                    : 'border-cyan/30 bg-cyan/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  {!alert.read_at && (
                    <div className="h-2 w-2 animate-pulse rounded-full bg-cyan" />
                  )}
                  <div>
                    <p className="font-body text-sm font-medium text-foreground">
                      Nova oportunidade detectada
                    </p>
                    <p className="font-mono-data text-xs text-foreground-muted">
                      {formatTimeRemaining(alert.sent_at)} atrás
                    </p>
                  </div>
                </div>
                {alert.read_at && <Check className="h-4 w-4 text-green" />}
              </Link>
            </motion.div>
          ))}
        </section>
      </motion.div>

      {/* ── Modal: criar regra ── */}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Nova Regra de Alerta"
        size="lg"
      >
        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
          <div>
            <p className="mb-2 font-body text-xs font-medium text-foreground-muted">
              Categorias (vazio = todas)
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    setFormCats((p) =>
                      p.includes(c) ? p.filter((x) => x !== c) : [...p, c],
                    )
                  }
                  className={`rounded-full border px-3 py-1 font-body text-xs transition-all ${formCats.includes(c) ? 'bg-amber/10 border-amber text-amber' : 'hover:border-amber/50 border-border text-foreground-muted'}`}
                >
                  {getCategoryLabel(c)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 font-body text-xs font-medium text-foreground-muted">
              Estados (vazio = todos)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {STATES_BR.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    setFormStates((p) =>
                      p.includes(s) ? p.filter((x) => x !== s) : [...p, s],
                    )
                  }
                  className={`font-mono-data rounded border px-2 py-0.5 text-xs transition-all ${formStates.includes(s) ? 'bg-cyan/10 border-cyan text-cyan' : 'hover:border-cyan/50 border-border text-foreground-muted'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <Slider
            label="Score mínimo"
            min={0}
            max={100}
            value={formMinScore}
            onChange={(e) => setFormMinScore(Number(e.target.value))}
          />
          <Slider
            label="ROI mínimo"
            min={0}
            max={200}
            value={formMinRoi}
            onChange={(e) => setFormMinRoi(Number(e.target.value))}
            valueFormatter={(v) => `${v}%`}
          />
          <div>
            <p className="mb-2 font-body text-xs font-medium text-foreground-muted">
              Canais de notificação
            </p>
            <div className="space-y-2">
              {(['in_app', 'email', 'whatsapp', 'push'] as AlertChannel[]).map((ch) => {
                const info = CHANNEL_INFO[ch];
                const allowed = perms.alertChannels.includes(ch);
                return (
                  <div key={ch} className="flex items-center gap-3">
                    <Checkbox
                      label={info.label}
                      disabled={!allowed || info.soon}
                      checked={formChannels.includes(ch)}
                      onChange={(e) =>
                        setFormChannels((p) =>
                          e.target.checked ? [...p, ch] : p.filter((x) => x !== ch),
                        )
                      }
                    />
                    {info.soon && <Badge variant="ai">Em breve</Badge>}
                    {!allowed && !info.soon && (
                      <Badge variant="low">Requer upgrade</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
          >
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateRule} disabled={creating}>
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar regra'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function RuleCard({
  rule,
  index,
  onDelete,
  isDeleting,
}: {
  rule: AlertRule;
  index: number;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="hover:border-amber/40 mb-3 flex items-start justify-between rounded-xl border border-border bg-background-surface p-4 transition-all"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {rule.categories?.length > 0 ? (
            rule.categories.map((c) => (
              <Badge key={c} variant="medium">
                {getCategoryLabel(c)}
              </Badge>
            ))
          ) : (
            <Badge variant="medium">Todas categorias</Badge>
          )}
          {rule.states?.length > 0 ? (
            rule.states.slice(0, 5).map((s) => (
              <Badge key={s} variant="ai">
                {s}
              </Badge>
            ))
          ) : (
            <Badge variant="ai">Todos estados</Badge>
          )}
          {rule.states?.length > 5 && (
            <Badge variant="ai">+{rule.states.length - 5}</Badge>
          )}
        </div>
        <div className="font-mono-data flex flex-wrap gap-4 text-xs text-foreground-muted">
          <span>
            Score ≥ <span className="text-amber">{rule.min_score}</span>
          </span>
          <span>
            ROI ≥ <span className="text-green">{rule.min_roi}%</span>
          </span>
          <span>Via: {(rule.channels ?? ['in_app']).join(', ')}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="ml-2 shrink-0 text-foreground-muted hover:text-red"
        onClick={onDelete}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </motion.div>
  );
}
