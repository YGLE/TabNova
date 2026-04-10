import { create } from 'zustand';
import type { TabGroup } from '@tabnova-types/index';
import {
  createGroup as dbCreateGroup,
  updateGroup as dbUpdateGroup,
  deleteGroup as dbDeleteGroup,
  getAllGroups,
} from '@storage/groupRepository';

interface GroupState {
  groups: TabGroup[];
  selectedGroupId: string | null;

  // Actions
  loadFromDB: () => Promise<void>;
  setGroups: (groups: TabGroup[]) => void;
  addGroup: (group: TabGroup) => void;
  updateGroup: (id: string, updates: Partial<TabGroup>) => void;
  deleteGroup: (id: string) => void;
  selectGroup: (id: string | null) => void;
  pinGroup: (id: string) => void;
  unpinGroup: (id: string) => void;
  archiveGroup: (id: string) => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  selectedGroupId: null,

  /** Load persisted groups from IndexedDB into the store. */
  loadFromDB: async () => {
    const groups = await getAllGroups();
    set({ groups });
  },

  setGroups: (groups) => set({ groups }),

  addGroup: (group) => {
    // Synchronous state update so existing tests stay green
    set((state) => ({ groups: [...state.groups, group] }));
    // Async persistence (fire-and-forget)
    dbCreateGroup(group).catch((err) => console.error('[TabNova] addGroup persist failed', err));
  },

  updateGroup: (id, updates) => {
    // Synchronous state update
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === id ? { ...g, ...updates, updatedAt: new Date() } : g
      ),
    }));
    // Async persistence
    dbUpdateGroup(id, updates).catch((err) =>
      console.error('[TabNova] updateGroup persist failed', err)
    );
  },

  deleteGroup: (id) => {
    // Synchronous state update
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
      selectedGroupId: state.selectedGroupId === id ? null : state.selectedGroupId,
    }));
    // Async persistence
    dbDeleteGroup(id).catch((err) => console.error('[TabNova] deleteGroup persist failed', err));
  },

  selectGroup: (id) => set({ selectedGroupId: id }),

  pinGroup: (id) => {
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === id ? { ...g, isPinned: true, updatedAt: new Date() } : g
      ),
    }));
    dbUpdateGroup(id, { isPinned: true }).catch((err) =>
      console.error('[TabNova] pinGroup persist failed', err)
    );
  },

  unpinGroup: (id) => {
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === id ? { ...g, isPinned: false, updatedAt: new Date() } : g
      ),
    }));
    dbUpdateGroup(id, { isPinned: false }).catch((err) =>
      console.error('[TabNova] unpinGroup persist failed', err)
    );
  },

  archiveGroup: (id) => {
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === id ? { ...g, isArchived: true, updatedAt: new Date() } : g
      ),
    }));
    dbUpdateGroup(id, { isArchived: true }).catch((err) =>
      console.error('[TabNova] archiveGroup persist failed', err)
    );
  },

  // Suppress unused-variable warning – get is used for future selectors
  ...(() => {
    void get;
    return {};
  })(),
}));
