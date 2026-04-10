import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTabGroups } from '@hooks/useTabGroups';
import { useGroupStore } from '@store/groupStore';
import type { TabGroup } from '@tabnova-types/TabGroup';

// Helper to build a minimal TabGroup
function makeGroup(overrides: Partial<TabGroup> = {}): TabGroup {
  return {
    id: 'group-1',
    name: 'Test Group',
    color: '#3B82F6',
    isPinned: false,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    tabs: [],
    ...overrides,
  };
}

describe('useTabGroups', () => {
  beforeEach(() => {
    // Reset zustand store between tests
    useGroupStore.getState().setGroups([]);
    vi.clearAllMocks();
  });

  it('returns empty groups initially', () => {
    const { result } = renderHook(() => useTabGroups());
    expect(result.current.groups).toEqual([]);
    expect(result.current.filteredGroups).toEqual([]);
    expect(result.current.searchQuery).toBe('');
    expect(result.current.isSyncing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('filters groups by search query', () => {
    const groups = [
      makeGroup({ id: '1', name: 'Work Stuff' }),
      makeGroup({ id: '2', name: 'Personal' }),
      makeGroup({ id: '3', name: 'Work Projects' }),
    ];
    useGroupStore.getState().setGroups(groups);

    const { result } = renderHook(() => useTabGroups());

    act(() => {
      result.current.setSearchQuery('work');
    });

    expect(result.current.filteredGroups).toHaveLength(2);
    expect(result.current.filteredGroups[0].name).toBe('Work Stuff');
    expect(result.current.filteredGroups[1].name).toBe('Work Projects');
  });

  it('returns all groups when search query is empty', () => {
    const groups = [
      makeGroup({ id: '1', name: 'Work Stuff' }),
      makeGroup({ id: '2', name: 'Personal' }),
    ];
    useGroupStore.getState().setGroups(groups);

    const { result } = renderHook(() => useTabGroups());

    // No filter applied
    expect(result.current.filteredGroups).toHaveLength(2);

    // Set and then clear
    act(() => {
      result.current.setSearchQuery('work');
    });
    expect(result.current.filteredGroups).toHaveLength(1);

    act(() => {
      result.current.setSearchQuery('');
    });
    expect(result.current.filteredGroups).toHaveLength(2);
  });

  it('sets isSyncing during sync', async () => {
    // Mock sendMessage to delay resolution
    let resolveMessage!: (value: { groups: TabGroup[] }) => void;
    const promise = new Promise<{ groups: TabGroup[] }>((resolve) => {
      resolveMessage = resolve;
    });

    (chrome.runtime.sendMessage as ReturnType<typeof vi.fn>).mockImplementation(
      (_msg: unknown, callback: (resp: { groups: TabGroup[] }) => void) => {
        promise.then(callback);
      }
    );

    const { result } = renderHook(() => useTabGroups());

    expect(result.current.isSyncing).toBe(false);

    // Start sync (don't await yet)
    let syncPromise!: Promise<void>;
    act(() => {
      syncPromise = result.current.syncFromChrome();
    });

    expect(result.current.isSyncing).toBe(true);

    // Resolve the chrome message
    await act(async () => {
      resolveMessage({ groups: [] });
      await syncPromise;
    });

    expect(result.current.isSyncing).toBe(false);
  });

  it('handles sync error gracefully', async () => {
    (chrome.runtime.sendMessage as ReturnType<typeof vi.fn>).mockImplementation(
      (_msg: unknown, callback: (resp: { error: string }) => void) => {
        callback({ error: 'Chrome API unavailable' });
      }
    );

    const { result } = renderHook(() => useTabGroups());

    await act(async () => {
      await result.current.syncFromChrome();
    });

    expect(result.current.isSyncing).toBe(false);
    expect(result.current.error).toBe('Chrome API unavailable');
  });

  it('handles chrome.runtime.lastError gracefully', async () => {
    (chrome.runtime.sendMessage as ReturnType<typeof vi.fn>).mockImplementation(
      (_msg: unknown, callback: (resp: unknown) => void) => {
        // Simulate lastError
        Object.defineProperty(chrome.runtime, 'lastError', {
          value: { message: 'Extension context invalidated' },
          configurable: true,
        });
        callback(undefined);
        Object.defineProperty(chrome.runtime, 'lastError', {
          value: undefined,
          configurable: true,
        });
      }
    );

    const { result } = renderHook(() => useTabGroups());

    await act(async () => {
      await result.current.syncFromChrome();
    });

    expect(result.current.isSyncing).toBe(false);
    expect(result.current.error).toBeTruthy();
  });
});
