import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGroupActions } from '@hooks/useGroupActions';
import { useGroupStore } from '@store/groupStore';
import { useUndoStore } from '@store/undoStore';

// Helper: makes chrome.runtime.sendMessage resolve with { success: true, data }
function mockSendMessage(data: unknown = 123) {
  (chrome.runtime.sendMessage as ReturnType<typeof vi.fn>).mockImplementation(
    (_msg: unknown, callback: (resp: { success: boolean; data: unknown }) => void) => {
      callback({ success: true, data });
    }
  );
}

describe('useGroupActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset stores
    useGroupStore.setState({ groups: [], selectedGroupId: null });
    useUndoStore.setState({ stack: [], canUndo: false });
    // Default: sendMessage succeeds with chromeGroupId = 123
    mockSendMessage(123);
  });

  // ── createGroup ─────────────────────────────────────────────────────────────

  it('createGroup adds a group to the store', async () => {
    const { result } = renderHook(() => useGroupActions());

    await act(async () => {
      await result.current.createGroup('Work', '#3B82F6', [1, 2]);
    });

    const groups = useGroupStore.getState().groups;
    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe('Work');
    expect(groups[0].color).toBe('#3B82F6');
    expect(groups[0].syncId).toBe('123');
    expect(groups[0].isPinned).toBe(false);
    expect(groups[0].isArchived).toBe(false);
    expect(groups[0].tabs).toEqual([]);
  });

  it('createGroup sends CREATE_GROUP message with correct payload', async () => {
    const { result } = renderHook(() => useGroupActions());

    await act(async () => {
      await result.current.createGroup('Work', '#3B82F6', [1, 2]);
    });

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'CREATE_GROUP',
        payload: { tabIds: [1, 2], title: 'Work', color: 'blue' },
      }),
      expect.any(Function)
    );
  });

  it('createGroup maps hex colors to Chrome color names', async () => {
    const { result } = renderHook(() => useGroupActions());

    const cases: [string, string][] = [
      ['#EF4444', 'red'],
      ['#FBBF24', 'yellow'],
      ['#10B981', 'green'],
      ['#EC4899', 'pink'],
      ['#8B5CF6', 'purple'],
      ['#06B6D4', 'cyan'],
      ['#F97316', 'orange'],
      ['#UNKNOWN', 'blue'], // fallback
    ];

    for (const [hex, chromeColor] of cases) {
      vi.clearAllMocks();
      mockSendMessage(123);

      await act(async () => {
        await result.current.createGroup('G', hex, []);
      });

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({ color: chromeColor }),
        }),
        expect.any(Function)
      );
    }
  });

  it('createGroup pushes an undo action', async () => {
    const { result } = renderHook(() => useGroupActions());

    await act(async () => {
      await result.current.createGroup('Work', '#3B82F6', []);
    });

    const { stack } = useUndoStore.getState();
    expect(stack).toHaveLength(1);
    expect(stack[0].description).toBe('Créer groupe "Work"');
  });

  it('createGroup undo removes the group from the store', async () => {
    const { result } = renderHook(() => useGroupActions());

    await act(async () => {
      await result.current.createGroup('Work', '#3B82F6', []);
    });

    expect(useGroupStore.getState().groups).toHaveLength(1);

    // Execute undo
    const undoAction = useUndoStore.getState().stack[0];
    act(() => {
      undoAction.undo();
    });

    expect(useGroupStore.getState().groups).toHaveLength(0);
  });

  it('createGroup works with no tabIds (default [])', async () => {
    const { result } = renderHook(() => useGroupActions());

    await act(async () => {
      await result.current.createGroup('Solo', '#10B981');
    });

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ tabIds: [] }),
      }),
      expect.any(Function)
    );
    expect(useGroupStore.getState().groups).toHaveLength(1);
  });

  // ── editGroup ───────────────────────────────────────────────────────────────

  it('editGroup sends UPDATE_GROUP message when chromeGroupId is provided', async () => {
    // Pre-populate store
    useGroupStore.setState({
      groups: [
        {
          id: 'g1',
          name: 'Old Name',
          color: '#3B82F6',
          isPinned: false,
          isArchived: false,
          tabs: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      selectedGroupId: null,
    });

    const { result } = renderHook(() => useGroupActions());

    await act(async () => {
      await result.current.editGroup('g1', 42, { name: 'New Name' });
    });

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'UPDATE_GROUP',
        payload: { chromeGroupId: 42, title: 'New Name' },
      }),
      expect.any(Function)
    );
  });

  it('editGroup does NOT send message when chromeGroupId is undefined', async () => {
    useGroupStore.setState({
      groups: [
        {
          id: 'g1',
          name: 'Old',
          color: '#3B82F6',
          isPinned: false,
          isArchived: false,
          tabs: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      selectedGroupId: null,
    });

    const { result } = renderHook(() => useGroupActions());

    await act(async () => {
      await result.current.editGroup('g1', undefined, { name: 'New' });
    });

    expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
  });

  it('editGroup updates the group in the store', async () => {
    useGroupStore.setState({
      groups: [
        {
          id: 'g1',
          name: 'Old Name',
          color: '#3B82F6',
          isPinned: false,
          isArchived: false,
          tabs: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      selectedGroupId: null,
    });

    const { result } = renderHook(() => useGroupActions());

    await act(async () => {
      await result.current.editGroup('g1', undefined, { name: 'New Name' });
    });

    const group = useGroupStore.getState().groups.find((g) => g.id === 'g1');
    expect(group?.name).toBe('New Name');
  });

  it('editGroup pushes an undo action', async () => {
    useGroupStore.setState({
      groups: [
        {
          id: 'g1',
          name: 'Original',
          color: '#3B82F6',
          isPinned: false,
          isArchived: false,
          tabs: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      selectedGroupId: null,
    });

    const { result } = renderHook(() => useGroupActions());

    await act(async () => {
      await result.current.editGroup('g1', undefined, { name: 'Changed' });
    });

    const { stack } = useUndoStore.getState();
    expect(stack).toHaveLength(1);
    expect(stack[0].description).toBe('Modifier groupe');
  });

  it('editGroup undo restores the previous name and color', async () => {
    useGroupStore.setState({
      groups: [
        {
          id: 'g1',
          name: 'Original',
          color: '#EF4444',
          isPinned: false,
          isArchived: false,
          tabs: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      selectedGroupId: null,
    });

    const { result } = renderHook(() => useGroupActions());

    await act(async () => {
      await result.current.editGroup('g1', undefined, { name: 'Changed', color: '#10B981' });
    });

    expect(useGroupStore.getState().groups[0].name).toBe('Changed');

    const undoAction = useUndoStore.getState().stack[0];
    act(() => {
      undoAction.undo();
    });

    const restored = useGroupStore.getState().groups[0];
    expect(restored.name).toBe('Original');
    expect(restored.color).toBe('#EF4444');
  });

  // ── removeGroup ─────────────────────────────────────────────────────────────

  it('removeGroup sends DELETE_GROUP message when chromeGroupId is provided', async () => {
    useGroupStore.setState({
      groups: [
        {
          id: 'g1',
          name: 'ToDelete',
          color: '#3B82F6',
          isPinned: false,
          isArchived: false,
          tabs: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      selectedGroupId: null,
    });

    const { result } = renderHook(() => useGroupActions());

    await act(async () => {
      await result.current.removeGroup('g1', 99);
    });

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'DELETE_GROUP',
        payload: { chromeGroupId: 99 },
      }),
      expect.any(Function)
    );
  });

  it('removeGroup does NOT send message when chromeGroupId is undefined', async () => {
    useGroupStore.setState({
      groups: [
        {
          id: 'g1',
          name: 'ToDelete',
          color: '#3B82F6',
          isPinned: false,
          isArchived: false,
          tabs: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      selectedGroupId: null,
    });

    const { result } = renderHook(() => useGroupActions());

    await act(async () => {
      await result.current.removeGroup('g1', undefined);
    });

    expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
    expect(useGroupStore.getState().groups).toHaveLength(0);
  });

  it('removeGroup removes the group from the store', async () => {
    useGroupStore.setState({
      groups: [
        {
          id: 'g1',
          name: 'ToDelete',
          color: '#3B82F6',
          isPinned: false,
          isArchived: false,
          tabs: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      selectedGroupId: null,
    });

    const { result } = renderHook(() => useGroupActions());

    await act(async () => {
      await result.current.removeGroup('g1', undefined);
    });

    expect(useGroupStore.getState().groups).toHaveLength(0);
  });

  it('removeGroup pushes an undo action', async () => {
    useGroupStore.setState({
      groups: [
        {
          id: 'g1',
          name: 'Removed',
          color: '#3B82F6',
          isPinned: false,
          isArchived: false,
          tabs: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      selectedGroupId: null,
    });

    const { result } = renderHook(() => useGroupActions());

    await act(async () => {
      await result.current.removeGroup('g1', undefined);
    });

    const { stack } = useUndoStore.getState();
    expect(stack).toHaveLength(1);
    expect(stack[0].description).toBe('Supprimer groupe "Removed"');
  });

  it('removeGroup undo restores the group to the store', async () => {
    useGroupStore.setState({
      groups: [
        {
          id: 'g1',
          name: 'Removed',
          color: '#3B82F6',
          isPinned: false,
          isArchived: false,
          tabs: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      selectedGroupId: null,
    });

    const { result } = renderHook(() => useGroupActions());

    await act(async () => {
      await result.current.removeGroup('g1', undefined);
    });

    expect(useGroupStore.getState().groups).toHaveLength(0);

    const undoAction = useUndoStore.getState().stack[0];
    act(() => {
      undoAction.undo();
    });

    expect(useGroupStore.getState().groups).toHaveLength(1);
    expect(useGroupStore.getState().groups[0].name).toBe('Removed');
  });
});
