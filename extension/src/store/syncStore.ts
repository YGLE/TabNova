import { create } from 'zustand';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';
type SyncProvider = 'google-drive' | 'icloud' | 'backend' | null;

interface SyncState {
  syncStatus: SyncStatus;
  syncProvider: SyncProvider;
  lastSyncAt: Date | null;
  error: string | null;

  // Actions
  setSyncStatus: (status: SyncStatus) => void;
  setSyncProvider: (provider: SyncProvider) => void;
  setLastSyncAt: (date: Date) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  syncStatus: 'idle',
  syncProvider: null,
  lastSyncAt: null,
  error: null,

  setSyncStatus: (status) => set({ syncStatus: status }),
  setSyncProvider: (provider) => set({ syncProvider: provider }),
  setLastSyncAt: (date) => set({ lastSyncAt: date, syncStatus: 'success' }),
  setError: (error) => set({ error, syncStatus: error ? 'error' : 'idle' }),
  reset: () => set({ syncStatus: 'idle', error: null }),
}));
