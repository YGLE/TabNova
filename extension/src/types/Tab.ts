export interface Tab {
  id: string;
  groupId: string;
  url: string;
  title: string;
  favicon?: string;
  position: number;
  isStarred: boolean;
  createdAt: Date;
  updatedAt: Date;
}
