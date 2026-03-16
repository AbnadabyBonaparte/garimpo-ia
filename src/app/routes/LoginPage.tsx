/**
 * GARIMPO IA™ — Login Page (Redesign Supremo)
 *
 * Split layout: Hero esquerdo + Form direito.
 * Zod validation via useAuth hook.
 * LEI 5: Loading state no botão.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabContent } from '@/components/ui/Tabs';
import { supabase } from '@/lib/supabaseClient';

const LOGIN_TABS = [
  { value: 'signin', label: 'Entrar' },
  { value: 'signup', label: 'Criar conta' },
];

const STATS = [
  { value: '+4.500', label: 'leilões monitorados' },
  { value: '87', label: 'score médio IA' },
  { value: '34%', label: 'ROI médio identificado' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') ?? '/';
  const { isAuthenticated } = useApp();
  const { addToast } = useToast();
  const { handleSignIn, handleSignUp, handleResetPassword, isLoading, errors, clearErrors } = useAuth();

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(returnTo, { replace: true });
  }, [isAuthenticated, navigate, returnTo]);

  function handleTabChange(value: string) {
    setTab(value as 'signin' | 'signup');
    clearErrors();
    setResetMode(false);
    setResetSent(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (resetMode) {
      const ok = await handleResetPassword(email);
      if (ok) {
        setResetSent(true);
        addToast({ type: 'success', title: 'Email de recuperação enviado. Verifique sua caixa.' });
      }
      return;
    }

    if (tab === 'signin') {
      const ok = await handleSignIn(email, password);
      if (ok) {
        addToast({ type: 'success', title: 'Bem-vindo ao Garimpo IA™' });
        navigate(returnTo, { replace: true });
      }
    } else {
      const ok = await handleSignUp(email, password, fullName);
      if (ok) {
        addToast({ type: 'success', title: 'Conta criada! Confira seu email se necessário.' });
        navigate(returnTo, { replace: true });
      }
    }
  }

  const isSupabaseReady = !!supabase;

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col lg:flex-row">
      {/* ── Hero (esquerdo, apenas desktop) ────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden flex-col justify-between bg-background-surface p-12 lg:flex lg:w-1/2"
      >
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="font-display text-3xl font-black text-foreground">GARIMPO</span>
            <span className="relative font-display text-3xl font-black text-cyan">
              IA
              <span className="absolute -right-2 -top-1 h-2 w-2 animate-pulse rounded-full bg-cyan" />
            </span>
          </div>
          <p className="font-display text-lg font-semibold text-amber">Ouro nas Trevas™</p>
          <p className="mt-3 font-body text-sm text-foreground-muted max-w-sm">
            O Bloomberg Terminal dos leilões brasileiros. IA que analisa, pondera e entrega as melhores oportunidades — antes de todo mundo.
          </p>
        </div>

        <div className="my-8 grid grid-cols-3 gap-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="rounded-lg border border-border bg-background-deep p-4"
            >
              <p className="font-mono-data text-2xl font-bold text-amber">{stat.value}</p>
              <p className="mt-1 font-body text-xs text-foreground-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="rounded-lg border border-cyan/20 bg-cyan/5 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-cyan" />
            <div>
              <p className="font-body text-sm font-semibold text-foreground">
                IA analisa cada oportunidade
              </p>
              <p className="mt-1 font-body text-xs text-foreground-muted">
                Score 0-100 baseado em valor de mercado, liquidez regional, riscos e potencial de lucro.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Form (direito) ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-1 flex-col items-center justify-center px-4 py-12 lg:px-12"
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="font-display text-2xl font-black text-foreground">GARIMPO</span>
            <span className="relative font-display text-2xl font-black text-cyan">
              IA
              <span className="absolute -right-2 -top-1 h-2 w-2 animate-pulse rounded-full bg-cyan" />
            </span>
          </div>

          {!isSupabaseReady && (
            <div className="mb-6 rounded-lg border border-amber/30 bg-amber/5 p-4">
              <p className="font-body text-sm text-amber">
                ⚠️ Supabase não configurado. Configure <code className="font-mono-data text-xs">VITE_SUPABASE_URL</code> e <code className="font-mono-data text-xs">VITE_SUPABASE_ANON_KEY</code> no Vercel.
              </p>
            </div>
          )}

          {!resetMode ? (
            <>
              <Tabs tabs={LOGIN_TABS} activeTab={tab} onTabChange={handleTabChange} className="mb-6" />

              <TabContent value="signin" activeTab={tab}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errors.form && (
                    <div className="rounded-md border border-red/30 bg-red/5 px-4 py-3">
                      <p className="font-body text-sm text-red">{errors.form}</p>
                    </div>
                  )}
                  <div>
                    <label htmlFor="email-si" className="mb-1 block font-body text-xs font-medium text-foreground-muted">Email</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                      <Input
                        id="email-si"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`pl-9 ${errors.email ? 'border-red focus:ring-red' : ''}`}
                        autoComplete="email"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && <p className="mt-1 font-body text-xs text-red">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="pwd-si" className="mb-1 block font-body text-xs font-medium text-foreground-muted">Senha</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                      <Input
                        id="pwd-si"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`pl-9 pr-10 ${errors.password ? 'border-red focus:ring-red' : ''}`}
                        autoComplete="current-password"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
                        onClick={() => setShowPassword((v) => !v)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 font-body text-xs text-red">{errors.password}</p>}
                  </div>
                  <div className="text-right">
                    <button type="button" className="font-body text-xs text-foreground-muted hover:text-amber" onClick={() => { setResetMode(true); clearErrors(); }}>
                      Esqueci minha senha
                    </button>
                  </div>
                  <Button type="submit" variant="primary" className="w-full" disabled={isLoading || !isSupabaseReady}>
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabContent>

              <TabContent value="signup" activeTab={tab}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errors.form && (
                    <div className="rounded-md border border-red/30 bg-red/5 px-4 py-3">
                      <p className="font-body text-sm text-red">{errors.form}</p>
                    </div>
                  )}
                  <div>
                    <label htmlFor="name-su" className="mb-1 block font-body text-xs font-medium text-foreground-muted">Nome completo</label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                      <Input
                        id="name-su"
                        type="text"
                        placeholder="Seu nome"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`pl-9 ${errors.fullName ? 'border-red focus:ring-red' : ''}`}
                        autoComplete="name"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.fullName && <p className="mt-1 font-body text-xs text-red">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label htmlFor="email-su" className="mb-1 block font-body text-xs font-medium text-foreground-muted">Email</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                      <Input
                        id="email-su"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`pl-9 ${errors.email ? 'border-red focus:ring-red' : ''}`}
                        autoComplete="email"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && <p className="mt-1 font-body text-xs text-red">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="pwd-su" className="mb-1 block font-body text-xs font-medium text-foreground-muted">Senha (mín. 8 caracteres)</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                      <Input
                        id="pwd-su"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`pl-9 pr-10 ${errors.password ? 'border-red focus:ring-red' : ''}`}
                        autoComplete="new-password"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
                        onClick={() => setShowPassword((v) => !v)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 font-body text-xs text-red">{errors.password}</p>}
                  </div>
                  <Button type="submit" variant="primary" className="w-full" disabled={isLoading || !isSupabaseReady}>
                    {isLoading ? 'Criando conta...' : 'Criar conta'}
                  </Button>
                </form>
              </TabContent>
            </>
          ) : (
            /* Reset Password */
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-display mb-1 text-xl font-bold text-foreground">Recuperar senha</h2>
              <p className="mb-6 font-body text-sm text-foreground-muted">Enviaremos um link de recuperação para seu email.</p>
              {resetSent ? (
                <div className="rounded-lg border border-green/30 bg-green/5 p-4">
                  <p className="font-body text-sm text-green">✓ Email enviado. Verifique sua caixa de entrada.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errors.form && <p className="font-body text-sm text-red">{errors.form}</p>}
                  <div>
                    <label htmlFor="reset-email" className="mb-1 block font-body text-xs font-medium text-foreground-muted">Email</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                        autoComplete="email"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && <p className="mt-1 font-body text-xs text-red">{errors.email}</p>}
                  </div>
                  <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Enviando...' : 'Enviar link'}
                  </Button>
                </form>
              )}
              <button
                type="button"
                className="mt-4 font-body text-sm text-foreground-muted hover:text-amber"
                onClick={() => { setResetMode(false); clearErrors(); setResetSent(false); }}
              >
                ← Voltar ao login
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
