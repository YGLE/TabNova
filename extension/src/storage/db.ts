import { openDB, IDBPDatabase } from 'idb';
import { DB_NAME, DB_VERSION } from '@utils/constants';
import { runMigrations } from './migrations';

export type TabNovaDB = IDBPDatabase;

let dbInstance: TabNovaDB | null = null;

export async function getDB(): Promise<TabNovaDB> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      runMigrations(db, oldVersion, newVersion ?? DB_VERSION);
    },
    blocked() {
      console.warn('[TabNova] DB upgrade blocked by another tab');
    },
    blocking() {
      dbInstance?.close();
      dbInstance = null;
    },
  });

  return dbInstance;
}

export async function clearDB(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['groups', 'tabs', 'syncMetadata', 'changeLog'], 'readwrite');
  await Promise.all([
    tx.objectStore('groups').clear(),
    tx.objectStore('tabs').clear(),
    tx.objectStore('syncMetadata').clear(),
    tx.objectStore('changeLog').clear(),
  ]);
  await tx.done;
}
