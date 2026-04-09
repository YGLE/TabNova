// Message types shared between popup, dashboard, and background

export type MessageType =
  | 'GET_ALL_GROUPS'
  | 'SYNC_FROM_CHROME'
  | 'OPEN_GROUP_TABS'
  | 'OPEN_DASHBOARD'
  | 'PING';

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
      // TODO SPRINT 2: Implement sync from Chrome to IndexedDB
      sendResponse({ success: true, data: [] });
      break;

    case 'OPEN_GROUP_TABS':
      // TODO SPRINT 2: Open all tabs in a group
      sendResponse({ success: true });
      break;

    case 'OPEN_DASHBOARD':
      handleOpenDashboard(sendResponse);
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
