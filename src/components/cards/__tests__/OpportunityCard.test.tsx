/**
 * GARIMPO IA™ — OpportunityCard Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OpportunityCard } from '../OpportunityCard';
import type { Opportunity } from '@/types';

const mockOpp: Opportunity = {
  id: 'test-id-123',
  title: 'Volkswagen Gol 2019 Excelente Estado',
  category: 'vehicle',
  score: 87,
  location: 'São Paulo',
  state: 'SP',
  year: 2019,
  current_bid: 18000,
  market_value: 32000,
  profit_potential: 14000,
  roi_percentage: 77.8,
  auction_source: 'Detran SP',
  auction_url: 'https://example.com/leilao/123',
  closes_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  risk_level: 'low',
  risk_notes: null,
  liquidity: 'high',
  ai_analysis: 'Excelente oportunidade com alta liquidez.',
  images: [],
  is_featured: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

function wrapper(children: React.ReactNode) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('OpportunityCard', () => {
  it('renders opportunity title', () => {
    render(wrapper(<OpportunityCard opportunity={mockOpp} isUnlocked={true} />));
    expect(screen.getByText('Volkswagen Gol 2019 Excelente Estado')).toBeInTheDocument();
  });

  it('renders score value as part of badge text', () => {
    // Score is rendered as "★ 87" inside the badge
    render(wrapper(<OpportunityCard opportunity={mockOpp} isUnlocked={true} />));
    expect(screen.getByText(/87/)).toBeInTheDocument();
  });

  it('renders location', () => {
    render(wrapper(<OpportunityCard opportunity={mockOpp} isUnlocked={true} />));
    expect(screen.getByText(/São Paulo/)).toBeInTheDocument();
  });

  it('shows locked overlay elements when isUnlocked is false', () => {
    render(wrapper(<OpportunityCard opportunity={mockOpp} isUnlocked={false} />));
    expect(screen.getByText('Oportunidade Detectada')).toBeInTheDocument();
  });

  it('shows score in locked overlay text when isUnlocked is false', () => {
    render(wrapper(<OpportunityCard opportunity={mockOpp} isUnlocked={false} />));
    expect(screen.getByText(/Score 87/)).toBeInTheDocument();
  });

  it('shows "Ver Análise Completa" button when isUnlocked is true', () => {
    render(wrapper(<OpportunityCard opportunity={mockOpp} isUnlocked={true} />));
    expect(screen.getByText('Ver Análise Completa')).toBeInTheDocument();
  });

  it('shows subscribe CTA text when isUnlocked is false', () => {
    render(wrapper(<OpportunityCard opportunity={mockOpp} isUnlocked={false} />));
    // "Desbloquear — Assinar" appears in the button
    expect(screen.getByText('Desbloquear — Assinar')).toBeInTheDocument();
  });

  it('score 87 badge contains score text (high >= 70)', () => {
    render(wrapper(<OpportunityCard opportunity={mockOpp} isUnlocked={true} />));
    const badge = screen.getByText(/★.*87|87/);
    expect(badge).toBeInTheDocument();
  });

  it('score 62 renders in badge (medium 40-69)', () => {
    const mediumOpp = { ...mockOpp, score: 62 };
    render(wrapper(<OpportunityCard opportunity={mediumOpp} isUnlocked={true} />));
    expect(screen.getByText(/62/)).toBeInTheDocument();
  });

  it('score 35 renders in badge (low < 40)', () => {
    const lowOpp = { ...mockOpp, score: 35 };
    render(wrapper(<OpportunityCard opportunity={lowOpp} isUnlocked={true} />));
    expect(screen.getByText(/35/)).toBeInTheDocument();
  });

  it('calls onViewAnalysis when "Ver Análise Completa" is clicked', () => {
    const handler = vi.fn();
    render(
      wrapper(
        <OpportunityCard
          opportunity={mockOpp}
          isUnlocked={true}
          onViewAnalysis={handler}
        />,
      ),
    );
    fireEvent.click(screen.getByText('Ver Análise Completa'));
    expect(handler).toHaveBeenCalledWith(mockOpp.id);
  });

  it('calls onSubscribe when "Desbloquear" button is clicked', () => {
    const handler = vi.fn();
    render(
      wrapper(
        <OpportunityCard
          opportunity={mockOpp}
          isUnlocked={false}
          onSubscribe={handler}
        />,
      ),
    );
    fireEvent.click(screen.getByText('Desbloquear — Assinar'));
    expect(handler).toHaveBeenCalled();
  });
});
