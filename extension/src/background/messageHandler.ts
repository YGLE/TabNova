// Message types shared between popup, dashboard, and background

import {
  getAllGroupsWithTabs,
  createChromeGroup,
  removeChromeGroup,
  openAllTabsInGroup,
} from './chromeApi';
import { mapChromeGroupToTabGroup } from './chromeMapper';

export type MessageType =
  | 'GET_ALL_GROUPS'
  | 'SYNC_FROM_CHROME'
  | 'OPEN_GROUP_TABS'
  | 'OPEN_DASHBOARD'
  | 'PING'
  | 'CREATE_GROUP'
  | 'UPDATE_GROUP'
  | 'DELETE_GROUP';

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
): void {
  switch (request.type) {
    case 'PING':
      sendResponse({ success: true, data: 'pong' });
      break;

    case 'GET_ALL_GROUPS':
      handleGetAllGroups(sendResponse);
      break;

    case 'SYNC_FROM_CHROME':
      handleSyncFromChrome(sendResponse);
      break;

    case 'OPEN_GROUP_TABS':
      handleOpenGroupTabs(request.payload, sendResponse);
      break;

    case 'OPEN_DASHBOARD':
      handleOpenDashboard(sendResponse);
      break;

    case 'CREATE_GROUP':
      handleCreateGroup(request.payload, sendResponse);
      break;

    case 'UPDATE_GROUP':
      handleUpdateGroup(request.payload, sendResponse);
      break;

    case 'DELETE_GROUP':
      handleDeleteGroup(request.payload, sendResponse);
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
  payload: unknown,
  sendResponse: (response: MessageResponse) => void
): void {
  const { groupId } = payload as { groupId: number };
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
  payload: unknown,
  sendResponse: (response: MessageResponse) => void
): void {
  const { tabIds, title, color } = payload as {
    tabIds: number[];
    title: string;
    color?: chrome.tabGroups.ColorEnum;
  };
  createChromeGroup(tabIds, title, color)
    .then((groupId) => sendResponse({ success: true, data: groupId }))
    .catch((error: unknown) => sendResponse({ success: false, error: String(error) }));
}

function handleUpdateGroup(
  payload: unknown,
  sendResponse: (response: MessageResponse) => void
): void {
  const { chromeGroupId, title } = payload as {
    chromeGroupId: number;
    title?: string;
  };
  chrome.tabGroups
    .update(chromeGroupId, { ...(title !== undefined ? { title } : {}) })
    .then((updated) => sendResponse({ success: true, data: updated }))
    .catch((error: unknown) => sendResponse({ success: false, error: String(error) }));
}

function handleDeleteGroup(
  payload: unknown,
  sendResponse: (response: MessageResponse) => void
): void {
  const { chromeGroupId } = payload as { chromeGroupId: number };
  removeChromeGroup(chromeGroupId)
    .then(() => sendResponse({ success: true }))
    .catch((error: unknown) => sendResponse({ success: false, error: String(error) }));
}
