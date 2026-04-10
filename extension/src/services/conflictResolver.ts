/**
 * conflictResolver.ts
 * Last-write-wins conflict resolution for sync.
 */

import type { TabGroup } from '@tabnova-types/index';
import type { Change } from '@tabnova-types/Sync';

/**
 * Resolves a conflict between two versions of a group.
 * Strategy: last-write-wins based on `updatedAt`.
 */
export function resolveGroupConflict(local: TabGroup, remote: TabGroup): TabGroup {
  return local.updatedAt >= remote.updatedAt ? local : remote;
}

/**
 * Merges two change logs, eliminating duplicates by entityId.
 * For the same entityId, the change with the most recent timestamp wins.
 * The result is sorted ascending by timestamp.
 */
export function mergeChangeLogs(local: Change[], remote: Change[]): Change[] {
  const map = new Map<string, Change>();
  // Remote first, then local overrides (local is treated as more recent for ties)
  for (const c of [...remote, ...local]) {
    const existing = map.get(c.entityId);
    if (!existing || c.timestamp >= existing.timestamp) {
      map.set(c.entityId, c);
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

/**
 * Applies a list of changes (CREATE / UPDATE / DELETE) to a list of groups.
 * Only processes changes with `entity === 'GROUP'`; TAB changes are skipped.
 */
export function applyChanges(groups: TabGroup[], changes: Change[]): TabGroup[] {
  let result = [...groups];
  for (const change of changes) {
    if (change.entity !== 'GROUP') continue;
    switch (change.type) {
      case 'CREATE':
        if (change.data && !result.find((g) => g.id === change.entityId)) {
          result.push(change.data as TabGroup);
        }
        break;
      case 'UPDATE':
        result = result.map((g) =>
          g.id === change.entityId ? { ...g, ...(change.data as Partial<TabGroup>) } : g
        );
        break;
      case 'DELETE':
        result = result.filter((g) => g.id !== change.entityId);
        break;
    }
  }
  return result;
}
