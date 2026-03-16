/**
 * GARIMPO IA™ — useAuth Hook
 *
 * Encapsula signIn, signUp, resetPassword com Zod validation e estados loading/error.
 */

import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { z } from 'zod';
import { useApp } from '@/contexts/AppContext';

const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
});

const signUpSchema = signInSchema.extend({
  fullName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
});

export function useAuth() {
  const { signIn, signUp } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function clearErrors() {
    setErrors({});
  }

  const handleSignIn = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setErrors({});
      const result = signInSchema.safeParse({ email, password });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((e) => {
          if (e.path[0]) fieldErrors[String(e.path[0])] = e.message;
        });
        setErrors(fieldErrors);
        return false;
      }
      setIsLoading(true);
      try {
        await signIn(result.data.email, result.data.password);
        return true;
      } catch (err) {
        setErrors({ form: err instanceof Error ? err.message : 'Erro ao entrar.' });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [signIn],
  );

  const handleSignUp = useCallback(
    async (email: string, password: string, fullName: string): Promise<boolean> => {
      setErrors({});
      const result = signUpSchema.safeParse({ email, password, fullName });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((e) => {
          if (e.path[0]) fieldErrors[String(e.path[0])] = e.message;
        });
        setErrors(fieldErrors);
        return false;
      }
      setIsLoading(true);
      try {
        await signUp(result.data.email, result.data.password, result.data.fullName);
        return true;
      } catch (err) {
        setErrors({ form: err instanceof Error ? err.message : 'Erro ao criar conta.' });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [signUp],
  );

  const handleResetPassword = useCallback(async (email: string): Promise<boolean> => {
    setErrors({});
    const result = z.string().email('Email inválido').safeParse(email);
    if (!result.success) {
      setErrors({ email: result.error.errors[0]?.message ?? 'Email inválido' });
      return false;
    }
    // Supabase reset — import direto para não criar dep circular no AppContext
    if (!supabase) {
      setErrors({ form: 'Supabase não configurado.' });
      return false;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(result.data, {
        redirectTo: `${window.location.origin}/profile`,
      });
      if (error) throw error;
      return true;
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Erro ao enviar email.' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    handleSignIn,
    handleSignUp,
    handleResetPassword,
    isLoading,
    errors,
    clearErrors,
  };
}
