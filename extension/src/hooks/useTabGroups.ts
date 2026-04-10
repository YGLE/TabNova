import { useState, useMemo } from 'react';
import { useGroupStore } from '@store/groupStore';
import { useSyncStore } from '@store/syncStore';
import type { TabGroup } from '@tabnova-types/TabGroup';

interface UseTabGroupsReturn {
  groups: TabGroup[];
  filteredGroups: TabGroup[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  syncFromChrome: () => Promise<void>;
  isSyncing: boolean;
  error: string | null;
}

export function useTabGroups(): UseTabGroupsReturn {
  const groups = useGroupStore((s) => s.groups);
  const setGroups = useGroupStore((s) => s.setGroups);
  const { setSyncStatus, setError: setSyncError } = useSyncStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const query = searchQuery.toLowerCase();
    return groups.filter((g) => g.name.toLowerCase().includes(query));
  }, [groups, searchQuery]);

  const syncFromChrome = async (): Promise<void> => {
    setIsSyncing(true);
    setError(null);
    setSyncStatus('syncing');

    try {
      const response = await new Promise<{ groups?: TabGroup[]; error?: string }>(
        (resolve, reject) => {
          chrome.runtime.sendMessage({ type: 'SYNC_FROM_CHROME' }, (resp) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(resp as { groups?: TabGroup[]; error?: string });
            }
          });
        }
      );

      if (response?.groups) {
        setGroups(response.groups);
        setSyncStatus('success');
      } else if (response?.error) {
        throw new Error(response.error);
      } else {
        setSyncStatus('success');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de synchronisation';
      setError(message);
      setSyncError(message);
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    groups,
    filteredGroups,
    searchQuery,
    setSearchQuery,
    syncFromChrome,
    isSyncing,
    error,
  };
}
