import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GroupForm } from '@components/GroupForm';
import { GROUP_COLORS, MAX_GROUP_NAME_LENGTH } from '@utils/constants';

describe('GroupForm', () => {
  it('renders name input', () => {
    render(<GroupForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByTestId('group-name-input')).toBeInTheDocument();
  });

  it('renders color palette', () => {
    render(<GroupForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    GROUP_COLORS.forEach((color) => {
      expect(screen.getByTestId(`color-swatch-${color}`)).toBeInTheDocument();
    });
  });

  it('shows error when name is empty and submitted', async () => {
    render(<GroupForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    const input = screen.getByTestId('group-name-input');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.submit(input.closest('form')!);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Le nom est requis');
    });
  });

  it('calls onSubmit with correct values', async () => {
    const onSubmit = vi.fn();
    render(<GroupForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    const input = screen.getByTestId('group-name-input');
    fireEvent.change(input, { target: { value: 'Mon Groupe' } });
    fireEvent.submit(input.closest('form')!);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Mon Groupe',
        color: GROUP_COLORS[0],
      });
    });
  });

  it('calls onCancel when cancel clicked', () => {
    const onCancel = vi.fn();
    render(<GroupForm onSubmit={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Annuler'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows character counter', () => {
    render(<GroupForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText(`0/${MAX_GROUP_NAME_LENGTH}`)).toBeInTheDocument();
  });

  it('updates character counter as user types', () => {
    render(<GroupForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    const input = screen.getByTestId('group-name-input');
    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(screen.getByText(`5/${MAX_GROUP_NAME_LENGTH}`)).toBeInTheDocument();
  });

  it('limits name to 30 characters', () => {
    render(<GroupForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    const input = screen.getByTestId('group-name-input') as HTMLInputElement;
    const longValue = 'A'.repeat(50);
    fireEvent.change(input, { target: { value: longValue } });
    expect(input.value.length).toBeLessThanOrEqual(MAX_GROUP_NAME_LENGTH);
  });

  it('uses initialValues when provided', () => {
    render(
      <GroupForm
        initialValues={{ name: 'Travail', color: '#EC4899' }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    const input = screen.getByTestId('group-name-input') as HTMLInputElement;
    expect(input.value).toBe('Travail');
  });
});
