import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from '@components/ErrorBoundary';

// Component that throws on demand
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Child content</div>;
}

// Suppress console.error for tests that expect errors
const originalConsoleError = console.error;

describe('ErrorBoundary', () => {
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders custom fallback when child throws', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
    expect(screen.queryByText('Child content')).not.toBeInTheDocument();
  });

  it('renders default error UI when no fallback provided', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
  });

  it('shows the error message in the default UI', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('resets error state on retry click', () => {
    // Use a flag that can be toggled between renders
    let shouldThrow = true;

    function ToggleableComponent() {
      if (shouldThrow) throw new Error('Test error message');
      return <div>Child content</div>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ToggleableComponent />
      </ErrorBoundary>
    );

    // Error UI is shown
    expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument();

    // Toggle the flag so the child no longer throws, then click retry
    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));

    // Re-render to trigger reconciliation with the non-throwing child
    rerender(
      <ErrorBoundary>
        <ToggleableComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Child content')).toBeInTheDocument();
    expect(screen.queryByText('Une erreur est survenue')).not.toBeInTheDocument();
  });
});
