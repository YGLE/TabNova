// Maps Chrome API types to TabNova internal types

import type { TabGroup, Tab } from '@tabnova-types/index';
import { generateId } from '@utils/helpers';
import { GROUP_COLORS } from '@utils/constants';

const COLOR_MAP: Record<string, string> = {
  blue: '#3B82F6',
  red: '#EF4444',
  yellow: '#FBBF24',
  green: '#10B981',
  pink: '#EC4899',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  orange: '#F97316',
};

// Default color: indigo (last in GROUP_COLORS)
const DEFAULT_COLOR = GROUP_COLORS[GROUP_COLORS.length - 1];

/**
 * Maps a Chrome color string to a hex color value.
 */
export function mapChromeColorToHex(chromeColor: chrome.tabGroups.ColorEnum | undefined): string {
  if (!chromeColor) return DEFAULT_COLOR;
  return COLOR_MAP[chromeColor] ?? DEFAULT_COLOR;
}

/**
 * Maps a chrome.tabs.Tab to a TabNova Tab.
 */
export function mapChromeTabToTab(chromeTab: chrome.tabs.Tab, groupId: string): Tab {
  const now = new Date();
  return {
    id: generateId(),
    groupId,
    url: chromeTab.url ?? '',
    title: chromeTab.title ?? 'Sans titre',
    favicon: chromeTab.favIconUrl ?? '',
    position: chromeTab.index,
    isStarred: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Maps a chrome.tabGroups.TabGroup (with its tabs) to a TabNova TabGroup.
 * The chromeGroup.id (number) is stored in syncId for later reference.
 */
export function mapChromeGroupToTabGroup(
  chromeGroup: chrome.tabGroups.TabGroup,
  tabs: chrome.tabs.Tab[] = []
): TabGroup {
  const now = new Date();
  const id = generateId();
  return {
    id,
    name: chromeGroup.title || 'Sans nom',
    color: mapChromeColorToHex(chromeGroup.color),
    isPinned: false,
    isArchived: false,
    syncId: String(chromeGroup.id),
    tabs: tabs.map((t) => mapChromeTabToTab(t, id)),
    createdAt: now,
    updatedAt: now,
  };
}
