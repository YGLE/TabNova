# 🤖 AGENT 3 - SPRINT 1 Brief

## Role: Frontend/UX Specialist

**Duration**: 2 days (SPRINT 1)
**Status**: 🟢 READY TO START
**Priority**: 🔴 HIGH

---

## 📋 Your Responsibilities

You are responsible for the **React application foundation**: App shell, component structure, state management, and styling with Tailwind CSS.

### Tasks (5 items, ~8-10 hours total)

---

#### ✅ Task 1: React App Shell (App.tsx)

**Location**: `extension/src/App.tsx`

```typescript
import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">✨ TabNova</h1>
        <nav className="app-nav">
          <button className="nav-btn" title="Settings">⚙️</button>
          <button className="nav-btn" title="Help">?</button>
        </nav>
      </header>

      <main className="app-main">
        <section className="search-section">
          <input
            type="text"
            placeholder="🔍 Chercher..."
            className="search-input"
          />
        </section>

        <section className="content-section">
          <div className="bubble-cluster">
            <p className="placeholder">
              Bubble cluster will render here (SPRINT 3)
            </p>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <button className="btn-primary">+ Créer groupe</button>
      </footer>
    </div>
  );
}

export default App;
```

**Location**: `extension/src/App.css`

```css
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: var(--color-black);
  color: var(--color-white);
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-gray-dark);
  height: 56px;
  background: var(--color-black);
}

.app-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.app-nav {
  display: flex;
  gap: 8px;
}

.nav-btn {
  background: none;
  border: none;
  color: var(--color-gray-70);
  font-size: 16px;
  cursor: pointer;
  transition: color 200ms;
  padding: 4px 8px;
}

.nav-btn:hover {
  color: var(--color-white);
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-section {
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

.content-section {
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bubble-cluster {
  width: 100%;
  height: 100%;
  position: relative;
}

.placeholder {
  color: var(--color-gray-40);
  text-align: center;
  margin-top: 50%;
}

.app-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--color-gray-dark);
}

.btn-primary {
  width: 100%;
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

.btn-primary:active {
  transform: scale(0.98);
}
```

**Also create**: `extension/src/index.css` (global styles)

```css
:root {
  --color-black: #000000;
  --color-white: #FFFFFF;
  --color-gray-70: #B0B0B0;
  --color-gray-40: #6B7280;
  --color-gray-dark: #1F2937;
  --color-gray-darker: #111827;

  --color-blue: #3B82F6;
  --color-pink: #EC4899;
  --color-yellow: #FBBF24;
  --color-green: #10B981;
  --color-purple: #8B5CF6;
  --color-cyan: #06B6D4;
  --color-orange: #F97316;
  --color-indigo: #6366F1;

  --color-danger: #EF4444;
  --color-success: #10B981;

  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'Fira Code', 'Monaco', 'Courier New', monospace;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  background: var(--color-black);
  color: var(--color-white);
  font-family: var(--font-family);
  overflow: hidden;
}

#root {
  width: 100%;
  height: 100%;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--color-black);
}

::-webkit-scrollbar-thumb {
  background: var(--color-gray-dark);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-70);
}
```

**Estimated time**: 1 hour

---

#### ✅ Task 2: Zustand Stores Skeleton

**Location**: `extension/src/store/groupStore.ts`

```typescript
import { create } from 'zustand';
import type { TabGroup, Tab } from '@tabnova-types';

interface GroupState {
  groups: TabGroup[];
  selectedGroupId: string | null;
  
  // Actions
  setGroups: (groups: TabGroup[]) => void;
  addGroup: (group: TabGroup) => void;
  updateGroup: (id: string, updates: Partial<TabGroup>) => void;
  deleteGroup: (id: string) => void;
  selectGroup: (id: string | null) => void;
}

export const useGroupStore = create<GroupState>((set) => ({
  groups: [],
  selectedGroupId: null,

  setGroups: (groups) => set({ groups }),
  
  addGroup: (group) => set((state) => ({
    groups: [...state.groups, group],
  })),
  
  updateGroup: (id, updates) => set((state) => ({
    groups: state.groups.map((g) =>
      g.id === id ? { ...g, ...updates } : g
    ),
  })),
  
  deleteGroup: (id) => set((state) => ({
    groups: state.groups.filter((g) => g.id !== id),
    selectedGroupId: state.selectedGroupId === id ? null : state.selectedGroupId,
  })),
  
  selectGroup: (id) => set({ selectedGroupId: id }),
}));
```

**Location**: `extension/src/store/syncStore.ts`

```typescript
import { create } from 'zustand';

interface SyncState {
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncAt: Date | null;
  error: string | null;
  
  // Actions
  setSyncStatus: (status: SyncState['syncStatus']) => void;
  setLastSyncAt: (date: Date) => void;
  setError: (error: string | null) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  syncStatus: 'idle',
  lastSyncAt: null,
  error: null,

  setSyncStatus: (status) => set({ syncStatus: status }),
  setLastSyncAt: (date) => set({ lastSyncAt: date }),
  setError: (error) => set({ error }),
}));
```

**Location**: `extension/src/store/uiStore.ts`

```typescript
import { create } from 'zustand';

interface UIState {
  hoveredGroupId: string | null;
  searchQuery: string;
  viewMode: 'bubble' | 'list';
  isLoading: boolean;
  
  // Actions
  setHoveredGroupId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: UIState['viewMode']) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  hoveredGroupId: null,
  searchQuery: '',
  viewMode: 'bubble',
  isLoading: false,

  setHoveredGroupId: (id) => set({ hoveredGroupId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
```

**Location**: `extension/src/store/undoStore.ts`

```typescript
import { create } from 'zustand';

export interface UndoAction {
  type: string;
  undo: () => void;
  redo: () => void;
}

interface UndoState {
  history: UndoAction[];
  currentIndex: number;
  
  // Actions
  push: (action: UndoAction) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

export const useUndoStore = create<UndoState>((set, get) => ({
  history: [],
  currentIndex: -1,

  push: (action) => set((state) => {
    const newHistory = state.history.slice(0, state.currentIndex + 1);
    newHistory.push(action);
    
    // Keep only last 5 actions
    if (newHistory.length > 5) {
      newHistory.shift();
    }
    
    return {
      history: newHistory,
      currentIndex: newHistory.length - 1,
    };
  }),

  undo: () => {
    const state = get();
    if (state.currentIndex > 0) {
      state.history[state.currentIndex].undo();
      set({ currentIndex: state.currentIndex - 1 });
    }
  },

  redo: () => {
    const state = get();
    if (state.currentIndex < state.history.length - 1) {
      set({ currentIndex: state.currentIndex + 1 });
      state.history[state.currentIndex + 1].redo();
    }
  },

  clear: () => set({ history: [], currentIndex: -1 }),
}));
```

**Estimated time**: 1.5 hours

---

#### ✅ Task 3: Layout + Navbar Component

**Location**: `extension/src/components/Layout.tsx`

```typescript
import React, { ReactNode } from 'react';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <header className="layout-header">
        <h1 className="layout-title">✨ TabNova</h1>
        <nav className="layout-nav">
          <button className="layout-nav-btn" title="Settings">
            ⚙️
          </button>
          <button className="layout-nav-btn" title="Help">
            ?
          </button>
        </nav>
      </header>

      <main className="layout-main">
        {children}
      </main>
    </div>
  );
}
```

**Location**: `extension/src/components/Layout.css`

```css
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: var(--color-black);
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-gray-dark);
  height: 56px;
  flex-shrink: 0;
}

.layout-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--color-white);
}

.layout-nav {
  display: flex;
  gap: 8px;
}

.layout-nav-btn {
  background: none;
  border: none;
  color: var(--color-gray-70);
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  transition: color 200ms;
  border-radius: 4px;
}

.layout-nav-btn:hover {
  color: var(--color-white);
  background: rgba(255, 255, 255, 0.05);
}

.layout-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
```

**Estimated time**: 1 hour

---

#### ✅ Task 4: Tailwind CSS Config + Dark Theme

**Location**: `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './extension/**/*.{html,tsx,ts}',
  ],
  theme: {
    extend: {
      colors: {
        'tabnova-black': '#000000',
        'tabnova-blue': '#3B82F6',
        'tabnova-pink': '#EC4899',
        'tabnova-yellow': '#FBBF24',
        'tabnova-green': '#10B981',
        'tabnova-purple': '#8B5CF6',
        'tabnova-cyan': '#06B6D4',
        'tabnova-orange': '#F97316',
        'tabnova-indigo': '#6366F1',
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'mono': ['Fira Code', 'Monaco', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
  darkMode: 'class', // Enable dark mode
};
```

**Location**: `postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Update**: `extension/src/index.css` to import Tailwind

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* TabNova CSS variables override */
:root {
  --color-black: #000000;
  --color-white: #FFFFFF;
  --color-gray-70: #B0B0B0;
  --color-gray-40: #6B7280;
  --color-gray-dark: #1F2937;
  --color-gray-darker: #111827;

  --color-blue: #3B82F6;
  --color-pink: #EC4899;
  --color-yellow: #FBBF24;
  --color-green: #10B981;
  --color-purple: #8B5CF6;
  --color-cyan: #06B6D4;
  --color-orange: #F97316;
  --color-indigo: #6366F1;

  --color-danger: #EF4444;
  --color-success: #10B981;

  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'Fira Code', 'Monaco', 'Courier New', monospace;
}

html {
  background: var(--color-black);
  color: var(--color-white);
}

/* TabNova is dark-mode only — no toggle needed */
```

**Estimated time**: 1 hour

---

#### ✅ Task 5: Font Setup (Inter + Fira Code)

**Update**: `extension/src/index.html` (or create it)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TabNova</title>

  <!-- Google Fonts: Inter + Fira Code -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- CSS -->
  <link rel="stylesheet" href="./index.css">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./App.tsx"></script>
</body>
</html>
```

**Or update package.json** to include fonts as dependencies:

In `package.json`, add to `devDependencies`:
```json
"@fontsource/inter": "^5.0.0",
"@fontsource/fira-code": "^5.0.0"
```

Then in `extension/src/index.css`:
```css
@import '@fontsource/inter';
@import '@fontsource/fira-code';
```

**Verify fonts load:**
- Open DevTools → Sources
- Check that Inter and Fira Code fonts are loaded
- Open DevTools → Elements
- Check that font-family is correct

**Estimated time**: 45 minutes

---

## 📦 Deliverables

✅ `extension/src/App.tsx` created
✅ `extension/src/index.css` with global styles
✅ All 4 Zustand stores created (group, sync, ui, undo)
✅ `extension/src/components/Layout.tsx` created
✅ `tailwind.config.js` configured
✅ `postcss.config.js` configured
✅ Google Fonts loaded (Inter + Fira Code)
✅ Dark theme enabled globally
✅ CSS variables set up
✅ All colors match design specs
✅ Responsive breakpoints configured

---

## 🔗 Dependencies

**BLOCKED by AGENT 1** (wait for types/ folder before importing)
**Can START in parallel** with basic setup

---

## ✅ Validation Checklist

- [ ] `npm run dev` starts without errors
- [ ] App shell renders correctly
- [ ] Dark theme applied globally
- [ ] Stores can be imported and used
- [ ] Fonts load correctly (Inter + Fira Code)
- [ ] Colors match design specs
- [ ] Responsive on different viewport sizes
- [ ] All CSS follows naming conventions
- [ ] Tailwind utilities work
- [ ] No console errors

---

## 🚀 When You're Done

1. **Create a commit** with message:
   ```
   feat(SPRINT1-AGENT3): Add React app shell, Zustand stores, Tailwind setup
   ```

2. **Notify AGENT 1 and 2** that React app is ready

3. **Update todo list** - mark tasks as COMPLETED

---

**Good luck! You've got this! 🔥**

---

**Generated**: 2025-04-09
**Status**: 🟢 READY
