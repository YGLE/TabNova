import type { IDBPDatabase } from 'idb';

export function runMigrations(db: IDBPDatabase, oldVersion: number, newVersion: number): void {
  console.log(`[TabNova] DB migration: v${oldVersion} → v${newVersion}`);

  if (oldVersion < 1) {
    migrateV1(db);
  }
  // Future: if (oldVersion < 2) migrateV2(db);
}

function migrateV1(db: IDBPDatabase): void {
  // Groups store
  if (!db.objectStoreNames.contains('groups')) {
    const groupsStore = db.createObjectStore('groups', { keyPath: 'id' });
    groupsStore.createIndex('createdAt', 'createdAt');
    groupsStore.createIndex('updatedAt', 'updatedAt');
    groupsStore.createIndex('isPinned', 'isPinned');
    groupsStore.createIndex('isArchived', 'isArchived');
    groupsStore.createIndex('lastAccessedAt', 'lastAccessedAt');
  }

  // Tabs store
  if (!db.objectStoreNames.contains('tabs')) {
    const tabsStore = db.createObjectStore('tabs', { keyPath: 'id' });
    tabsStore.createIndex('groupId', 'groupId');
    tabsStore.createIndex('createdAt', 'createdAt');
    tabsStore.createIndex('isStarred', 'isStarred');
  }

  // Sync metadata store
  if (!db.objectStoreNames.contains('syncMetadata')) {
    db.createObjectStore('syncMetadata', { keyPath: 'userId' });
  }

  // Change log store
  if (!db.objectStoreNames.contains('changeLog')) {
    const changeLogStore = db.createObjectStore('changeLog', { keyPath: 'id' });
    changeLogStore.createIndex('timestamp', 'timestamp');
    changeLogStore.createIndex('entityId', 'entityId');
    changeLogStore.createIndex('entity', 'entity');
  }

  console.log('[TabNova] DB v1 migration complete');
}
