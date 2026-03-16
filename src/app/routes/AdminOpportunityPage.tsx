/**
 * GARIMPO IA™ — Admin Opportunity Page
 *
 * SEGURANÇA: Acesso exclusivo para role === 'admin'.
 * Redireciona para / se não for admin.
 */

import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Shield, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/contexts/ToastContext';
import { createOpportunity } from '@/services/opportunityIngestion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { DatePicker } from '@/components/ui/DatePicker';
import { Skeleton } from '@/components/ui/Skeleton';

const formSchema = z.object({
  title: z.string().min(3, 'Título muito curto'),
  category: z.string().min(1, 'Selecione uma categoria'),
  location: z.string().min(2, 'Localização obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 letras'),
  current_bid: z.number().positive('Lance deve ser positivo'),
  market_value: z.number().positive('Valor de mercado deve ser positivo'),
  auction_source: z.string().min(2, 'Fonte obrigatória'),
  auction_url: z.string().url('URL inválida').or(z.literal('')),
  closes_at: z.string().min(1, 'Data de encerramento obrigatória'),
  risk_level: z.enum(['low', 'medium', 'high']),
  risk_notes: z.string().optional(),
});

const CATEGORY_OPTIONS = [
  { value: 'vehicle', label: 'Veículo' },
  { value: 'property', label: 'Imóvel' },
  { value: 'agriculture', label: 'Agronegócio' },
  { value: 'machinery', label: 'Maquinário' },
  { value: 'electronics', label: 'Eletrônicos' },
  { value: 'other', label: 'Outros' },
];

const RISK_OPTIONS = [
  { value: 'low', label: 'Baixo' },
  { value: 'medium', label: 'Médio' },
  { value: 'high', label: 'Alto' },
];

const STATE_OPTIONS = [
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
].map((s) => ({ value: s, label: s }));

const empty = {
  title: '',
  category: 'vehicle',
  location: '',
  state: 'SP',
  current_bid: '',
  market_value: '',
  auction_source: '',
  auction_url: '',
  closes_at: '',
  risk_level: 'medium',
  risk_notes: '',
};

export function AdminOpportunityPage() {
  const { isAuthenticated, isLoading: appLoading, profile } = useApp();
  const { addToast } = useToast();

  const [form, setForm] = useState<typeof empty>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (appLoading)
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-12">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );

  // SEGURANÇA: redirecionar se não for admin
  if (!isAuthenticated || profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  function setField(key: keyof typeof empty) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: '' }));
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      current_bid: Number(
        String(form.current_bid)
          .replace(/[^\d.,]/g, '')
          .replace(',', '.'),
      ),
      market_value: Number(
        String(form.market_value)
          .replace(/[^\d.,]/g, '')
          .replace(',', '.'),
      ),
    };

    const result = formSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const created = await createOpportunity(
        result.data as Parameters<typeof createOpportunity>[0],
        { triggerAi: true },
      );
      if (created?.id) {
        addToast({
          type: 'success',
          title: 'Oportunidade criada!',
          description: `ID: ${created.id}. Análise IA disparada.`,
        });
        setForm(empty);
        setErrors({});
      } else {
        addToast({ type: 'error', title: 'Erro ao criar. Verifique o console.' });
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: err instanceof Error ? err.message : 'Erro desconhecido.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-20">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-6 w-6 text-amber" />
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Inserir Oportunidade
            </h1>
            <p className="font-body text-xs text-foreground-muted">
              Acesso restrito: admin
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-border bg-background-surface p-6"
        >
          <div>
            <label className="mb-1 block font-body text-xs font-medium text-foreground-muted">
              Título *
            </label>
            <Input
              value={form.title}
              onChange={setField('title')}
              placeholder="Ex: Volkswagen Gol 2018 Conservado"
            />
            {errors.title && (
              <p className="mt-1 font-body text-xs text-red">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-body text-xs font-medium text-foreground-muted">
                Categoria *
              </label>
              <Select
                options={CATEGORY_OPTIONS}
                value={form.category}
                onChange={setField('category')}
              />
            </div>
            <div>
              <label className="mb-1 block font-body text-xs font-medium text-foreground-muted">
                Nível de risco *
              </label>
              <Select
                options={RISK_OPTIONS}
                value={form.risk_level}
                onChange={setField('risk_level')}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="mb-1 block font-body text-xs font-medium text-foreground-muted">
                Localização *
              </label>
              <Input
                value={form.location}
                onChange={setField('location')}
                placeholder="São Paulo, SP"
              />
              {errors.location && (
                <p className="mt-1 font-body text-xs text-red">{errors.location}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block font-body text-xs font-medium text-foreground-muted">
                Estado *
              </label>
              <Select
                options={STATE_OPTIONS}
                value={form.state}
                onChange={setField('state')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-body text-xs font-medium text-foreground-muted">
                Lance atual (R$) *
              </label>
              <Input
                type="number"
                value={form.current_bid}
                onChange={setField('current_bid')}
                placeholder="15000"
                min={0}
              />
              {errors.current_bid && (
                <p className="mt-1 font-body text-xs text-red">{errors.current_bid}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block font-body text-xs font-medium text-foreground-muted">
                Valor de mercado (R$) *
              </label>
              <Input
                type="number"
                value={form.market_value}
                onChange={setField('market_value')}
                placeholder="25000"
                min={0}
              />
              {errors.market_value && (
                <p className="mt-1 font-body text-xs text-red">{errors.market_value}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-body text-xs font-medium text-foreground-muted">
                Leiloeiro / Fonte *
              </label>
              <Input
                value={form.auction_source}
                onChange={setField('auction_source')}
                placeholder="Detran SP"
              />
              {errors.auction_source && (
                <p className="mt-1 font-body text-xs text-red">{errors.auction_source}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block font-body text-xs font-medium text-foreground-muted">
                URL do leilão
              </label>
              <Input
                value={form.auction_url}
                onChange={setField('auction_url')}
                placeholder="https://..."
                type="url"
              />
              {errors.auction_url && (
                <p className="mt-1 font-body text-xs text-red">{errors.auction_url}</p>
              )}
            </div>
          </div>

          <DatePicker
            label="Encerramento *"
            value={form.closes_at}
            onChange={setField('closes_at')}
            error={errors.closes_at}
          />

          <div>
            <label className="mb-1 block font-body text-xs font-medium text-foreground-muted">
              Notas de risco (opcional)
            </label>
            <Textarea
              value={form.risk_notes}
              onChange={setField('risk_notes')}
              placeholder="Débitos, problemas conhecidos, documentação pendente..."
              rows={3}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Criando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Criar oportunidade + disparar análise IA
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
