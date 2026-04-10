import { getDB } from './db';
import type { TabGroup } from '@tabnova-types/index';

/**
 * CREATE – persists a new group and returns it.
 */
export async function createGroup(group: TabGroup): Promise<TabGroup> {
  const db = await getDB();
  await db.put('groups', group);
  return group;
}

/**
 * READ ALL – returns every group sorted by createdAt ascending.
 * (No dedicated "order" field on TabGroup, so createdAt is used as the
 * stable insertion order.)
 */
export async function getAllGroups(): Promise<TabGroup[]> {
  const db = await getDB();
  // Use the createdAt index for ascending order
  const groups = await db.getAllFromIndex('groups', 'createdAt');
  return groups as TabGroup[];
}

/**
 * READ BY ID – returns the group or undefined if not found.
 */
export async function getGroupById(id: string): Promise<TabGroup | undefined> {
  const db = await getDB();
  const group = await db.get('groups', id);
  return group as TabGroup | undefined;
}

/**
 * UPDATE – merges patch into the existing record, bumps updatedAt, and
 * returns the updated group.  Returns undefined when the group does not exist.
 */
export async function updateGroup(
  id: string,
  patch: Partial<TabGroup>
): Promise<TabGroup | undefined> {
  const db = await getDB();
  const existing = (await db.get('groups', id)) as TabGroup | undefined;
  if (!existing) return undefined;

  const updated: TabGroup = {
    ...existing,
    ...patch,
    id, // never overwrite the key
    updatedAt: new Date(),
  };
  await db.put('groups', updated);
  return updated;
}

/**
 * DELETE – removes a group by id.
 */
export async function deleteGroup(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('groups', id);
}

/**
 * DELETE ALL – removes every group from the store.
 */
export async function deleteAllGroups(): Promise<void> {
  const db = await getDB();
  await db.clear('groups');
}

/**
 * GET PINNED – returns all groups where isPinned === true.
 *
 * IndexedDB stores booleans as-is, but IDBKeyRange.only(true) is not
 * reliably supported across all implementations (including fake-indexeddb).
 * Fetching all and filtering is safe and correct.
 */
export async function getPinnedGroups(): Promise<TabGroup[]> {
  const all = await getAllGroups();
  return all.filter((g) => g.isPinned);
}

/**
 * GET ARCHIVED – returns all groups where isArchived === true.
 */
export async function getArchivedGroups(): Promise<TabGroup[]> {
  const all = await getAllGroups();
  return all.filter((g) => g.isArchived);
}
