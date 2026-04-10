import type { Tab } from './Tab';

export interface TabGroup {
  id: string;
  name: string; // max 30 chars
  color: string; // hex: #3B82F6
  isPinned: boolean;
  isArchived: boolean;
  position?: { x: number; y: number };
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date; // pour élagage 18 mois
  syncId?: string;
  tabs: Tab[];
}
