import { z } from 'zod';

export const TabValidator = z.object({
  id: z.string().uuid(),
  groupId: z.string().uuid(),
  url: z.string().url(),
  title: z.string().min(1),
  favicon: z.string().optional(),
  position: z.number().int().min(0),
  isStarred: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TabGroupValidator = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(30),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  isPinned: z.boolean(),
  isArchived: z.boolean(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastAccessedAt: z.date().optional(),
  syncId: z.string().optional(),
  tabs: z.array(TabValidator),
});

export const SyncMetadataValidator = z.object({
  userId: z.string().uuid(),
  lastSyncAt: z.date(),
  lastChangeAt: z.date(),
  syncProvider: z.enum(['google-drive', 'icloud', 'backend']),
  deviceId: z.string(),
  version: z.number().int().min(1),
});

export const ChangeValidator = z.object({
  id: z.string().uuid(),
  type: z.enum(['CREATE', 'UPDATE', 'DELETE']),
  entity: z.enum(['GROUP', 'TAB']),
  entityId: z.string().uuid(),
  timestamp: z.date(),
  data: z.unknown().optional(),
});

export type TabInput = z.infer<typeof TabValidator>;
export type TabGroupInput = z.infer<typeof TabGroupValidator>;
export type SyncMetadataInput = z.infer<typeof SyncMetadataValidator>;
export type ChangeInput = z.infer<typeof ChangeValidator>;
