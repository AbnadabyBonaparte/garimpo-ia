/**
 * GARIMPO IA™ — Login Page
 *
 * Auth flow: signIn / signUp, redirect after success, toasts on error.
 */

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') ?? '/';

  const { signIn, signUp, isLoading } = useApp();
  const { addToast } = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      addToast({ type: 'warning', title: 'Preencha email e senha.' });
      return;
    }
    if (mode === 'signup' && !fullName.trim()) {
      addToast({ type: 'warning', title: 'Preencha seu nome.' });
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
        addToast({ type: 'success', title: 'Login realizado.' });
      } else {
        await signUp(email.trim(), password, fullName.trim());
        addToast({ type: 'success', title: 'Conta criada. Confira seu email se solicitado.' });
      }
      navigate(returnTo, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao autenticar.';
      addToast({ type: 'error', title: message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-lg border border-border bg-background-surface p-6 shadow-elevation-2">
        <h1 className="font-display mb-6 text-2xl font-bold text-foreground">
          {mode === 'signin' ? 'Entrar' : 'Criar conta'}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="fullName" className="mb-1 block font-body text-xs font-medium text-foreground-muted">
                Nome completo
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                disabled={isLoading || submitting}
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="mb-1 block font-body text-xs font-medium text-foreground-muted">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={isLoading || submitting}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block font-body text-xs font-medium text-foreground-muted">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              disabled={isLoading || submitting}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading || submitting}
          >
            {submitting ? 'Aguarde...' : mode === 'signin' ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>

        <p className="mt-4 text-center font-body text-sm text-foreground-muted">
          {mode === 'signin' ? (
            <>
              Não tem conta?{' '}
              <button
                type="button"
                className="font-semibold text-amber hover:underline"
                onClick={() => setMode('signup')}
              >
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem conta?{' '}
              <button
                type="button"
                className="font-semibold text-amber hover:underline"
                onClick={() => setMode('signin')}
              >
                Entrar
              </button>
            </>
          )}
        </p>
      </div>

      <p className="mt-6 text-center">
        <Link to="/" className="font-body text-sm text-foreground-muted hover:text-foreground">
          ← Voltar ao feed
        </Link>
      </p>
    </div>
  );
}
