/**
 * GARIMPO IA™ — Badge Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('renders with text content', () => {
    render(<Badge>Score 87</Badge>);
    expect(screen.getByText('Score 87')).toBeInTheDocument();
  });

  it('applies high variant classes (green)', () => {
    render(<Badge variant="high">Alto</Badge>);
    const badge = screen.getByText('Alto');
    expect(badge.className).toContain('text-green');
    expect(badge.className).toContain('border-green');
  });

  it('applies medium variant classes (amber)', () => {
    render(<Badge variant="medium">Médio</Badge>);
    const badge = screen.getByText('Médio');
    expect(badge.className).toContain('text-amber');
    expect(badge.className).toContain('border-amber');
  });

  it('applies low variant classes (red)', () => {
    render(<Badge variant="low">Baixo</Badge>);
    const badge = screen.getByText('Baixo');
    expect(badge.className).toContain('text-red');
    expect(badge.className).toContain('border-red');
  });

  it('applies ai variant classes (cyan)', () => {
    render(<Badge variant="ai">IA</Badge>);
    const badge = screen.getByText('IA');
    expect(badge.className).toContain('text-cyan');
    expect(badge.className).toContain('border-cyan');
  });

  it('applies new variant classes (purple)', () => {
    render(<Badge variant="new">Novo</Badge>);
    const badge = screen.getByText('Novo');
    expect(badge.className).toContain('text-purple');
  });

  it('renders as span element', () => {
    render(<Badge>Test</Badge>);
    const badge = screen.getByText('Test');
    expect(badge.tagName.toLowerCase()).toBe('span');
  });

  it('uses font-mono-data typography', () => {
    render(<Badge>Score</Badge>);
    const badge = screen.getByText('Score');
    expect(badge.className).toContain('font-mono-data');
  });
});
