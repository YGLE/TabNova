# 🏗️ TabNova - Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User's Browser                          │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                  │
│   TabNova Extension      │     TabNova Web App              │
│   ┌────────────────┐     │     ┌──────────────────┐         │
│   │ Popup UI       │     │     │ Dashboard Tab    │         │
│   │ (400x600px)    │     │     │ (Fullscreen)     │         │
│   └────────────────┘     │     └──────────────────┘         │
│          │               │              │                   │
│          └─────────────────────────────┘                   │
│                    Shared React App                         │
│               (Zustand + D3.js + Tailwind)                 │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  Service Worker (background.ts)                    │  │
│   │  • Chrome API integration                          │  │
│   │  • IPC message handling                            │  │
│   │  • Background sync                                 │  │
│   │  • Offline queue management                        │  │
│   └──────────┬────────────────────────────────────────┘  │
│              │                                             │
│   ┌──────────▼─────────────────────────────────────────┐  │
│   │  IndexedDB Storage                                 │  │
│   │  • Groups, Tabs, SyncMetadata                      │  │
│   │  • Offline data persistence                        │  │
│   └──────────┬────────────────────────────────────────┘  │
│              │                                             │
└──────────────┼─────────────────────────────────────────────┘
               │
               │ (HTTPS + Encryption)
               │
        ┌──────▼──────┐
        │  Cloud Sync │
        │  • Google   │
        │    Drive    │
        │  • iCloud   │
        │  • Backend  │
        └─────────────┘
```

## Technology Stack

### Frontend
```
React 18.2                  # UI Framework
TypeScript 5.2              # Type safety
D3.js 7.8                   # Bubble visualization
Tailwind CSS 3.3            # Styling
Zustand 4.4                 # State management
Vite 5.0                    # Build tool
```

### Extension
```
Manifest V3                 # Chrome/Edge extension format
Service Workers             # Background processing
Chrome APIs                 # tabGroups, tabs, storage
```

### Storage
```
IndexedDB                   # Client-side persistent storage
Encryption (TweetNaCl.js)   # AES-256 for sync data
```

### Cloud Sync
```
Google Drive API            # Default sync option
iCloud CloudKit             # Apple devices
Node.js Backend (optional)  # Custom sync server
```

### Testing
```
Vitest 1.0                  # Unit tests
React Testing Library 14.1  # Component tests
```

## Directory Structure

```
TabNova/
├── extension/                          # Chrome Extension
│   ├── manifest.json                  # Manifest V3 config
│   ├── public/
│   │   └── icons/                     # Extension icons (16, 32, 128px)
│   ├── src/
│   │   ├── App.tsx                    # Root component
│   │   ├── background/
│   │   │   ├── index.ts               # Service Worker entry
│   │   │   ├── chromeApi.ts           # Chrome API wrapper
│   │   │   ├── messageHandler.ts      # IPC message handler
│   │   │   └── syncEngine.ts          # Sync orchestration
│   │   ├── popup/
│   │   │   ├── index.tsx              # Popup entry point
│   │   │   └── Popup.tsx              # Popup component
│   │   ├── dashboard/
│   │   │   ├── index.tsx              # Dashboard entry point
│   │   │   └── Dashboard.tsx          # Dashboard component
│   │   ├── components/
│   │   │   ├── BubbleCluster.tsx      # D3 visualization
│   │   │   ├── SearchBar.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   ├── useTabGroups.ts        # Groups data management
│   │   │   ├── useSync.ts             # Sync status
│   │   │   ├── useUndo.ts             # Undo/Redo
│   │   │   └── useMessage.ts          # IPC communication
│   │   ├── store/
│   │   │   ├── groupStore.ts          # Zustand store: groups
│   │   │   ├── syncStore.ts           # Zustand store: sync state
│   │   │   ├── uiStore.ts             # Zustand store: UI state
│   │   │   └── undoStore.ts           # Zustand store: undo/redo
│   │   ├── types/
│   │   │   ├── index.ts               # All type exports
│   │   │   ├── TabGroup.ts
│   │   │   ├── Tab.ts
│   │   │   ├── Sync.ts
│   │   │   └── UI.ts
│   │   ├── storage/
│   │   │   ├── db.ts                  # IndexedDB initialization
│   │   │   ├── groupStore.ts          # Group persistence
│   │   │   ├── tabStore.ts            # Tab persistence
│   │   │   └── migrations.ts          # DB schema migrations
│   │   ├── services/
│   │   │   ├── groupService.ts        # CRUD: groups
│   │   │   ├── tabService.ts          # CRUD: tabs
│   │   │   ├── syncService.ts         # Sync orchestration
│   │   │   ├── googleDriveSync.ts     # Google Drive integration
│   │   │   ├── iCloudSync.ts          # iCloud integration
│   │   │   └── encryptionService.ts   # Crypto operations
│   │   ├── utils/
│   │   │   ├── validators.ts          # Zod schemas
│   │   │   ├── formatting.ts          # String/date formatting
│   │   │   ├── constants.ts           # App constants
│   │   │   └── d3Helpers.ts           # D3.js utilities
│   │   └── config/
│   │       └── env.ts                 # Environment variables
│   └── index.html
│
├── backend/ (optional)                 # Node.js Backend
│   ├── src/
│   │   ├── server.ts                  # Express app
│   │   ├── routes/
│   │   │   ├── sync.ts                # POST /api/sync, GET /api/sync?since=
│   │   │   └── auth.ts                # Authentication
│   │   ├── services/
│   │   │   ├── syncService.ts         # Sync logic
│   │   │   ├── conflictResolver.ts    # Conflict resolution
│   │   │   └── userService.ts         # User management
│   │   ├── models/
│   │   │   ├── TabGroup.ts
│   │   │   ├── SyncLog.ts
│   │   │   └── User.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── errorHandler.ts
│   │   ├── config/
│   │   │   └── database.ts
│   │   └── utils/
│   │       └── encryption.ts
│   ├── tests/
│   │   ├── sync.test.ts
│   │   └── conflictResolver.test.ts
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   ├── ARCHITECTURE.md                # This file
│   ├── DESIGN-SPECIFICATIONS.md       # Design specs
│   ├── USER_STORIES.md                # All validated US
│   ├── API.md                         # Backend API docs
│   ├── SETUP.md                       # Development setup
│   └── DEPLOYMENT.md                  # Deployment guide
│
├── mockups/                           # Design assets
│   ├── figma-link.md
│   ├── ui-flows/
│   └── design-tokens.json
│
├── .github/
│   └── workflows/
│       ├── test.yml                   # CI: Run tests
│       ├── build.yml                  # CI: Build extension
│       └── deploy.yml                 # CD: Deploy to store
│
├── README.md
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts                     # Main vite config
├── vite.extension.config.ts           # Extension-specific config
├── vite.backend.config.ts             # Backend-specific config
└── .gitignore
```

## Data Flow

### 1. User Creates/Edits Group (Popup)
```
Popup UI (React)
    ↓
useTabGroups() hook
    ↓
groupStore (Zustand)
    ↓
groupService.create() / .update()
    ↓
Storage: IndexedDB + Chrome API
    ↓
Background: Message Handler
    ↓
Chrome: chrome.tabGroups.create()
    ↓
Sync Engine: Queue change
    ↓
Cloud: Upload to Google Drive / iCloud
```

### 2. Chrome Changes (external source)
```
Chrome: User creates group in UI
    ↓
Background: chrome.tabGroups.onUpdated listener
    ↓
Storage: Save to IndexedDB
    ↓
groupStore: Zustand update (broadcast)
    ↓
Popup/Dashboard: Re-render with new data
```

### 3. Sync Flow (Offline-First)
```
Local change detected
    ↓
Sync Engine: Add to offline queue
    ↓
If online: Upload immediately (< 1 sec)
If offline: Queue persists in IndexedDB
    ↓
On reconnect: Download changes (conflict resolution)
    ↓
Conflict? Last-write-wins (timestamp comparison)
    ↓
Merge: groupStore + IndexedDB updated
    ↓
UI: Reflect latest state
```

## Key Design Patterns

### 1. Offline-First Architecture
- IndexedDB as source of truth (locally)
- Cloud as backup + sync medium
- Queue system for offline changes
- Automatic retry on reconnect

### 2. Message Passing (IPC)
- Popup ↔ Background via chrome.runtime.sendMessage
- Decoupled, event-driven
- Service Worker processes, updates IndexedDB
- Broadcast to all open tabs/popups

### 3. State Management (Zustand)
- Single source of truth per domain (groups, sync, ui)
- Shallow subscriptions
- Easy to test (mutable stores)
- Lightweight (< 10KB)

### 4. Last-Write-Wins (LWW) Conflict Resolution
- Simple, deterministic, scalable
- Timestamp on every group/tab
- Server picks version with latest timestamp
- User can view history to "undo" if needed

### 5. Component Architecture
- BubbleCluster: Reusable D3 component
- Smart components (hooks): Data fetching, state
- Dumb components: Pure presentation
- Easy to test, compose, refactor

## Deployment Architecture

### Chrome Web Store
```
Build extension (vite build:extension)
    ↓
Generate .crx / .zip
    ↓
Upload to Chrome Web Store
    ↓
Distribute to users
```

### Backend (if custom sync)
```
Build backend (npm run build:backend)
    ↓
Docker or Node.js hosting (Vercel, Railway, etc.)
    ↓
HTTPS only
    ↓
Database (optional, for user accounts)
```

### PWA (Phase 2)
```
Webapp at https://tabnova.app
    ↓
Service Worker + manifest.json
    ↓
Install on iPhone/iPad
    ↓
Sync via Google Drive / iCloud

```

## Performance Targets

```
Popup load:     < 200ms (< 500KB bundle)
Bubble render:  < 100ms (1000 groups)
Search:         < 100ms (1000 onglets)
Sync:           < 1 sec (upload delta)
Animation:      60 FPS (butter-smooth)
```

## Security Considerations

```
✅ HTTPS only (for cloud sync)
✅ AES-256 encryption (client-side)
✅ No password needed (OAuth for Google Drive, native for iCloud)
✅ No server auth (UUID-based)
✅ Crypto: TweetNaCl.js (audited library)
⚠️ Future: Account system for backend
```

## Testing Strategy

```
Unit tests:         Services, validators, utils (70-80% coverage)
Component tests:    React components (snapshots + interaction)
E2E tests:          Chrome API mock (tabGroups, tabs, storage)
Integration tests:  Storage + Sync flow
Performance tests:  Bundle size, load time
```

---

**Last Updated**: 2025-04-09
**Status**: SPRINT 1 (Foundations)
