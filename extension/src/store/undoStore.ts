import { create } from 'zustand';

export interface UndoAction {
  description: string;
  undo: () => void | Promise<void>;
}

const MAX_UNDO = 5;

interface UndoState {
  stack: UndoAction[];
  canUndo: boolean;

  // Actions
  push: (action: UndoAction) => void;
  undo: () => Promise<void>;
  clear: () => void;
}

export const useUndoStore = create<UndoState>((set, get) => ({
  stack: [],
  canUndo: false,

  push: (action) =>
    set((state) => {
      const newStack = [...state.stack, action].slice(-MAX_UNDO);
      return { stack: newStack, canUndo: newStack.length > 0 };
    }),

  undo: async () => {
    const { stack } = get();
    if (stack.length === 0) return;

    const lastAction = stack[stack.length - 1];
    await lastAction.undo();

    set((state) => {
      const newStack = state.stack.slice(0, -1);
      return { stack: newStack, canUndo: newStack.length > 0 };
    });
  },

  clear: () => set({ stack: [], canUndo: false }),
}));
