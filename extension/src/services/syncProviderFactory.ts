/**
 * syncProviderFactory.ts
 * Factory that creates the appropriate sync provider based on user configuration.
 */

import type { SyncProvider } from './syncEngine';
import { GoogleDriveSyncProvider, initiateGoogleAuth } from './googleDriveSync';
import { iCloudSyncProvider } from './iCloudSync';

export type SyncProviderType = 'google-drive' | 'icloud' | 'none';

export interface SyncConfig {
  provider: SyncProviderType;
  googleAccessToken?: string;
  icloudConfig?: {
    containerIdentifier: string;
    apiToken: string;
    environment: 'development' | 'production';
  };
}

const SYNC_CONFIG_KEY = 'tabnova_sync_config';

/** Creates the SyncProvider instance matching the given config, or null for 'none'. */
export async function createSyncProvider(config: SyncConfig): Promise<SyncProvider | null> {
  switch (config.provider) {
    case 'google-drive':
      if (!config.googleAccessToken) return null;
      return new GoogleDriveSyncProvider(config.googleAccessToken);
    case 'icloud':
      if (!config.icloudConfig) return null;
      return new iCloudSyncProvider(config.icloudConfig);
    case 'none':
    default:
      return null;
  }
}

/** Persists the sync config to chrome.storage.local (falls back to localStorage). */
export async function saveSyncConfig(config: SyncConfig): Promise<void> {
  try {
    await chrome.storage.local.set({ [SYNC_CONFIG_KEY]: JSON.stringify(config) });
  } catch {
    localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config));
  }
}

/** Loads the sync config from chrome.storage.local (falls back to localStorage). */
export async function loadSyncConfig(): Promise<SyncConfig | null> {
  try {
    const result = await chrome.storage.local.get(SYNC_CONFIG_KEY);
    const raw = result[SYNC_CONFIG_KEY] as string | undefined;
    return raw ? (JSON.parse(raw) as SyncConfig) : null;
  } catch {
    const raw = localStorage.getItem(SYNC_CONFIG_KEY);
    return raw ? (JSON.parse(raw) as SyncConfig) : null;
  }
}

/**
 * Runs the authentication flow for the given provider type.
 * Returns a ready-to-save SyncConfig, or null if the provider needs manual configuration.
 */
export async function authenticateProvider(type: SyncProviderType): Promise<SyncConfig | null> {
  switch (type) {
    case 'google-drive': {
      const token = await initiateGoogleAuth();
      return { provider: 'google-drive', googleAccessToken: token };
    }
    case 'icloud':
      // iCloud requires manual configuration (container ID + API token) via the UI.
      return null;
    default:
      return null;
  }
}
