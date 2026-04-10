import { getDB } from './db';
import type { Tab } from '@tabnova-types/index';

/**
 * CREATE – persists a new tab and returns it.
 */
export async function createTab(tab: Tab): Promise<Tab> {
  const db = await getDB();
  await db.put('tabs', tab);
  return tab;
}

/**
 * GET ALL TABS FOR A GROUP – uses the `groupId` index defined in migrations.
 */
export async function getTabsByGroupId(groupId: string): Promise<Tab[]> {
  const db = await getDB();
  const tabs = await db.getAllFromIndex('tabs', 'groupId', groupId);
  return tabs as Tab[];
}

/**
 * GET ALL TABS – returns every tab in the store.
 */
export async function getAllTabs(): Promise<Tab[]> {
  const db = await getDB();
  const tabs = await db.getAll('tabs');
  return tabs as Tab[];
}

/**
 * GET TAB BY ID – returns the tab or undefined if not found.
 */
export async function getTabById(id: string): Promise<Tab | undefined> {
  const db = await getDB();
  const tab = await db.get('tabs', id);
  return tab as Tab | undefined;
}

/**
 * UPDATE – merges patch into the existing record, bumps updatedAt, and
 * returns the updated tab.  Returns undefined when the tab does not exist.
 */
export async function updateTab(id: string, patch: Partial<Tab>): Promise<Tab | undefined> {
  const db = await getDB();
  const existing = (await db.get('tabs', id)) as Tab | undefined;
  if (!existing) return undefined;

  const updated: Tab = {
    ...existing,
    ...patch,
    id, // never overwrite the key
    updatedAt: new Date(),
  };
  await db.put('tabs', updated);
  return updated;
}

/**
 * DELETE – removes a tab by id.
 */
export async function deleteTab(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('tabs', id);
}

/**
 * DELETE ALL TABS FOR A GROUP – removes every tab belonging to groupId.
 */
export async function deleteTabsByGroupId(groupId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('tabs', 'readwrite');
  const index = tx.store.index('groupId');
  let cursor = await index.openCursor(groupId);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}
