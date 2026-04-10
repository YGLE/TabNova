import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { TabGroup } from '@tabnova-types/index';
import type { Change } from '@tabnova-types/Sync';
import { clearDB } from '@storage/db';
import { useSyncStore } from '@store/syncStore';
import { useGroupStore } from '@store/groupStore';
import {
  recordChange,
  getChangesSince,
  syncWithProvider,
  queueOfflineSync,
  flushOfflineQueue,
  type SyncProvider,
  type SyncPayload,
} from './syncEngine';

// ─── Mock encryptionService ───────────────────────────────────────────────────
// Avoid real WebCrypto calls in syncEngine tests.

vi.mock('./encryptionService', () => ({
  encrypt: vi.fn(async (data: string) => ({
    ciphertext: btoa(data),
    iv: btoa('test-iv-123456'),
  })),
  decrypt: vi.fn(async (ciphertext: string) => atob(ciphertext)),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeGroup(overrides: Partial<TabGroup> = {}): TabGroup {
  return {
    id: 'group-1',
    name: 'Test Group',
    color: '#3B82F6',
    isPinned: false,
    isArchived: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-01'),
    tabs: [],
    ...overrides,
  };
}

function makeFakeKey(): CryptoKey {
  return {} as CryptoKey;
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(async () => {
  await clearDB();
  useSyncStore.setState({
    syncStatus: 'idle',
    lastSyncAt: null,
    error: null,
    syncProvider: null,
  });
  useGroupStore.setState({ groups: [], selectedGroupId: null });

  // Reset chrome.storage mocks
  vi.mocked(chrome.storage.local.get).mockImplementation(() => Promise.resolve({}));
  vi.mocked(chrome.storage.local.set).mockImplementation(() => Promise.resolve());
  vi.mocked(chrome.storage.local.remove).mockImplementation(() => Promise.resolve());
});

// ─── recordChange ─────────────────────────────────────────────────────────────

describe('recordChange', () => {
  it('writes a change to IndexedDB', async () => {
    await recordChange('CREATE', 'GROUP', 'group-abc');
    const changes = await getChangesSince(new Date(0));
    expect(changes).toHaveLength(1);
    expect(changes[0].entityId).toBe('group-abc');
    expect(changes[0].type).toBe('CREATE');
    expect(changes[0].entity).toBe('GROUP');
  });

  it('generates a unique id for each change', async () => {
    await recordChange('CREATE', 'GROUP', 'g1');
    await recordChange('UPDATE', 'GROUP', 'g2');
    const changes = await getChangesSince(new Date(0));
    const ids = changes.map((c: Change) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─── getChangesSince ──────────────────────────────────────────────────────────

describe('getChangesSince', () => {
  it('returns changes after the given date', async () => {
    const before = new Date();
    // Small delay to ensure timestamp is after `before`
    await new Promise((r) => setTimeout(r, 10));
    await recordChange('CREATE', 'GROUP', 'g-after');

    const results = await getChangesSince(before);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((c: Change) => c.entityId === 'g-after')).toBe(true);
  });

  it('returns empty array if no changes', async () => {
    const changes = await getChangesSince(new Date());
    expect(changes).toHaveLength(0);
  });
});

// ─── syncWithProvider ─────────────────────────────────────────────────────────

describe('syncWithProvider', () => {
  it('sets syncing status then success after sync', async () => {
    const mockProvider: SyncProvider = {
      upload: vi.fn().mockResolvedValue(undefined),
      download: vi.fn().mockResolvedValue(null),
    };

    const statusHistory: string[] = [];
    const unsub = useSyncStore.subscribe((s) => statusHistory.push(s.syncStatus));

    await syncWithProvider(mockProvider, makeFakeKey(), 'device-1');

    unsub();
    expect(statusHistory).toContain('syncing');
    expect(useSyncStore.getState().syncStatus).toBe('success');
  });

  it('calls provider.upload with encrypted payload', async () => {
    const upload = vi.fn().mockResolvedValue(undefined);
    const mockProvider: SyncProvider = {
      upload,
      download: vi.fn().mockResolvedValue(null),
    };

    await syncWithProvider(mockProvider, makeFakeKey(), 'device-42');

    expect(upload).toHaveBeenCalledOnce();
    const uploadArg = upload.mock.calls[0][0] as Record<string, unknown>;
    expect(uploadArg).toHaveProperty('ciphertext');
    expect(uploadArg).toHaveProperty('iv');
    expect(uploadArg.deviceId).toBe('device-42');
    expect(uploadArg.version).toBe(1);
  });

  it('merges remote groups into the store', async () => {
    const remoteGroup = makeGroup({ id: 'remote-g', name: 'Remote Group' });
    const remotePayload: SyncPayload = {
      groups: [remoteGroup],
      changes: [],
      metadata: { deviceId: 'remote-device', timestamp: Date.now(), version: 1 },
    };
    const remoteJson = JSON.stringify(remotePayload);

    const mockProvider: SyncProvider = {
      upload: vi.fn().mockResolvedValue(undefined),
      download: vi.fn().mockResolvedValue({
        ciphertext: btoa(remoteJson),
        iv: btoa('test-iv-123456'),
        timestamp: Date.now(),
        deviceId: 'remote-device',
        version: 1,
      }),
    };

    await syncWithProvider(mockProvider, makeFakeKey(), 'device-local');

    const groups = useGroupStore.getState().groups;
    // Remote group should be present (merged from empty local)
    expect(groups.some((g) => g.id === 'remote-g')).toBe(true);
  });

  it('sets error on provider failure', async () => {
    const mockProvider: SyncProvider = {
      upload: vi.fn().mockResolvedValue(undefined),
      download: vi.fn().mockRejectedValue(new Error('Network error')),
    };

    await expect(syncWithProvider(mockProvider, makeFakeKey(), 'device-1')).rejects.toThrow(
      'Network error'
    );
    expect(useSyncStore.getState().syncStatus).toBe('error');
    expect(useSyncStore.getState().error).toContain('Network error');
  });
});

// ─── queueOfflineSync / flushOfflineQueue ─────────────────────────────────────

describe('queueOfflineSync / flushOfflineQueue', () => {
  it('queues groups for offline sync via chrome.storage.local', async () => {
    const groups = [makeGroup({ id: 'offline-g' })];
    await queueOfflineSync(groups);

    expect(chrome.storage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        tabnova_offline_queue: expect.any(String),
      })
    );
  });

  it('flushes queue when online (calls syncWithProvider)', async () => {
    const mockProvider: SyncProvider = {
      upload: vi.fn().mockResolvedValue(undefined),
      download: vi.fn().mockResolvedValue(null),
    };

    // Simulate a queued entry
    vi.mocked(chrome.storage.local.get).mockImplementation(() =>
      Promise.resolve({
        tabnova_offline_queue: JSON.stringify({ groups: [], timestamp: Date.now() }),
      })
    );

    await flushOfflineQueue(mockProvider, makeFakeKey(), 'device-1');

    expect(mockProvider.upload).toHaveBeenCalledOnce();
    expect(chrome.storage.local.remove).toHaveBeenCalledWith('tabnova_offline_queue');
  });

  it('does nothing when offline queue is empty', async () => {
    const mockProvider: SyncProvider = {
      upload: vi.fn().mockResolvedValue(undefined),
      download: vi.fn().mockResolvedValue(null),
    };

    vi.mocked(chrome.storage.local.get).mockImplementation(() => Promise.resolve({}));

    await flushOfflineQueue(mockProvider, makeFakeKey(), 'device-1');

    expect(mockProvider.upload).not.toHaveBeenCalled();
  });
});
