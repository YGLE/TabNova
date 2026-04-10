import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ContextMenu } from '@components/ContextMenu';
import type { ContextMenuItem } from '@components/ContextMenu';

const defaultItems: ContextMenuItem[] = [
  { label: 'Renommer', icon: '✏️', onClick: vi.fn() },
  { label: 'Supprimer', icon: '🗑️', onClick: vi.fn(), variant: 'danger' },
];

const defaultPosition = { x: 100, y: 200 };

describe('ContextMenu', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ContextMenu
        isOpen={false}
        position={defaultPosition}
        items={defaultItems}
        onClose={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders items when open', () => {
    render(
      <ContextMenu
        isOpen={true}
        position={defaultPosition}
        items={defaultItems}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Renommer')).toBeInTheDocument();
    expect(screen.getByText('Supprimer')).toBeInTheDocument();
  });

  it('calls item onClick', () => {
    const onClick = vi.fn();
    const items: ContextMenuItem[] = [
      { label: 'Action', onClick },
    ];
    render(
      <ContextMenu
        isOpen={true}
        position={defaultPosition}
        items={items}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('Action'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on Escape', () => {
    const onClose = vi.fn();
    render(
      <ContextMenu
        isOpen={true}
        position={defaultPosition}
        items={defaultItems}
        onClose={onClose}
      />,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('applies danger variant to delete item', () => {
    render(
      <ContextMenu
        isOpen={true}
        position={defaultPosition}
        items={defaultItems}
        onClose={vi.fn()}
      />,
    );
    const dangerLabel = screen.getByText('Supprimer');
    expect(dangerLabel).toHaveClass('text-red-400');
  });
});
