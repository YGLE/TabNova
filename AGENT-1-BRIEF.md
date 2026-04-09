# 🤖 AGENT 1 - SPRINT 1 Brief

## Role: Fullstack/Backend Specialist

**Duration**: 2 days (SPRINT 1)
**Status**: 🟢 READY TO START
**Priority**: 🔴 HIGH

---

## 📋 Your Responsibilities

You are responsible for the **infrastructure, types, storage, and testing foundation** of TabNova.

### Tasks (5 items, ~8-10 hours total)

#### ✅ Task 1: npm install + TypeScript Config Validation
```bash
# In ~/Projects/TabNova/
npm install
npm run type-check
```

**Expected Output:**
- ✓ All dependencies installed
- ✓ No TypeScript errors
- ✓ tsconfig.json working correctly
- ✓ Path aliases (@/*, @components/*, etc.) functional

**Files to check:**
- `package.json` (all deps present)
- `tsconfig.json` (strict mode enabled)
- `node_modules/` created

**Estimated time**: 15-20 minutes

---

#### ✅ Task 2: Create types/ Folder with All Interfaces

**Location**: `extension/src/types/`

Create the following files with TypeScript interfaces:

**File: `extension/src/types/index.ts`**
```typescript
// Export all types from this single file
export * from './TabGroup';
export * from './Tab';
export * from './Sync';
export * from './UI';
export * from './Chrome';
```

**File: `extension/src/types/TabGroup.ts`**
```typescript
import type { Tab } from './Tab';

export interface TabGroup {
  id: string;              // UUID
  name: string;            // "Dev", "Design", etc. (required, max 30 chars)
  color: string;           // Hex color: #3B82F6
  isPinned: boolean;       // Star icon
  isArchived: boolean;     // Archived groups
  position?: {             // For custom positioning in grappe
    x: number;
    y: number;
  };
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;   // Pour l'élagage des groupes (18 mois)
  syncId?: string;         // For cloud sync
  tabs: Tab[];
}
```

**File: `extension/src/types/Tab.ts`**
```typescript
export interface Tab {
  id: string;              // UUID
  groupId: string;         // Reference to TabGroup
  url: string;             // Full URL
  title: string;           // Page title
  favicon?: string;        // Data URL or URL
  position: number;        // Order in group
  isStarred: boolean;      // Favorite
  createdAt: Date;
  updatedAt: Date;
}
```

**File: `extension/src/types/Sync.ts`**
```typescript
export interface SyncMetadata {
  userId: string;          // UUID (not email, for privacy)
  lastSyncAt: Date;
  lastChangeAt: Date;
  syncProvider: 'google-drive' | 'icloud' | 'backend';
  deviceId: string;        // Unique device identifier
  version: number;         // Schema version
}

export interface Change {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'GROUP' | 'TAB';
  entityId: string;
  timestamp: Date;
  data?: any;
}
```

**File: `extension/src/types/UI.ts`**
```typescript
export interface UIState {
  selectedGroupId: string | null;
  hoveredGroupId: string | null;
  searchQuery: string;
  viewMode: 'bubble' | 'list';
  isLoading: boolean;
  error: string | null;
}
```

**File: `extension/src/types/Chrome.ts`**
```typescript
export interface ChromeTab {
  id: number;
  groupId: number;
  url: string;
  title: string;
  favIconUrl?: string;
}

export interface ChromeTabGroup {
  id: number;
  title: string;
  color: string;
  collapsed: boolean;
}
```

**Estimated time**: 1-1.5 hours

---

#### ✅ Task 3: Zod Validators for All Types

**Location**: `extension/src/utils/validators.ts`

```typescript
import { z } from 'zod';

// Validators for runtime type safety
export const TabGroupValidator = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(30),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  isPinned: z.boolean(),
  isArchived: z.boolean(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  syncId: z.string().optional(),
  tabs: z.array(z.any()), // Will be TabValidator
});

export const TabValidator = z.object({
  id: z.string().uuid(),
  groupId: z.string().uuid(),
  url: z.string().url(),
  title: z.string().min(1),
  favicon: z.string().optional(),
  position: z.number(),
  isStarred: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Add more validators for all types
```

**Estimated time**: 45 minutes - 1 hour

---

#### ✅ Task 4: IndexedDB Schema + Migrations

**Location**: `extension/src/storage/db.ts`

```typescript
const DB_NAME = 'TabNova';
const DB_VERSION = 1;

export const DB_SCHEMA = {
  stores: {
    groups: {
      keyPath: 'id',
      indexes: [
        { name: 'createdAt', keyPath: 'createdAt' },
        { name: 'updatedAt', keyPath: 'updatedAt' },
      ],
    },
    tabs: {
      keyPath: 'id',
      indexes: [
        { name: 'groupId', keyPath: 'groupId' },
        { name: 'createdAt', keyPath: 'createdAt' },
      ],
    },
    syncMetadata: {
      keyPath: 'userId',
    },
    changeLog: {
      keyPath: 'id',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'entityId', keyPath: 'entityId' },
      ],
    },
  },
};

export async function initializeDB(): Promise<IDBDatabase> {
  // Open DB with version handling
  // Create stores if needed
}

export async function migrateDB(oldVersion: number, newVersion: number) {
  // Handle schema migrations
}
```

**Create file**: `extension/src/storage/migrations.ts`
- Version 1.0 initial schema
- Document future migration patterns

**Estimated time**: 1-1.5 hours

---

#### ✅ Task 5: ESLint + Prettier + GitHub Actions

**Files to update/create**:

**`.eslintrc.json`** (already configured, verify)
```json
{
  "root": true,
  "env": { "browser": true, "es2020": true },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "ignorePatterns": ["dist", "node_modules"]
}
```

**`.prettierrc.json`** (create if missing)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**`.github/workflows/test.yml`**
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test
```

**Estimated time**: 45 minutes - 1 hour

---

## 📦 Deliverables

✅ `npm install` successful
✅ `npm run type-check` passes
✅ `extension/src/types/` folder complete with 5 files
✅ `extension/src/utils/validators.ts` with Zod schemas
✅ `extension/src/storage/db.ts` with IndexedDB init
✅ `extension/src/storage/migrations.ts` with migration system
✅ ESLint + Prettier configured
✅ GitHub Actions workflow created
✅ All files have proper TypeScript types
✅ README updated with setup instructions

---

## 🔗 Dependencies on Other Agents

**Agent 2** (Extension) needs your `types/` folder → Wait for you to finish Task 2 before starting
**Agent 3** (Frontend) needs your `types/` folder → Wait for you to finish Task 2 before starting

---

## ✅ Validation Checklist

- [ ] `npm install` completes without errors
- [ ] `npm run type-check` passes
- [ ] All 5 type files created
- [ ] Zod validators work (can validate objects)
- [ ] IndexedDB schema is valid
- [ ] ESLint runs without critical errors
- [ ] GitHub Actions workflow is valid YAML
- [ ] All commits are clean with good messages
- [ ] Code follows Prettier formatting

---

## 🚀 When You're Done

1. **Create a pull request** or commit to main with message:
   ```
   feat(SPRINT1-AGENT1): Add types, validators, storage schema
   ```

2. **Notify AGENT 2 and 3** that types/ folder is ready

3. **Mark these tasks as COMPLETED** in the todo list

---

**Good luck! You've got this! 🔥**

Let me know when you've completed each task!

---

**Generated**: 2025-04-09
**Status**: 🟢 READY
