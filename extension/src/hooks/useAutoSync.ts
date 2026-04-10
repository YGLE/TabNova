import { useCallback, useEffect } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { useSyncStore } from '@store/syncStore';
import { useMessage } from './useMessage';

export function useAutoSync(): {
  isOnline: boolean;
  lastSyncAt: Date | null;
  triggerSync: () => Promise<void>;
} {
  const isOnline = useOnlineStatus();
  const { sendMessage } = useMessage();
  const syncStatus = useSyncStore((s) => s.syncStatus);
  const lastSyncAt = useSyncStore((s) => s.lastSyncAt);
  const setSyncStatus = useSyncStore((s) => s.setSyncStatus);

  const triggerSync = useCallback(async () => {
    if (!isOnline) return;
    try {
      setSyncStatus('syncing');
      await sendMessage('START_SYNC');
      // Status will be updated by the background
    } catch (err) {
      console.error('[TabNova] Auto sync failed:', err);
      setSyncStatus('error');
    }
  }, [isOnline, sendMessage, setSyncStatus]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && syncStatus === 'idle') {
      const timer = setTimeout(() => {
        void triggerSync();
      }, 1500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]); // intentionally react only to isOnline changes

  return { isOnline, lastSyncAt, triggerSync };
}
