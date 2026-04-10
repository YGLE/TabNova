import { describe, it, expect } from 'vitest';
import {
  mapChromeGroupToTabGroup,
  mapChromeTabToTab,
  mapChromeColorToHex,
} from './chromeMapper';

// ── Helpers to build minimal Chrome mock objects ─────────────────────────────

function makeChromeGroup(
  overrides: Partial<chrome.tabGroups.TabGroup> = {}
): chrome.tabGroups.TabGroup {
  return {
    id: 1,
    title: 'Dev',
    color: 'blue' as chrome.tabGroups.ColorEnum,
    collapsed: false,
    windowId: 1,
    ...overrides,
  };
}

function makeChromeTab(overrides: Partial<chrome.tabs.Tab> = {}): chrome.tabs.Tab {
  return {
    id: 10,
    index: 0,
    pinned: false,
    highlighted: false,
    windowId: 1,
    active: false,
    incognito: false,
    selected: false,
    discarded: false,
    autoDiscardable: true,
    groupId: 1,
    url: 'https://example.com',
    title: 'Example',
    favIconUrl: 'https://example.com/favicon.ico',
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('chromeMapper', () => {
  describe('mapChromeColorToHex', () => {
    it('maps chrome color "blue" to correct hex', () => {
      expect(mapChromeColorToHex('blue' as chrome.tabGroups.ColorEnum)).toBe('#3B82F6');
    });

    it('maps chrome color "red" to correct hex', () => {
      expect(mapChromeColorToHex('red' as chrome.tabGroups.ColorEnum)).toBe('#EF4444');
    });

    it('maps chrome color "yellow" to correct hex', () => {
      expect(mapChromeColorToHex('yellow' as chrome.tabGroups.ColorEnum)).toBe('#FBBF24');
    });

    it('maps chrome color "green" to correct hex', () => {
      expect(mapChromeColorToHex('green' as chrome.tabGroups.ColorEnum)).toBe('#10B981');
    });

    it('maps chrome color "pink" to correct hex', () => {
      expect(mapChromeColorToHex('pink' as chrome.tabGroups.ColorEnum)).toBe('#EC4899');
    });

    it('maps chrome color "purple" to correct hex', () => {
      expect(mapChromeColorToHex('purple' as chrome.tabGroups.ColorEnum)).toBe('#8B5CF6');
    });

    it('maps chrome color "cyan" to correct hex', () => {
      expect(mapChromeColorToHex('cyan' as chrome.tabGroups.ColorEnum)).toBe('#06B6D4');
    });

    it('maps chrome color "orange" to correct hex', () => {
      expect(mapChromeColorToHex('orange' as chrome.tabGroups.ColorEnum)).toBe('#F97316');
    });

    it('defaults to indigo (#6366F1) for unknown color', () => {
      expect(mapChromeColorToHex('unknown' as chrome.tabGroups.ColorEnum)).toBe('#6366F1');
    });

    it('defaults to indigo (#6366F1) when color is undefined', () => {
      expect(mapChromeColorToHex(undefined)).toBe('#6366F1');
    });
  });

  describe('mapChromeTabToTab', () => {
    it('maps a chrome tab to a TabNova Tab', () => {
      const chromeTab = makeChromeTab();
      const result = mapChromeTabToTab(chromeTab, 'group-uuid-123');

      expect(result.groupId).toBe('group-uuid-123');
      expect(result.url).toBe('https://example.com');
      expect(result.title).toBe('Example');
      expect(result.favicon).toBe('https://example.com/favicon.ico');
      expect(result.position).toBe(0);
      expect(result.isStarred).toBe(false);
      expect(result.id).toBeTruthy();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('handles tabs without favicons', () => {
      const chromeTab = makeChromeTab({ favIconUrl: undefined });
      const result = mapChromeTabToTab(chromeTab, 'group-abc');

      expect(result.favicon).toBe('');
    });

    it('falls back to empty string for missing url', () => {
      const chromeTab = makeChromeTab({ url: undefined });
      const result = mapChromeTabToTab(chromeTab, 'group-abc');

      expect(result.url).toBe('');
    });

    it('falls back to "Sans titre" for missing title', () => {
      const chromeTab = makeChromeTab({ title: undefined });
      const result = mapChromeTabToTab(chromeTab, 'group-abc');

      expect(result.title).toBe('Sans titre');
    });

    it('maps the tab index to position', () => {
      const chromeTab = makeChromeTab({ index: 5 });
      const result = mapChromeTabToTab(chromeTab, 'group-abc');

      expect(result.position).toBe(5);
    });

    it('generates a unique id for each mapped tab', () => {
      const chromeTab = makeChromeTab();
      const result1 = mapChromeTabToTab(chromeTab, 'group-abc');
      const result2 = mapChromeTabToTab(chromeTab, 'group-abc');

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('mapChromeGroupToTabGroup', () => {
    it('maps a chrome group to a TabNova TabGroup', () => {
      const chromeGroup = makeChromeGroup();
      const result = mapChromeGroupToTabGroup(chromeGroup);

      expect(result.name).toBe('Dev');
      expect(result.color).toBe('#3B82F6');
      expect(result.isPinned).toBe(false);
      expect(result.isArchived).toBe(false);
      expect(result.tabs).toHaveLength(0);
      expect(result.id).toBeTruthy();
      expect(result.syncId).toBe('1');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('uses group title or falls back to "Sans nom"', () => {
      const chromeGroup = makeChromeGroup({ title: '' });
      const result = mapChromeGroupToTabGroup(chromeGroup);

      expect(result.name).toBe('Sans nom');
    });

    it('uses "Sans nom" when title is undefined', () => {
      const chromeGroup = makeChromeGroup({ title: undefined });
      const result = mapChromeGroupToTabGroup(chromeGroup);

      expect(result.name).toBe('Sans nom');
    });

    it('maps tabs and uses the group id as groupId on each tab', () => {
      const chromeGroup = makeChromeGroup();
      const chromeTabs = [
        makeChromeTab({ index: 0, url: 'https://a.com', title: 'A' }),
        makeChromeTab({ id: 11, index: 1, url: 'https://b.com', title: 'B' }),
      ];
      const result = mapChromeGroupToTabGroup(chromeGroup, chromeTabs);

      expect(result.tabs).toHaveLength(2);
      expect(result.tabs[0].groupId).toBe(result.id);
      expect(result.tabs[1].groupId).toBe(result.id);
      expect(result.tabs[0].url).toBe('https://a.com');
      expect(result.tabs[1].url).toBe('https://b.com');
    });

    it('stores the chrome group id in syncId', () => {
      const chromeGroup = makeChromeGroup({ id: 42 });
      const result = mapChromeGroupToTabGroup(chromeGroup);

      expect(result.syncId).toBe('42');
    });

    it('generates a unique id for each mapped group', () => {
      const chromeGroup = makeChromeGroup();
      const result1 = mapChromeGroupToTabGroup(chromeGroup);
      const result2 = mapChromeGroupToTabGroup(chromeGroup);

      expect(result1.id).not.toBe(result2.id);
    });
  });
});
