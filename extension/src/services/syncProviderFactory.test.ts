import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createSyncProvider,
  saveSyncConfig,
  loadSyncConfig,
  authenticateProvider,
} from './syncProviderFactory';
import type { SyncConfig } from './syncProviderFactory';
import { GoogleDriveSyncProvider } from './googleDriveSync';
import { iCloudSyncProvider } from './iCloudSync';

const googleConfig: SyncConfig = {
  provider: 'google-drive',
  googleAccessToken: 'some-token',
};

const icloudConfig: SyncConfig = {
  provider: 'icloud',
  icloudConfig: {
    containerIdentifier: 'iCloud.com.tabnova',
    apiToken: 'api-token',
    environment: 'development',
  },
};

describe('syncProviderFactory', () => {
  describe('createSyncProvider', () => {
    it('creates a GoogleDriveSyncProvider for google-drive config', async () => {
      const provider = await createSyncProvider(googleConfig);
      expect(provider).toBeInstanceOf(GoogleDriveSyncProvider);
    });

    it('creates an iCloudSyncProvider for icloud config', async () => {
      const provider = await createSyncProvider(icloudConfig);
      expect(provider).toBeInstanceOf(iCloudSyncProvider);
    });

    it('returns null for "none" provider', async () => {
      const provider = await createSyncProvider({ provider: 'none' });
      expect(provider).toBeNull();
    });

    it('returns null for google-drive when access token is missing', async () => {
      const provider = await createSyncProvider({ provider: 'google-drive' });
      expect(provider).toBeNull();
    });

    it('returns null for icloud when icloudConfig is missing', async () => {
      const provider = await createSyncProvider({ provider: 'icloud' });
      expect(provider).toBeNull();
    });
  });

  describe('saveSyncConfig and loadSyncConfig', () => {
    beforeEach(() => {
      // Reset chrome.storage.local mock state
      vi.mocked(chrome.storage.local.set).mockImplementation(() => Promise.resolve());
      vi.mocked(chrome.storage.local.get).mockImplementation(() => Promise.resolve({}));
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('saves the config to chrome.storage.local', async () => {
      await saveSyncConfig(googleConfig);

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        tabnova_sync_config: JSON.stringify(googleConfig),
      });
    });

    it('loads the config from chrome.storage.local', async () => {
      vi.mocked(chrome.storage.local.get).mockImplementation(() =>
        Promise.resolve({ tabnova_sync_config: JSON.stringify(googleConfig) })
      );

      const loaded = await loadSyncConfig();
      expect(loaded).toEqual(googleConfig);
    });

    it('returns null when no config is stored', async () => {
      vi.mocked(chrome.storage.local.get).mockImplementation(() => Promise.resolve({}));

      const loaded = await loadSyncConfig();
      expect(loaded).toBeNull();
    });

    it('falls back to localStorage when chrome.storage.local.set throws', async () => {
      vi.mocked(chrome.storage.local.set).mockRejectedValue(new Error('unavailable'));
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      await saveSyncConfig(icloudConfig);

      expect(setItemSpy).toHaveBeenCalledWith('tabnova_sync_config', JSON.stringify(icloudConfig));
    });

    it('falls back to localStorage when chrome.storage.local.get throws', async () => {
      vi.mocked(chrome.storage.local.get).mockRejectedValue(new Error('unavailable'));
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(googleConfig));

      const loaded = await loadSyncConfig();
      expect(loaded).toEqual(googleConfig);
    });
  });

  describe('authenticateProvider', () => {
    it('returns a google-drive SyncConfig with a token for google-drive type', async () => {
      // chrome.identity.getAuthToken is mocked in test-setup to return 'mock-token'
      const config = await authenticateProvider('google-drive');
      expect(config).toEqual({
        provider: 'google-drive',
        googleAccessToken: 'mock-token',
      });
    });

    it('returns null for icloud (requires manual configuration)', async () => {
      const config = await authenticateProvider('icloud');
      expect(config).toBeNull();
    });

    it('returns null for "none" provider type', async () => {
      const config = await authenticateProvider('none');
      expect(config).toBeNull();
    });
  });
});
