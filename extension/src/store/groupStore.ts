import { create } from 'zustand';

// Minimal inline type until AGENT 1 creates the full types
interface Tab {
  id: string;
  groupId: string;
  url: string;
  title: string;
  favicon?: string;
  position: number;
  isStarred: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TabGroup {
  id: string;
  name: string;
  color: string;
  isPinned: boolean;
  isArchived: boolean;
  position?: { x: number; y: number };
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
  syncId?: string;
  tabs: Tab[];
}

interface GroupState {
  groups: TabGroup[];
  selectedGroupId: string | null;

  // Actions
  setGroups: (groups: TabGroup[]) => void;
  addGroup: (group: TabGroup) => void;
  updateGroup: (id: string, updates: Partial<TabGroup>) => void;
  deleteGroup: (id: string) => void;
  selectGroup: (id: string | null) => void;
  pinGroup: (id: string) => void;
  unpinGroup: (id: string) => void;
  archiveGroup: (id: string) => void;
}

export const useGroupStore = create<GroupState>((set) => ({
  groups: [],
  selectedGroupId: null,

  setGroups: (groups) => set({ groups }),

  addGroup: (group) =>
    set((state) => ({ groups: [...state.groups, group] })),

  updateGroup: (id, updates) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === id ? { ...g, ...updates, updatedAt: new Date() } : g
      ),
    })),

  deleteGroup: (id) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
      selectedGroupId: state.selectedGroupId === id ? null : state.selectedGroupId,
    })),

  selectGroup: (id) => set({ selectedGroupId: id }),

  pinGroup: (id) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === id ? { ...g, isPinned: true, updatedAt: new Date() } : g
      ),
    })),

  unpinGroup: (id) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === id ? { ...g, isPinned: false, updatedAt: new Date() } : g
      ),
    })),

  archiveGroup: (id) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === id ? { ...g, isArchived: true, updatedAt: new Date() } : g
      ),
    })),
}));
