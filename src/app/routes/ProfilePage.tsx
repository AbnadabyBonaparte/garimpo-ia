/**
 * GARIMPO IA™ — Profile Page
 *
 * Perfil do usuário: dados pessoais, preferências, notificações, assinatura.
 * LEI 5: Loading/Error/Empty states completos.
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Crown, LogOut, ExternalLink, Save, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { getPlanLabel } from '@/lib/permissions';
import { getCategoryLabel } from '@/lib/utils';
import type { OpportunityCategory } from '@/types';

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

export function ProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: appLoading, profile, signOut } = useApp();
  const { addToast } = useToast();
  const { updateProfile, isUpdating } = useProfile();

  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [prefCats, setPrefCats] = useState<OpportunityCategory[]>([]);
  const [prefStates, setPrefStates] = useState<string[]>([]);
  const [notifWhatsapp, setNotifWhatsapp] = useState(false);
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifPush, setNotifPush] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name ?? '');
      setAvatarUrl(profile.avatar_url ?? '');
      setPrefCats((profile.preferred_categories ?? []) as OpportunityCategory[]);
      setPrefStates(profile.preferred_states ?? []);
      setNotifWhatsapp(profile.notification_whatsapp ?? false);
      setNotifEmail(profile.notification_email ?? false);
      setNotifPush(profile.notification_push ?? false);
    }
  }, [profile]);

  if (appLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-12">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login?returnTo=/profile" replace />;

  function toggleCat(c: OpportunityCategory) {
    setPrefCats((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }
  function toggleState(s: string) {
    setPrefStates((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    const ok = await updateProfile({
      full_name: name.trim(),
      avatar_url: avatarUrl.trim() || null,
      preferred_categories: prefCats,
      preferred_states: prefStates,
      notification_whatsapp: notifWhatsapp,
      notification_email: notifEmail,
      notification_push: notifPush,
    });
    if (ok) addToast({ type: 'success', title: 'Perfil atualizado.' });
    else addToast({ type: 'error', title: 'Erro ao salvar. Tente novamente.' });
  }

  async function handleSignOut() {
    await signOut();
    navigate('/', { replace: true });
  }

  const tier = profile?.subscription_tier ?? 'free';

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <Avatar name={profile?.full_name} src={profile?.avatar_url} size="xl" />
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {profile?.full_name || 'Meu Perfil'}
            </h1>
            <p className="font-body text-sm text-foreground-muted">{profile?.email}</p>
          </div>
        </div>

        {/* ── 1. Dados pessoais ── */}
        <section className="rounded-xl border border-border bg-background-surface p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">
            Dados pessoais
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="mb-1 block font-body text-xs font-medium text-foreground-muted">
                Nome completo
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>
            <div>
              <label className="mb-1 block font-body text-xs font-medium text-foreground-muted">
                Email (somente leitura)
              </label>
              <Input value={profile?.email ?? ''} disabled className="opacity-60" />
            </div>
            <div>
              <label className="mb-1 block font-body text-xs font-medium text-foreground-muted">
                URL do avatar (opcional)
              </label>
              <Input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* ── 2. Preferências ── */}
            <div>
              <p className="mb-2 font-body text-xs font-medium text-foreground-muted">
                Categorias preferidas
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCat(c)}
                    className={`rounded-full border px-3 py-1 font-body text-xs transition-all ${
                      prefCats.includes(c)
                        ? 'bg-amber/10 border-amber text-amber'
                        : 'hover:border-amber/50 border-border text-foreground-muted'
                    }`}
                  >
                    {getCategoryLabel(c)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 font-body text-xs font-medium text-foreground-muted">
                Estados preferidos
              </p>
              <div className="flex flex-wrap gap-1.5">
                {STATES_BR.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleState(s)}
                    className={`font-mono-data rounded border px-2 py-0.5 text-xs transition-all ${
                      prefStates.includes(s)
                        ? 'bg-cyan/10 border-cyan text-cyan'
                        : 'hover:border-cyan/50 border-border text-foreground-muted'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* ── 3. Notificações ── */}
            <div className="space-y-3 pt-2">
              <p className="font-body text-xs font-medium text-foreground-muted">
                Notificações
              </p>
              <Switch
                label="Email"
                description="Receber alertas por email"
                checked={notifEmail}
                onChange={(e) => setNotifEmail(e.target.checked)}
              />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-sm font-medium text-foreground-muted">
                    WhatsApp
                  </p>
                  <p className="font-body text-xs text-foreground-muted">
                    Alertas via WhatsApp
                  </p>
                </div>
                <Badge variant="ai">Em breve</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-sm font-medium text-foreground-muted">
                    Push
                  </p>
                  <p className="font-body text-xs text-foreground-muted">
                    Notificações no navegador
                  </p>
                </div>
                <Badge variant="ai">Em breve</Badge>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isUpdating}
              className="w-full"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Salvar alterações
                </>
              )}
            </Button>
          </form>
        </section>

        {/* ── 4. Assinatura ── */}
        <section className="rounded-xl border border-border bg-background-surface p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-foreground">
            <Crown className="h-5 w-5 text-amber" /> Assinatura
          </h2>
          <div className="flex items-center justify-between rounded-lg border border-border bg-background-deep p-4">
            <div>
              <p className="font-body text-sm font-semibold text-foreground">
                Plano atual: <span className="text-amber">{getPlanLabel(tier)}</span>
              </p>
              {profile?.subscription_expires_at && (
                <p className="font-mono-data mt-1 text-xs text-foreground-muted">
                  Expira em{' '}
                  {new Date(profile.subscription_expires_at).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
            {tier === 'free' ? (
              <Button variant="primary" size="sm" asChild>
                <Link to="/pricing">Fazer upgrade</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://billing.stripe.com/p/login/test"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Gerenciar <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            )}
          </div>
        </section>

        {/* ── 5. Zona de perigo ── */}
        <section className="border-red/20 rounded-xl border bg-background-surface p-6">
          <h2 className="mb-4 font-display text-lg font-bold text-foreground">Conta</h2>
          <div className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start text-foreground-muted hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sair da conta
            </Button>
            <div className="flex items-center justify-between">
              <Button
                variant="danger"
                className="w-full cursor-not-allowed justify-start opacity-40"
                disabled
              >
                <User className="mr-2 h-4 w-4" /> Excluir conta
              </Button>
              <Badge variant="ai" className="ml-2 shrink-0">
                Em breve
              </Badge>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
