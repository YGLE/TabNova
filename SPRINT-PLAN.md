# 🚀 TabNova - Sprint Plan & Agent Assignments

## Overview
TabNova is a revolutionary Chrome/Edge extension for managing web bookmarks with an interactive bubble visualization interface. This document outlines the 6-sprint development plan with agent assignments.

**Total Timeline**: ~15-17 days (3 weeks) for PHASE 1

---

## 🤖 Agent Assignments

### **AGENT 1: Fullstack/Backend Specialist**
**Expertise**: Architecture, TypeScript, Node.js, Storage, Tests, CI/CD

**Responsibilities**:
- Infrastructure & repository setup
- TypeScript types & validation (Zod)
- IndexedDB storage & migrations
- Services & business logic (CRUD, Sync)
- Backend Node.js (optional)
- Testing & CI/CD

**Tools**: TypeScript, Node.js, Vitest, Git, Bash

---

### **AGENT 2: Extension/Browser Specialist**
**Expertise**: Chrome Extensions, Manifest V3, APIs, Sync Engines, Packaging

**Responsibilities**:
- Manifest V3 configuration
- Service Worker development
- Chrome API integration (tabGroups, tabs, storage)
- Message passing (IPC) system
- Sync engines (Google Drive, iCloud, backend)
- Background sync & offline handling
- Extension packaging & distribution

**Tools**: Chrome Extension APIs, Manifest V3, TypeScript, Git

---

### **AGENT 3: Frontend/UX Specialist**
**Expertise**: React, D3.js, TypeScript, Tailwind CSS, Animations, Performance

**Responsibilities**:
- React 18 app structure
- D3.js bubble cluster visualization
- UI components (modals, forms, search bar)
- Tailwind CSS styling
- Animations (explosion, hover, drag-drop)
- State management (Zustand hooks)
- Performance optimization
- Accessibility & responsive design

**Tools**: React, TypeScript, D3.js, Vite, Tailwind CSS, Git

---

## 📅 Sprint Breakdown

### **SPRINT 1: Foundations (Days 1-2)**

#### AGENT 1: Infrastructure & Types
```
✅ Repo structure validation (already done)
✅ package.json + dependencies
✅ TypeScript config + path aliases
✅ ESLint + Prettier setup
✅ GitHub Actions skeleton
✅ Create types/ folder structure
✅ Zod validators for all types
✅ IndexedDB schema design
✅ Tests skeleton (vitest.config.ts)
✅ Documentation (README, ARCHITECTURE, SETUP)

Deliverables:
- Repo ready to develop in
- All types exported from types/index.ts
- Zod validators 100% defined
- DB schema with migrations
- CI/CD pipeline skeleton
```

#### AGENT 2: Extension Skeleton & Manifest
```
✅ manifest.json (Manifest V3)
✅ background.ts (Service Worker entry)
✅ popup.html, popup.tsx
✅ dashboard.html, dashboard.tsx
✅ Extension icons (16, 32, 128px)
✅ Vite config for extension build
✅ Extension loads in Chrome without errors
✅ Message types defined

Deliverables:
- Extension loads in chrome://extensions/
- Popup opens without errors
- Dashboard tab opens
- No runtime errors in console
```

#### AGENT 3: React App Shell & Layout
```
✅ App.tsx root component
✅ Layout component (navbar + canvas area)
✅ Zustand store setup skeleton
  - groupStore
  - syncStore
  - uiStore
✅ Tailwind CSS config + base styles
✅ Dark mode setup (dark-only theme)
✅ Component folder structure
✅ Responsive breakpoints
✅ Font setup (Inter + Fira Code from Google Fonts)

Deliverables:
- React app boots without errors
- Layout displays correctly
- Stores accessible from components
- Tailwind styles applied
- Typography looks good
```

---

### **SPRINT 2: Chrome Integration (Days 3-4)**

#### AGENT 2: Chrome API Integration
```
Depends on: SPRINT 1 (types, manifest, message types)

✅ chrome.tabGroups.query() - get all groups
✅ Map Chrome groups to TabGroup interface
✅ chrome.tabGroups.onUpdated listener
✅ chrome.tabs.query() - get tabs in group
✅ Fetch favicons (cross-origin CORS)
✅ Content script for tab detection (optional)
✅ Chrome API wrapper (chromeApi.ts)
✅ Tests for Chrome API (with chrome mock)

Deliverables:
- Groups retrieved from Chrome and logged
- Tabs within groups accessible
- Favicons fetched & displayed
- onUpdated listener working
- Tests passing (100% Chrome API coverage)
```

#### AGENT 1: IndexedDB Storage
```
Depends on: Types (SPRINT 1) + Chrome data (AGENT 2)

✅ IndexedDB initialization (db.ts)
✅ Object stores: groups, tabs, syncMetadata
✅ Indexes: by groupId, createdAt, etc.
✅ CRUD operations complete
  - CREATE group/tab
  - READ all/by ID
  - UPDATE properties
  - DELETE
✅ Transactions for atomicity
✅ Migration system (for DB schema updates)
✅ Tests: CRUD, transactions, migrations
✅ Performance tests (1000 groups insertion)

Deliverables:
- IndexedDB fully functional
- Data persists across browser restarts
- Tests 100% passing
- No race conditions
```

#### AGENT 3: Popup Basic UI
```
Depends on: Storage (AGENT 1) + React shell (SPRINT 1)

✅ Popup component showing group list
✅ useTabGroups hook (fetches from store)
✅ Display: Group name + count badge + color
✅ Buttons:
  - "Sync from Chrome"
  - "Open Manager" (links to dashboard)
✅ Sync status indicator (✓ or ⏳)
✅ Tailwind styling
✅ Tests: Component render, button clicks
✅ Error boundary handling

Deliverables:
- Popup displays all groups
- Buttons functional (callback only, no action yet)
- Responsive (fits 400x600px)
- Tests passing
```

---

### **SPRINT 3: Visualization & D3 (Days 5-6)**

#### AGENT 3: D3.js Bubble Cluster
```
Depends on: Types (SPRINT 1)

✅ BubbleCluster.tsx component (D3.js)
✅ Force-directed simulation OR particle system
✅ Bubble rendering:
  - Main bubble: 80px diameter, group color
  - Satellite bubbles: 40px, tooltip on hover
✅ Animation:
  - Entrance: Explosion 800ms from center
  - Hover: Scale 1.05, glow effect
  - Drag: Spring physics
✅ Interactivity:
  - Hover → show onglets in orbit
  - Click bubble → callback (parent handles)
  - Drag → reorder position
✅ Zoom functionality (D3 zoom)
  - Min: see all groups
  - Max: 3x zoom
✅ Particles background (SVG or Canvas)
  - 30-50 stars @ 20-40% opacity
  - Slow random movement
✅ Responsive: Popup + fullscreen
✅ Tests: Snapshots, interactions

Deliverables:
- D3 component renders beautifully
- Animations smooth (60 FPS)
- Particles background subtle & lovely
- Tests passing
- Zero performance issues
```

#### AGENT 1: React State Management
```
Depends on: Zustand skeleton (SPRINT 1) + Stores needed

✅ groupStore (Zustand):
  - groups: TabGroup[]
  - setGroups(groups)
  - addGroup(group)
  - updateGroup(id, patch)
  - deleteGroup(id)
✅ syncStore:
  - syncStatus: 'idle' | 'syncing' | 'error'
  - setSyncStatus(status)
✅ uiStore:
  - selectedGroupId: string | null
  - hoveredGroupId: string | null
  - viewMode: 'bubble' | 'list'
✅ Connect stores to components
✅ Connect IndexedDB to stores (load on init)
✅ Tests: Store updates, selectors

Deliverables:
- State management fully functional
- Stores properly initialized
- Components can read/write state
- Tests 100% passing
```

#### AGENT 2: Message Passing (IPC)
```
Depends on: Service Worker (SPRINT 1) + Chrome API (SPRINT 2)

✅ messageHandler.ts in background
  - Listen for messages from popup/dashboard
  - Route to appropriate handler
✅ Message types (in types/):
  - CREATE_GROUP
  - UPDATE_GROUP
  - DELETE_GROUP
  - SYNC_REQUEST
  - etc.
✅ Hooks in components:
  - useMessage() - send message to background
  - useBackgroundMessage() - listen for updates
✅ Broadcast updates to all tabs
✅ Tests: Message passing, routing

Deliverables:
- Popup ↔ Background communication working
- Updates broadcast to all open tabs
- Tests passing
```

---

### **SPRINT 4: CRUD & Gestion Avancée (Days 7-8)**

#### AGENT 3: Forms & Modals
```
Depends on: React state (SPRINT 3) + UI shell

✅ GroupForm component:
  - Name input (required, max 30 chars)
  - Color picker (palette + custom)
✅ Modal wrapper (reusable)
✅ Modal creation (inline in grappe)
✅ Modal editing (group details)
✅ SearchBar component (header)
  - Input field
  - Clear button (X)
  - Debounced search
✅ ContextMenu (right-click)
  - Rename, Delete, Merge options
✅ Toast notifications (react-hot-toast)
  - Success/Error/Info types
✅ Validations:
  - Name required
  - Name < 30 chars
  - Color valid hex
✅ Tests: Form submission, validation, errors

Deliverables:
- Create/Edit/Delete forms working
- Validation messages clear
- Toast notifications smooth
- Tests 100% passing
```

#### AGENT 1: Services & Business Logic
```
Depends on: Storage (SPRINT 2) + Types

✅ groupService.ts:
  - create(name, color) → TabGroup
  - update(id, patch) → TabGroup
  - delete(id) → void
  - merge(ids[], finalName) → TabGroup
  - reorder(newOrder) → void
  - pin(id) → void
  - archive(id) → void
✅ tabService.ts:
  - addTab(groupId, url) → Tab
  - removeTab(tabId) → void
✅ undoService.ts:
  - Track last 5 actions
  - undo() → void
  - redo() → void
  - Push action to stack
✅ archiveService.ts:
  - Find groups unused > 18 months
  - Suggest deletion
✅ Tests: All services 100% coverage

Deliverables:
- All CRUD operations functional
- Services tested & working
- Undo/Redo working (5-action stack)
- Archive suggestions working
```

#### AGENT 2: Extension ↔ Webapp Integration
```
Depends on: Message passing (SPRINT 3) + Services (AGENT 1)

✅ Wire forms to groupService
✅ Wire forms to chromeApi
  - chrome.tabGroups.create()
  - chrome.tabGroups.update()
  - chrome.tabGroups.remove()
✅ Two-way sync:
  - Local change → Chrome API → IndexedDB → UI
  - Chrome change → listener → IndexedDB → UI
✅ Tests: Integration scenarios

Deliverables:
- Create/Edit/Delete groups in popup
- Changes sync to Chrome & IndexedDB
- Changes appear in UI
- Tests passing
```

---

### **SPRINT 5: Synchronisation (Days 9-10)**

#### AGENT 1: Sync Engine & Backend
```
Depends on: Services (SPRINT 4) + Storage

✅ syncEngine.ts:
  - Track changes (with timestamps)
  - Create deltas (only changed fields)
  - Queue for offline
  - Retry logic
✅ encryptionService.ts:
  - AES-256 encryption (TweetNaCl.js)
  - Decrypt synced data
✅ conflictResolver.ts:
  - Last-write-wins (compare timestamps)
  - Generate merged state
✅ OPTIONAL: Node.js Backend
  - Express app
  - POST /api/sync (upload)
  - GET /api/sync?since= (download)
  - Conflict resolution
  - User account management (UUID)
✅ Tests: Sync scenarios, conflict resolution

Deliverables:
- Sync engine fully functional
- Offline queue persists
- Conflicts resolved deterministically
- Backend optional (Vercel-ready)
```

#### AGENT 2: Google Drive & iCloud Sync
```
Depends on: Sync Engine (AGENT 1)

✅ googleDriveSync.ts:
  - OAuth2 login flow
  - Upload JSON (encrypted)
  - Download JSON (decrypt)
  - Integration with syncEngine
✅ iCloudSync.ts:
  - CKDatabase initialization
  - Automatic sync
  - Pull latest records
✅ Sync service selection:
  - User chooses at install
  - Can change in settings
✅ Tests: Mock Google Drive, CloudKit

Deliverables:
- Google Drive sync working
- iCloud sync working
- User can choose option
- Tests passing
```

#### AGENT 3: Service Worker Offline
```
Depends on: Sync Engine (AGENT 1)

✅ Background Sync API:
  - Queue changes while offline
  - Sync when online
✅ Periodic Sync (optional):
  - Background sync every 10 min
✅ Push Notifications (optional):
  - Notify user when sync done
✅ Offline detection:
  - navigator.onLine
  - Handle reconnect
✅ Tests: Offline scenarios

Deliverables:
- Offline mode working
- Queue persists
- Sync on reconnect
- Tests passing
```

---

### **SPRINT 6: Testing, Polish & Deployment (Day 11)**

#### AGENT 1: Tests & CI/CD
```
✅ Unit tests (all services):
  - 100% coverage
✅ Integration tests (storage + sync):
  - Complex scenarios
✅ E2E tests (Chrome API mocked):
  - Full user workflows
✅ Performance tests:
  - < 200ms popup load
  - 1000 groups rendering
✅ GitHub Actions:
  - Run tests on PR
  - Build on main
  - Coverage report
✅ Coverage: 70-80% target

Deliverables:
- All tests passing
- Coverage 70-80%
- CI/CD pipeline green
```

#### AGENT 2: Extension Build & Packaging
```
✅ Production build:
  - npm run build:extension
✅ Optimization:
  - Tree-shaking
  - Minification
  - < 500 KB target
✅ Chrome Web Store prep:
  - manifest.json final check
  - Icons (16, 48, 128, 256px)
  - Description & screenshots
✅ Edge Web Store prep:
  - Same as Chrome
✅ Release packaging:
  - .crx / .zip generation
  - Version management
  - Release notes template

Deliverables:
- Extension .crx ready
- Store assets prepared
- Deployment guide written
```

#### AGENT 3: Frontend Polish
```
✅ Performance audit:
  - Lighthouse 90+
  - Bundle size < 500 KB
✅ Accessibility (a11y):
  - WCAG AA compliant
  - Screen reader support
✅ Responsive design:
  - All breakpoints tested
  - Mobile/tablet/desktop
✅ Animation polish:
  - Smooth 60 FPS
  - Consistent timings
✅ Dark mode polish:
  - Contrast ratios checked
  - Particles subtle

Deliverables:
- Lighthouse 90+
- WCAG AA compliant
- Perfect responsive
- Production-ready
```

---

## 📊 Daily Standup Template

Each day, agents should report:
- ✅ What did I complete?
- 🔄 What am I working on?
- 🚧 What blockers/dependencies do I have?
- 📈 ETA for completion?

---

## 🚀 Handoff to PHASE 2

After SPRINT 6, PHASE 1 is complete and stable.

**PHASE 2** (3-4 weeks later):
- PWA Mobile (iOS/iPad)
- Additional cloud providers
- App store submissions
- Advanced features (smart groups, etc.)

---

## 📋 Prerequisites Checklist

Before assigning agents:

- ✅ Repo initialized
- ✅ Documentation complete
- ✅ All user stories validated
- ✅ Design specifications finalized
- ✅ Architecture documented
- ✅ Tech stack approved

**Status**: Ready for SPRINT 1 ✨

---

**Last Updated**: 2025-04-09
**Project**: TabNova
**Timeline**: ~3 weeks (PHASE 1)
