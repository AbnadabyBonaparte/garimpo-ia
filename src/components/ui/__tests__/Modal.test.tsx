/**
 * GARIMPO IA™ — Modal Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal', () => {
  it('renderiza conteúdo quando open={true}', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <p>Conteúdo do modal</p>
      </Modal>,
    );
    expect(screen.getByText('Conteúdo do modal')).toBeInTheDocument();
  });

  it('não renderiza conteúdo quando open={false}', () => {
    render(
      <Modal open={false} onClose={vi.fn()}>
        <p>Conteúdo oculto</p>
      </Modal>,
    );
    expect(screen.queryByText('Conteúdo oculto')).not.toBeInTheDocument();
  });

  it('renderiza title quando fornecido', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Título do Modal">
        <p>Conteúdo</p>
      </Modal>,
    );
    expect(screen.getByText('Título do Modal')).toBeInTheDocument();
  });

  it('renderiza description quando fornecida', () => {
    render(
      <Modal
        open={true}
        onClose={vi.fn()}
        title="Título"
        description="Descrição do modal"
      >
        <p>Conteúdo</p>
      </Modal>,
    );
    expect(screen.getByText('Descrição do modal')).toBeInTheDocument();
  });

  it('chama onClose ao clicar no botão fechar', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Modal">
        <p>Conteúdo</p>
      </Modal>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('chama onClose ao clicar no overlay', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal open={true} onClose={onClose}>
        <p>Conteúdo</p>
      </Modal>,
    );
    // O overlay é o primeiro div filho do container dialog
    const dialog = container.querySelector('[role="dialog"]');
    const overlay = dialog?.querySelector('.absolute.inset-0');
    if (overlay) fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it('tem role="dialog" quando aberto', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        <p>Conteúdo</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
