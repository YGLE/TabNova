export interface SyncMetadata {
  userId: string;
  lastSyncAt: Date;
  lastChangeAt: Date;
  syncProvider: 'google-drive' | 'icloud' | 'backend';
  deviceId: string;
  version: number;
}

export interface Change {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'GROUP' | 'TAB';
  entityId: string;
  timestamp: Date;
  data?: unknown;
}
