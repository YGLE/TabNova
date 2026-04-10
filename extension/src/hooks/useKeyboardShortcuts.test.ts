import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useKeyboardShortcuts } from '@hooks/useKeyboardShortcuts';
import { useUIStore } from '@store/uiStore';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useUIStore.setState({ searchQuery: '' });
  });

  it('dispatches tabnova:focus-search on Ctrl+K', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
      );
    });

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabnova:focus-search' }),
    );
  });

  it('dispatches tabnova:focus-search on Cmd+K', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }),
      );
    });

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'tabnova:focus-search' }),
    );
  });

  it('calls resetSearch on Escape', () => {
    // Set a non-empty search to verify reset works
    useUIStore.setState({ searchQuery: 'test query' });
    renderHook(() => useKeyboardShortcuts());

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
    });

    expect(useUIStore.getState().searchQuery).toBe('');
  });

  it('removes listeners on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyboardShortcuts());
    unmount();

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
