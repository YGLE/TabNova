// TabNova Service Worker (background.ts)
// Manifest V3 - runs as a Service Worker

import { setupContextMenus } from './chromeApi';
import { handleMessage } from './messageHandler';

// ── Extension lifecycle ──────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[TabNova] Extension installed/updated:', details.reason);
  await setupContextMenus();
  // Future SPRINT 2: import existing Chrome groups on first install
});

// ── Tab Group listeners ──────────────────────────────────────────────────────

chrome.tabGroups.onCreated.addListener((tabGroup) => {
  console.log('[TabNova] Tab group created:', tabGroup);
  // TODO SPRINT 2: Sync to IndexedDB
});

chrome.tabGroups.onUpdated.addListener((tabGroup) => {
  console.log('[TabNova] Tab group updated:', tabGroup);
  // Broadcast to all tabs/popups listening for real-time updates
  chrome.runtime.sendMessage({
    type: 'CHROME_GROUP_UPDATED',
    payload: tabGroup,
  }).catch(() => {}); // ignore if no listener is open
});

chrome.tabGroups.onRemoved.addListener((tabGroup) => {
  console.log('[TabNova] Tab group removed:', tabGroup);
  // TODO SPRINT 2: Remove from IndexedDB
});

// ── Tab listeners ────────────────────────────────────────────────────────────

chrome.tabs.onCreated.addListener((tab) => {
  console.log('[TabNova] Tab created:', tab.id);
  // TODO SPRINT 2: Track in IndexedDB
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log('[TabNova] Tab removed:', tabId);
  if (!removeInfo.isWindowClosing) {
    // Broadcast so UI can refresh groups in case a group disappeared
    chrome.runtime.sendMessage({
      type: 'CHROME_TABS_CHANGED',
      payload: null,
    }).catch(() => {});
  }
});

// ── Message handling ─────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[TabNova] Message received:', request.type);
  handleMessage(request, sender, sendResponse);
  return true; // Keep message channel open for async responses
});

// ── Alarms (background sync) ─────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('[TabNova] Alarm triggered:', alarm.name);
  // TODO SPRINT 5: Background sync
});

// ── Commands (keyboard shortcuts) ────────────────────────────────────────────

chrome.commands.onCommand.addListener((command) => {
  console.log('[TabNova] Command triggered:', command);
  if (command === 'search') {
    // TODO: Focus search in popup
  }
});

console.log('[TabNova] Service Worker initialized');
