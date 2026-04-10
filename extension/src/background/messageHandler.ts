// Message types shared between popup, dashboard, and background

import {
  getAllGroupsWithTabs,
  createChromeGroup,
  removeChromeGroup,
  openAllTabsInGroup,
} from './chromeApi';
import { mapChromeGroupToTabGroup } from './chromeMapper';
import { useSyncStore } from '@store/syncStore';
import { loadSyncConfig, saveSyncConfig } from '@services/syncProviderFactory';
import { createSyncProvider } from '@services/syncProviderFactory';
import { syncWithProvider } from '@services/syncEngine';
import type { SyncConfig } from '@services/syncProviderFactory';

export type MessageType =
  | 'GET_ALL_GROUPS'
  | 'SYNC_FROM_CHROME'
  | 'OPEN_GROUP_TABS'
  | 'OPEN_DASHBOARD'
  | 'PING'
  | 'CREATE_GROUP'
  | 'UPDATE_GROUP'
  | 'DELETE_GROUP'
  | 'START_SYNC'
  | 'CONFIGURE_SYNC'
  | 'GET_SYNC_STATUS';

export interface Message {
  type: MessageType;
  payload?: unknown;
}

export interface MessageResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export function handleMessage(
  request: Message,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: MessageResponse) => void
): boolean | void {
  switch (request.type) {
    case 'PING':
      sendResponse({ success: true, data: 'pong' });
      break;

    case 'GET_ALL_GROUPS':
      handleGetAllGroups(sendResponse);
      return true; // keep channel open for async response

    case 'SYNC_FROM_CHROME':
      handleSyncFromChrome(sendResponse);
      return true; // keep channel open for async response

    case 'OPEN_GROUP_TABS':
      handleOpenGroupTabs(request.payload as { groupId: number }, sendResponse);
      return true; // keep channel open for async response

    case 'OPEN_DASHBOARD':
      handleOpenDashboard(sendResponse);
      return true; // keep channel open for async response

    case 'CREATE_GROUP':
      handleCreateGroup(
        request.payload as { tabIds: number[]; title: string; color?: string },
        sendResponse
      );
      return true; // keep channel open for async response

    case 'UPDATE_GROUP':
      handleUpdateGroup(request.payload as { chromeGroupId: number; title?: string }, sendResponse);
      return true; // keep channel open for async response

    case 'DELETE_GROUP':
      handleDeleteGroup(request.payload as { chromeGroupId: number }, sendResponse);
      return true; // keep channel open for async response

    case 'START_SYNC':
      handleStartSync(sendResponse);
      return true;

    case 'CONFIGURE_SYNC':
      handleConfigureSync(request.payload as SyncConfig, sendResponse);
      return true;

    case 'GET_SYNC_STATUS':
      handleGetSyncStatus(sendResponse);
      break;

    default:
      console.warn('[TabNova] Unknown message type:', request.type);
      sendResponse({ success: false, error: `Unknown message type: ${request.type}` });
  }
}

async function handleGetAllGroups(
  sendResponse: (response: MessageResponse) => void
): Promise<void> {
  try {
    const groups = await chrome.tabGroups.query({});
    sendResponse({ success: true, data: groups });
  } catch (error) {
    sendResponse({ success: false, error: String(error) });
  }
}

async function handleSyncFromChrome(
  sendResponse: (response: MessageResponse) => void
): Promise<void> {
  try {
    const groupsWithTabs = await getAllGroupsWithTabs();
    const mappedGroups = groupsWithTabs.map(({ group, tabs }) =>
      mapChromeGroupToTabGroup(group, tabs)
    );
    sendResponse({ success: true, data: mappedGroups });
  } catch (error) {
    sendResponse({ success: false, error: String(error) });
  }
}

function handleOpenGroupTabs(
  payload: { groupId: number },
  sendResponse: (response: MessageResponse) => void
): void {
  const { groupId } = payload;
  openAllTabsInGroup(groupId)
    .then(() => sendResponse({ success: true }))
    .catch((error: unknown) => sendResponse({ success: false, error: String(error) }));
}

async function handleOpenDashboard(
  sendResponse: (response: MessageResponse) => void
): Promise<void> {
  try {
    await chrome.tabs.create({
      url: chrome.runtime.getURL('dashboard.html'),
    });
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: String(error) });
  }
}

function handleCreateGroup(
  payload: { tabIds: number[]; title: string; color?: string },
  sendResponse: (response: MessageResponse) => void
): void {
  const { tabIds, title, color } = payload;
  createChromeGroup(tabIds, title, color as chrome.tabGroups.ColorEnum | undefined)
    .then((chromeGroupId) => sendResponse({ success: true, data: chromeGroupId }))
    .catch((error: unknown) => sendResponse({ success: false, error: String(error) }));
}

function handleUpdateGroup(
  payload: { chromeGroupId: number; title?: string },
  sendResponse: (response: MessageResponse) => void
): void {
  const { chromeGroupId, title } = payload;
  chrome.tabGroups
    .update(chromeGroupId, { ...(title !== undefined ? { title } : {}) })
    .then(() => sendResponse({ success: true }))
    .catch((error: unknown) => sendResponse({ success: false, error: String(error) }));
}

function handleDeleteGroup(
  payload: { chromeGroupId: number },
  sendResponse: (response: MessageResponse) => void
): void {
  const { chromeGroupId } = payload;
  removeChromeGroup(chromeGroupId)
    .then(() => sendResponse({ success: true }))
    .catch((error: unknown) => sendResponse({ success: false, error: String(error) }));
}

async function handleStartSync(sendResponse: (response: MessageResponse) => void): Promise<void> {
  try {
    const config = await loadSyncConfig();
    if (!config) {
      sendResponse({ success: false, error: 'No sync config found' });
      return;
    }
    const provider = await createSyncProvider(config);
    if (!provider) {
      sendResponse({ success: false, error: 'Failed to create sync provider' });
      return;
    }
    // Retrieve encryption key and device ID from storage before syncing.
    // These are set during initial setup; throw a clear error if missing.
    const stored = await chrome.storage.local.get(['tabnova_enc_key', 'tabnova_device_id']);
    const rawKey = stored['tabnova_enc_key'] as string | undefined;
    const deviceId = stored['tabnova_device_id'] as string | undefined;
    if (!rawKey || !deviceId) {
      sendResponse({ success: false, error: 'Encryption key or device ID not configured' });
      return;
    }
    const { importKey } = await import('@services/encryptionService');
    const encryptionKey = await importKey(rawKey);
    await syncWithProvider(provider, encryptionKey, deviceId);
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: String(error) });
  }
}

async function handleConfigureSync(
  payload: SyncConfig,
  sendResponse: (response: MessageResponse) => void
): Promise<void> {
  try {
    await saveSyncConfig(payload);
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: String(error) });
  }
}

function handleGetSyncStatus(sendResponse: (response: MessageResponse) => void): void {
  const state = useSyncStore.getState();
  sendResponse({ success: true, data: state });
}
