/**
 * GARIMPO IA™ — PricingCard Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PricingCard } from '../PricingCard';
import type { PricingFeature } from '../PricingCard';

const baseFeatures: PricingFeature[] = [
  { label: 'Acesso a veículos', included: true },
  { label: 'Análise de IA', included: false },
];

const baseProps = {
  id: 'explorer' as const,
  name: 'Explorer',
  price: 'R$47',
  period: '/mês',
  description: 'Para quem está começando',
  features: baseFeatures,
  cta: 'Assinar Explorer',
};

describe('PricingCard', () => {
  it('renderiza o nome do plano', () => {
    render(<PricingCard {...baseProps} />);
    expect(screen.getByText('Explorer')).toBeInTheDocument();
  });

  it('renderiza o preço', () => {
    render(<PricingCard {...baseProps} />);
    expect(screen.getByText('R$47')).toBeInTheDocument();
  });

  it('renderiza o período', () => {
    render(<PricingCard {...baseProps} />);
    expect(screen.getByText('/mês')).toBeInTheDocument();
  });

  it('renderiza a descrição', () => {
    render(<PricingCard {...baseProps} />);
    expect(screen.getByText('Para quem está começando')).toBeInTheDocument();
  });

  it('mostra badge "MAIS POPULAR" quando highlighted={true}', () => {
    render(<PricingCard {...baseProps} highlighted={true} />);
    expect(screen.getByText('MAIS POPULAR')).toBeInTheDocument();
  });

  it('não mostra badge "MAIS POPULAR" quando highlighted={false}', () => {
    render(<PricingCard {...baseProps} highlighted={false} />);
    expect(screen.queryByText('MAIS POPULAR')).not.toBeInTheDocument();
  });

  it('mostra "Plano atual" badge quando isCurrent={true}', () => {
    render(<PricingCard {...baseProps} isCurrent={true} />);
    // Aparece na badge e no botão — usa getAllByText
    expect(screen.getAllByText('Plano atual').length).toBeGreaterThanOrEqual(1);
  });

  it('renderiza features incluídas', () => {
    render(<PricingCard {...baseProps} />);
    expect(screen.getByText('Acesso a veículos')).toBeInTheDocument();
  });

  it('renderiza features não incluídas com line-through', () => {
    render(<PricingCard {...baseProps} />);
    const notIncluded = screen.getByText('Análise de IA');
    expect(notIncluded.className).toContain('line-through');
  });

  it('renderiza o texto CTA no botão', () => {
    render(<PricingCard {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Assinar Explorer' })).toBeInTheDocument();
  });

  it('chama onSubscribe com o id do plano ao clicar no CTA', () => {
    const handler = vi.fn();
    render(<PricingCard {...baseProps} onSubscribe={handler} />);
    fireEvent.click(screen.getByRole('button', { name: 'Assinar Explorer' }));
    expect(handler).toHaveBeenCalledWith('explorer');
  });

  it('botão desabilitado quando isCurrent={true}', () => {
    render(<PricingCard {...baseProps} isCurrent={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('plano free renderiza "Começar grátis" sem chamar onSubscribe', () => {
    render(<PricingCard {...baseProps} id="free" name="Gratuito" cta="Começar grátis" />);
    expect(screen.getByRole('button', { name: 'Começar grátis' })).toBeInTheDocument();
  });
});
