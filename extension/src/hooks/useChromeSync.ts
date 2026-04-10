import { useCallback } from 'react';
import { useGroupStore } from '@store/groupStore';
import { useSyncStore } from '@store/syncStore';
import type { TabGroup } from '@tabnova-types/index';
import { useMessage } from '@hooks/useMessage';
import { useBackgroundMessage } from '@hooks/useBackgroundMessage';

export function useChromeSync() {
  const { sendMessage } = useMessage();
  const setGroups = useGroupStore((s) => s.setGroups);
  const setSyncStatus = useSyncStore((s) => s.setSyncStatus);

  const syncFromChrome = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      const groups = await sendMessage<TabGroup[]>('SYNC_FROM_CHROME');
      if (groups) setGroups(groups);
      setSyncStatus('idle');
    } catch (err) {
      console.error('[TabNova] Sync failed:', err);
      setSyncStatus('error');
    }
  }, [sendMessage, setGroups, setSyncStatus]);

  // Écoute les changements Chrome en temps réel
  const handleBackground = useCallback(
    (type: string, _payload: unknown) => {
      if (type === 'CHROME_GROUP_UPDATED' || type === 'CHROME_TABS_CHANGED') {
        void syncFromChrome();
      }
    },
    [syncFromChrome]
  );

  useBackgroundMessage(handleBackground);

  return { syncFromChrome };
}
