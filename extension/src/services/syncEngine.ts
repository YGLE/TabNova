/**
 * syncEngine.ts
 * Central synchronization engine: change log, upload/download, offline queue.
 */

import type { TabGroup } from '@tabnova-types/index';
import type { Change } from '@tabnova-types/Sync';
import { getDB } from '@storage/db';
import { generateId } from '@utils/helpers';
import { useSyncStore } from '@store/syncStore';
import { useGroupStore } from '@store/groupStore';
import { mergeChangeLogs, applyChanges, resolveGroupConflict } from './conflictResolver';

// ─── Public interfaces ───────────────────────────────────────────────────────

/** Encrypted payload exchanged with a sync provider. */
export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  timestamp: number;
  deviceId: string;
  version: number;
}

/** Plain-text payload before encryption. */
export interface SyncPayload {
  groups: TabGroup[];
  changes: Change[];
  metadata: {
    deviceId: string;
    timestamp: number;
    version: number;
  };
}

/** Contract that any sync backend must fulfil. */
export interface SyncProvider {
  upload(payload: EncryptedPayload): Promise<void>;
  download(): Promise<EncryptedPayload | null>;
}

// ─── Change log ──────────────────────────────────────────────────────────────

/**
 * Persists a change entry to the IndexedDB `changeLog` store.
 */
export async function recordChange(
  type: Change['type'],
  entity: Change['entity'],
  entityId: string,
  data?: unknown
): Promise<void> {
  const db = await getDB();
  const change: Change = {
    id: generateId(),
    type,
    entity,
    entityId,
    timestamp: new Date(),
    data,
  };
  await db.put('changeLog', change);
}

/**
 * Returns all changes whose `timestamp` is strictly after `since`.
 */
export async function getChangesSince(since: Date): Promise<Change[]> {
  const db = await getDB();
  const all: Change[] = await db.getAll('changeLog');
  return all.filter((c) => new Date(c.timestamp).getTime() > since.getTime());
}

// ─── Full sync cycle ─────────────────────────────────────────────────────────

/**
 * Performs a complete sync cycle:
 *  1. Download remote encrypted payload
 *  2. Decrypt & merge with local state (last-write-wins)
 *  3. Upload the merged state encrypted
 */
export async function syncWithProvider(
  provider: SyncProvider,
  encryptionKey: CryptoKey,
  deviceId: string
): Promise<void> {
  const { setSyncStatus, setLastSyncAt, setError } = useSyncStore.getState();
  setSyncStatus('syncing');

  try {
    const localGroups = useGroupStore.getState().groups;
    const lastSync = useSyncStore.getState().lastSyncAt ?? new Date(0);
    const localChanges = await getChangesSince(lastSync);

    // 1. Download remote
    const remoteEncrypted = await provider.download();

    if (remoteEncrypted) {
      const { decrypt } = await import('./encryptionService');
      const remoteJson = await decrypt(
        remoteEncrypted.ciphertext,
        remoteEncrypted.iv,
        encryptionKey
      );
      const remote: SyncPayload = JSON.parse(remoteJson) as SyncPayload;

      // 2. Merge changes + resolve per-group conflicts
      const mergedChanges = mergeChangeLogs(localChanges, remote.changes);
      const mergedGroups = applyChanges(localGroups, mergedChanges);

      // Resolve conflicts for groups present in both sides
      const resolvedGroups = mergedGroups.map((g) => {
        const remoteGroup = remote.groups.find((rg) => rg.id === g.id);
        if (remoteGroup) return resolveGroupConflict(g, remoteGroup);
        return g;
      });

      // Add remote groups that are not yet in the merged result
      const resolvedIds = new Set(resolvedGroups.map((g) => g.id));
      const newFromRemote = remote.groups.filter((rg) => !resolvedIds.has(rg.id));

      useGroupStore.getState().setGroups([...resolvedGroups, ...newFromRemote]);
    }

    // 3. Upload merged local state
    const { encrypt } = await import('./encryptionService');
    const payload: SyncPayload = {
      groups: useGroupStore.getState().groups,
      changes: localChanges,
      metadata: { deviceId, timestamp: Date.now(), version: 1 },
    };
    const encrypted = await encrypt(JSON.stringify(payload), encryptionKey);
    await provider.upload({ ...encrypted, timestamp: Date.now(), deviceId, version: 1 });

    setError(null);
    setLastSyncAt(new Date());
  } catch (err) {
    setError(String(err));
    throw err;
  }
}

// ─── Offline queue ───────────────────────────────────────────────────────────

const OFFLINE_QUEUE_KEY = 'tabnova_offline_queue';

/**
 * Persists the current groups snapshot for deferred sync (offline scenario).
 * Uses `chrome.storage.local` if available, otherwise falls back to `localStorage`.
 */
export async function queueOfflineSync(groups: TabGroup[]): Promise<void> {
  const payload = JSON.stringify({ groups, timestamp: Date.now() });
  try {
    await chrome.storage.local.set({ [OFFLINE_QUEUE_KEY]: payload });
  } catch {
    localStorage.setItem(OFFLINE_QUEUE_KEY, payload);
  }
}

/**
 * Flushes the offline queue by triggering a full sync cycle, then clears the queue.
 * Should be called when connectivity is restored.
 */
export async function flushOfflineQueue(
  provider: SyncProvider,
  encryptionKey: CryptoKey,
  deviceId: string
): Promise<void> {
  let raw: string | null = null;
  try {
    const result = await chrome.storage.local.get(OFFLINE_QUEUE_KEY);
    raw = (result[OFFLINE_QUEUE_KEY] as string | undefined) ?? null;
  } catch {
    raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
  }

  if (!raw) return;

  await syncWithProvider(provider, encryptionKey, deviceId);

  try {
    await chrome.storage.local.remove(OFFLINE_QUEUE_KEY);
  } catch {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  }
}
