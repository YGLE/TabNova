import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from '@components/Modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test">
        <p>Content</p>
      </Modal>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders children when open', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test">
        <p>Hello world</p>
      </Modal>,
    );
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('calls onClose when Escape pressed', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>,
    );
    fireEvent.click(screen.getByTestId('modal-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when panel clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>,
    );
    fireEvent.click(screen.getByTestId('modal-panel'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders title', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Mon Titre">
        <p>Content</p>
      </Modal>,
    );
    expect(screen.getByText('Mon Titre')).toBeInTheDocument();
  });
});
