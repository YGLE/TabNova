# 🤖 AGENT 2 - SPRINT 1 Brief

## Role: Extension/Browser Specialist

**Duration**: 2 days (SPRINT 1)
**Status**: 🟢 READY TO START
**Priority**: 🔴 HIGH

---

## 📋 Your Responsibilities

You are responsible for the **Chrome Extension foundation**: Manifest V3, Service Worker, and popup/dashboard HTML structure.

### Tasks (5 items, ~8-10 hours total)

---

#### ✅ Task 1: Create manifest.json (Manifest V3)

**Location**: `extension/manifest.json`

```json
{
  "manifest_version": 3,
  "name": "TabNova",
  "version": "0.1.0",
  "description": "Web Bookmarks Manager - Revolutionary tab groups management with interactive bubble visualization",
  
  "permissions": [
    "tabGroups",
    "tabs",
    "storage",
    "alarms"
  ],
  
  "host_permissions": [
    "<all_urls>"
  ],
  
  "action": {
    "default_popup": "popup.html",
    "default_title": "TabNova",
    "default_icon": {
      "16": "icons/icon-16.png",
      "32": "icons/icon-32.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  
  "background": {
    "service_worker": "background.js"
  },
  
  "icons": {
    "16": "icons/icon-16.png",
    "32": "icons/icon-32.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },
  
  "commands": {
    "_execute_action": {
      "suggested_key": {
        "default": "Ctrl+Shift+Y",
        "mac": "Command+Shift+Y"
      }
    },
    "search": {
      "suggested_key": {
        "default": "Ctrl+K",
        "mac": "Command+K"
      },
      "description": "Search groups"
    }
  }
}
```

**Create icons**: `extension/public/icons/`
- Create placeholder icons (can be simple colored squares for now):
  - `icon-16.png` (16x16px)
  - `icon-32.png` (32x32px)
  - `icon-48.png` (48x48px)
  - `icon-128.png` (128x128px)

**Estimated time**: 45 minutes

---

#### ✅ Task 2: Service Worker Skeleton

**Location**: `extension/src/background/index.ts`

```typescript
// Service Worker for TabNova Extension

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('[TabNova] Extension installed');
  // TODO: Future - check if first installation, show welcome page
});

// Listen for tab group updates from Chrome
chrome.tabGroups.onUpdated.addListener((tabGroup) => {
  console.log('[TabNova] Tab group updated:', tabGroup);
  // TODO: SPRINT 2 - Sync to IndexedDB
});

// Listen for messages from popup/content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[TabNova] Message received:', request);
  
  switch (request.type) {
    case 'SYNC_GROUPS':
      // TODO: SPRINT 2 - Sync groups from Chrome
      sendResponse({ status: 'ok' });
      break;
    default:
      console.warn('[TabNova] Unknown message type:', request.type);
  }
});

// Periodic background tasks
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('[TabNova] Alarm triggered:', alarm.name);
  // TODO: SPRINT 5 - Background sync
});

export {};
```

**Also create**: `extension/src/background/chromeApi.ts`

```typescript
// Wrapper around Chrome APIs for easier testing/mocking

export async function getAllTabGroups() {
  try {
    const groups = await chrome.tabGroups.query({});
    return groups;
  } catch (error) {
    console.error('[TabNova] Error fetching tab groups:', error);
    return [];
  }
}

export async function createTabGroup(title: string, color: string) {
  try {
    // Chrome API doesn't create groups directly, groups are created from tabs
    console.log('[TabNova] Create group:', title, color);
    // TODO: Implement in SPRINT 2
  } catch (error) {
    console.error('[TabNova] Error creating tab group:', error);
  }
}

export async function updateTabGroup(groupId: number, updates: any) {
  try {
    await chrome.tabGroups.update(groupId, updates);
    console.log('[TabNova] Group updated:', groupId);
  } catch (error) {
    console.error('[TabNova] Error updating tab group:', error);
  }
}
```

**Estimated time**: 1 hour

---

#### ✅ Task 3: Popup HTML/CSS + Entry Point

**Location**: `extension/src/popup/index.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './popup.css';

function Popup() {
  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>✨ TabNova</h1>
        <div className="header-buttons">
          <button className="icon-btn" title="Settings">⚙️</button>
          <button className="icon-btn" title="Open Manager">↗️</button>
        </div>
      </header>

      <div className="popup-search">
        <input
          type="text"
          placeholder="🔍 Chercher..."
          className="search-input"
        />
      </div>

      <main className="popup-content">
        <p style={{ color: '#B0B0B0', textAlign: 'center', padding: '20px' }}>
          Loading groups...
        </p>
        {/* TODO: SPRINT 2 - Add groups list here */}
      </main>

      <footer className="popup-footer">
        <button className="btn-primary">+ Créer groupe</button>
        <button className="btn-secondary">Ouvrir →</button>
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<Popup />);
```

**Location**: `extension/src/popup/popup.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --color-black: #000000;
  --color-white: #FFFFFF;
  --color-gray-70: #B0B0B0;
  --color-gray-dark: #1F2937;
  --color-blue: #3B82F6;
}

body {
  width: 450px;
  min-height: 600px;
  background: var(--color-black);
  color: var(--color-white);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.popup-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--color-black);
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-gray-dark);
  height: 56px;
}

.popup-header h1 {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.header-buttons {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: none;
  color: var(--color-gray-70);
  font-size: 18px;
  cursor: pointer;
  transition: color 200ms;
}

.icon-btn:hover {
  color: var(--color-white);
}

.popup-search {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-gray-dark);
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  background: var(--color-gray-dark);
  border: 1px solid #374151;
  border-radius: 6px;
  color: var(--color-white);
  font-size: 14px;
  transition: border-color 200ms;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-blue);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.popup-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--color-gray-dark);
  display: flex;
  gap: 8px;
}

.btn-primary {
  flex: 1;
  padding: 10px 20px;
  background: var(--color-blue);
  color: var(--color-white);
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  height: 40px;
  transition: all 200ms;
}

.btn-primary:hover {
  background: #2563EB;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
}

.btn-secondary {
  padding: 10px 20px;
  background: transparent;
  color: var(--color-gray-70);
  border: 1px solid var(--color-gray-dark);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  height: 40px;
  transition: all 200ms;
}

.btn-secondary:hover {
  background: var(--color-gray-dark);
  color: var(--color-white);
}
```

**Location**: `extension/public/popup.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TabNova</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="../src/popup/index.tsx"></script>
</body>
</html>
```

**Estimated time**: 1.5 hours

---

#### ✅ Task 4: Dashboard HTML/CSS + Entry Point

**Location**: `extension/src/dashboard/index.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>✨ TabNova</h1>
        <div className="header-controls">
          <input
            type="text"
            placeholder="🔍 Chercher..."
            className="search-input"
          />
          <button className="nav-btn">⭐ Favoris</button>
          <button className="nav-btn">⚙️</button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="bubble-canvas">
          <p style={{ color: '#B0B0B0', textAlign: 'center', marginTop: '50%' }}>
            Loading bubble cluster...
          </p>
          {/* TODO: SPRINT 3 - Add D3.js bubble cluster here */}
        </div>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<Dashboard />);
```

**Location**: `extension/src/dashboard/dashboard.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --color-black: #000000;
  --color-white: #FFFFFF;
  --color-gray-dark: #1F2937;
}

body {
  background: var(--color-black);
  color: var(--color-white);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.dashboard-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: var(--color-black);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid var(--color-gray-dark);
  height: 64px;
}

.dashboard-header h1 {
  font-size: 20px;
  font-weight: 700;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  margin-left: 20px;
}

.search-input {
  flex: 1;
  max-width: 400px;
  padding: 8px 12px;
  background: var(--color-gray-dark);
  border: 1px solid #374151;
  border-radius: 6px;
  color: var(--color-white);
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.nav-btn {
  background: none;
  border: none;
  color: var(--color-white);
  cursor: pointer;
  font-size: 14px;
  padding: 8px 12px;
  transition: opacity 200ms;
}

.nav-btn:hover {
  opacity: 0.8;
}

.dashboard-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.bubble-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--color-black);
}
```

**Location**: `extension/public/dashboard.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TabNova - Dashboard</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="../src/dashboard/index.tsx"></script>
</body>
</html>
```

**Estimated time**: 1.5 hours

---

#### ✅ Task 5: Extension Loads in Chrome (No Errors)

**Build and test the extension:**

```bash
# 1. Build extension
npm run build:extension

# 2. Open Chrome DevTools
# Go to: chrome://extensions/

# 3. Enable Developer mode (top-right toggle)

# 4. Click "Load unpacked"
# Select: ~/Projects/TabNova/dist (or wherever Vite outputs)

# 5. Extension should appear in list with no errors
# 6. Click the extension icon in toolbar → popup should load
```

**Expected behavior:**
- ✓ Extension appears in `chrome://extensions/`
- ✓ Extension icon visible in toolbar
- ✓ Clicking icon shows popup (with loading message)
- ✓ No JavaScript errors in console
- ✓ manifest.json validates
- ✓ Service Worker active (visible in DevTools)

**Troubleshooting:**
- Check `chrome://extensions/` → "Errors" button for details
- Check DevTools → Service Workers tab
- Check `npm run build:extension` output for build errors

**Estimated time**: 1 hour (including troubleshooting)

---

## 📦 Deliverables

✅ `extension/manifest.json` created (Manifest V3)
✅ Extension icons created (4 sizes)
✅ `extension/src/background/index.ts` with listeners
✅ `extension/src/background/chromeApi.ts` with Chrome API wrapper
✅ `extension/src/popup/` folder complete
✅ `extension/src/dashboard/` folder complete
✅ Extension loads in Chrome without errors
✅ Popup opens and displays
✅ Dashboard tab can be opened
✅ Service Worker is active
✅ No JavaScript errors in console

---

## 🔗 Dependencies

**BLOCKED by AGENT 1** (wait for types/ folder before integrating)
**Can START in parallel** with basic setup

---

## ✅ Validation Checklist

- [ ] manifest.json is valid (no errors in DevTools)
- [ ] Extension loads in Chrome
- [ ] Popup opens without errors
- [ ] Dashboard tab can be accessed
- [ ] Service Worker is running
- [ ] Icons display correctly
- [ ] Keyboard shortcuts work (Cmd+Shift+Y on Mac)
- [ ] All CSS is dark theme
- [ ] No console errors
- [ ] Code follows TypeScript + Prettier formatting

---

## 🚀 When You're Done

1. **Create a commit** with message:
   ```
   feat(SPRINT1-AGENT2): Add extension manifest, service worker, popup/dashboard
   ```

2. **Notify AGENT 1 and 3** that extension is ready

3. **Update todo list** - mark tasks as COMPLETED

---

**Good luck! You've got this! 🔥**

---

**Generated**: 2025-04-09
**Status**: 🟢 READY
