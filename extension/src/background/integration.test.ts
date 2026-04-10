import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleMessage } from './messageHandler';

// ── Helpers ──────────────────────────────────────────────────────────────────

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

/** Shorthand: call handleMessage and wait for the async sendResponse. */
async function dispatch(
  type: string,
  payload?: unknown
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  return new Promise((resolve) => {
    handleMessage(
      { type: type as Parameters<typeof handleMessage>[0]['type'], payload },
      {} as chrome.runtime.MessageSender,
      resolve as (r: { success: boolean; data?: unknown; error?: string }) => void
    );
  });
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('messageHandler integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // chrome.tabs.group → returns new group id
    (chrome.tabs.group as ReturnType<typeof vi.fn>).mockResolvedValue(42);

    // chrome.tabGroups.update → returns updated group
    (chrome.tabGroups.update as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeChromeGroup({ id: 42 })
    );

    // chrome.tabGroups.query → returns one group for SYNC
    (chrome.tabGroups.query as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeChromeGroup({ id: 7, title: 'Sync Group' }),
    ]);

    // chrome.tabs.query → returns tabs for that group
    (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeChromeTab({ groupId: 7 }),
    ]);

    // chrome.tabs.ungroup → used by removeChromeGroup
    // Add it to the mock if not present
    if (!(chrome.tabs as Record<string, unknown>)['ungroup']) {
      (chrome.tabs as Record<string, unknown>)['ungroup'] = vi.fn().mockResolvedValue(undefined);
    } else {
      (
        (chrome.tabs as Record<string, unknown>)['ungroup'] as ReturnType<typeof vi.fn>
      ).mockResolvedValue(undefined);
    }
  });

  // ── CREATE_GROUP ────────────────────────────────────────────────────────────

  it('CREATE_GROUP returns the chrome group id', async () => {
    const response = await dispatch('CREATE_GROUP', {
      tabIds: [1, 2],
      title: 'New Group',
      color: 'blue',
    });

    expect(response.success).toBe(true);
    // chrome.tabs.group was called → returned 42 → data should be 42
    expect(response.data).toBe(42);
  });

  it('CREATE_GROUP calls chrome.tabs.group with the provided tabIds', async () => {
    await dispatch('CREATE_GROUP', { tabIds: [3, 4], title: 'Test', color: 'red' });

    expect(chrome.tabs.group).toHaveBeenCalledWith({ tabIds: [3, 4] });
  });

  it('CREATE_GROUP calls chrome.tabGroups.update with title and color', async () => {
    await dispatch('CREATE_GROUP', { tabIds: [1], title: 'Work', color: 'green' });

    expect(chrome.tabGroups.update).toHaveBeenCalledWith(
      42,
      expect.objectContaining({ title: 'Work', color: 'green' })
    );
  });

  it('CREATE_GROUP succeeds without color (color optional)', async () => {
    await dispatch('CREATE_GROUP', { tabIds: [1], title: 'No Color' });

    // Should still call update with just the title
    expect(chrome.tabGroups.update).toHaveBeenCalledWith(42, { title: 'No Color' });
  });

  // ── UPDATE_GROUP ────────────────────────────────────────────────────────────

  it('UPDATE_GROUP updates the chrome group title', async () => {
    const response = await dispatch('UPDATE_GROUP', {
      chromeGroupId: 10,
      title: 'Renamed',
    });

    expect(response.success).toBe(true);
    expect(chrome.tabGroups.update).toHaveBeenCalledWith(10, { title: 'Renamed' });
  });

  it('UPDATE_GROUP succeeds without title (no-op update)', async () => {
    const response = await dispatch('UPDATE_GROUP', { chromeGroupId: 10 });

    expect(response.success).toBe(true);
    // Called with empty properties object (no title key)
    expect(chrome.tabGroups.update).toHaveBeenCalledWith(10, {});
  });

  it('UPDATE_GROUP returns { success: true } without extra data', async () => {
    const response = await dispatch('UPDATE_GROUP', { chromeGroupId: 5, title: 'X' });

    expect(response).toEqual({ success: true });
  });

  // ── DELETE_GROUP ────────────────────────────────────────────────────────────

  it('DELETE_GROUP removes the chrome group', async () => {
    // chrome.tabs.query returns tabs in the group so ungroup is called
    (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeChromeTab({ id: 20, groupId: 99 }),
    ]);

    const response = await dispatch('DELETE_GROUP', { chromeGroupId: 99 });

    expect(response.success).toBe(true);
    // removeChromeGroup fetches tabs then calls ungroup
    expect(chrome.tabs.query).toHaveBeenCalledWith({ groupId: 99 });
  });

  it('DELETE_GROUP returns { success: true }', async () => {
    (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const response = await dispatch('DELETE_GROUP', { chromeGroupId: 5 });

    expect(response).toEqual({ success: true });
  });

  it('DELETE_GROUP handles empty group (no tabs to ungroup)', async () => {
    // No tabs in group → removeChromeGroup skips ungroup call
    (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const response = await dispatch('DELETE_GROUP', { chromeGroupId: 777 });

    expect(response.success).toBe(true);
  });

  // ── SYNC_FROM_CHROME ────────────────────────────────────────────────────────

  it('SYNC_FROM_CHROME returns mapped TabNova groups', async () => {
    const response = await dispatch('SYNC_FROM_CHROME');

    expect(response.success).toBe(true);
    const groups = response.data as { id: string; name: string; syncId: string }[];
    expect(Array.isArray(groups)).toBe(true);
    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe('Sync Group');
    expect(groups[0].syncId).toBe('7');
  });

  it('SYNC_FROM_CHROME maps chrome color to hex', async () => {
    (chrome.tabGroups.query as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeChromeGroup({ id: 1, color: 'red' as chrome.tabGroups.ColorEnum }),
    ]);
    (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const response = await dispatch('SYNC_FROM_CHROME');

    const groups = response.data as { color: string }[];
    expect(groups[0].color).toBe('#EF4444');
  });

  it('SYNC_FROM_CHROME maps tabs inside groups', async () => {
    (chrome.tabGroups.query as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeChromeGroup({ id: 3 }),
    ]);
    (chrome.tabs.query as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeChromeTab({ id: 5, url: 'https://github.com', title: 'GitHub' }),
      makeChromeTab({ id: 6, url: 'https://google.com', title: 'Google' }),
    ]);

    const response = await dispatch('SYNC_FROM_CHROME');

    const groups = response.data as { tabs: { url: string }[] }[];
    expect(groups[0].tabs).toHaveLength(2);
    expect(groups[0].tabs[0].url).toBe('https://github.com');
  });

  it('SYNC_FROM_CHROME returns empty array when no Chrome groups', async () => {
    (chrome.tabGroups.query as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const response = await dispatch('SYNC_FROM_CHROME');

    expect(response.success).toBe(true);
    expect(response.data).toEqual([]);
  });
});
