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
