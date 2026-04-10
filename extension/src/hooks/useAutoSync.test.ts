import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAutoSync } from '@hooks/useAutoSync';
import { useSyncStore } from '@store/syncStore';

// Mock useOnlineStatus so we control isOnline in tests
vi.mock('@hooks/useOnlineStatus', () => ({
  useOnlineStatus: vi.fn(() => true),
}));

import { useOnlineStatus } from '@hooks/useOnlineStatus';

const mockSendMessage = vi.fn();

vi.mock('@hooks/useMessage', () => ({
  useMessage: () => ({ sendMessage: mockSendMessage }),
}));

describe('useAutoSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Reset sync store
    useSyncStore.setState({ syncStatus: 'idle', lastSyncAt: null, error: null });
    // Default: online
    vi.mocked(useOnlineStatus).mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns isOnline status', () => {
    vi.mocked(useOnlineStatus).mockReturnValue(false);
    const { result } = renderHook(() => useAutoSync());
    expect(result.current.isOnline).toBe(false);
  });

  it('returns lastSyncAt from store', () => {
    const date = new Date('2026-01-01T12:00:00Z');
    useSyncStore.setState({ lastSyncAt: date });
    const { result } = renderHook(() => useAutoSync());
    expect(result.current.lastSyncAt).toEqual(date);
  });

  it('triggerSync sends START_SYNC message', async () => {
    mockSendMessage.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAutoSync());

    await act(async () => {
      await result.current.triggerSync();
    });

    expect(mockSendMessage).toHaveBeenCalledWith('START_SYNC');
    expect(useSyncStore.getState().syncStatus).toBe('syncing');
  });

  it('triggerSync sets error status on failure', async () => {
    mockSendMessage.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useAutoSync());

    await act(async () => {
      await result.current.triggerSync();
    });

    expect(useSyncStore.getState().syncStatus).toBe('error');
  });

  it('does not trigger sync when offline', async () => {
    vi.mocked(useOnlineStatus).mockReturnValue(false);
    const { result } = renderHook(() => useAutoSync());

    await act(async () => {
      await result.current.triggerSync();
    });

    expect(mockSendMessage).not.toHaveBeenCalled();
  });
});
