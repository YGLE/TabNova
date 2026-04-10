import { describe, it, expect, beforeEach } from 'vitest';
import { clearDB } from './db';
import {
  createTab,
  getTabsByGroupId,
  getAllTabs,
  getTabById,
  updateTab,
  deleteTab,
  deleteTabsByGroupId,
} from './tabRepository';
import type { Tab } from '@tabnova-types/index';

function makeTab(overrides: Partial<Tab> = {}): Tab {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    groupId: 'group-1',
    url: 'https://example.com',
    title: 'Example',
    position: 0,
    isStarred: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('tabRepository', () => {
  beforeEach(async () => {
    await clearDB();
  });

  it('creates a tab', async () => {
    const tab = makeTab({ title: 'My Tab' });
    const result = await createTab(tab);
    expect(result).toEqual(tab);
  });

  it('gets tabs by group id', async () => {
    const tabA = makeTab({ groupId: 'group-A' });
    const tabB = makeTab({ groupId: 'group-A' });
    const tabC = makeTab({ groupId: 'group-B' });
    await createTab(tabA);
    await createTab(tabB);
    await createTab(tabC);
    const results = await getTabsByGroupId('group-A');
    expect(results).toHaveLength(2);
    expect(results.every((t) => t.groupId === 'group-A')).toBe(true);
  });

  it('returns empty array for unknown group id', async () => {
    const results = await getTabsByGroupId('no-such-group');
    expect(results).toHaveLength(0);
  });

  it('gets all tabs', async () => {
    await createTab(makeTab({ groupId: 'g1' }));
    await createTab(makeTab({ groupId: 'g2' }));
    const all = await getAllTabs();
    expect(all).toHaveLength(2);
  });

  it('gets tab by id', async () => {
    const tab = makeTab({ title: 'Specific' });
    await createTab(tab);
    const found = await getTabById(tab.id);
    expect(found).toBeDefined();
    expect(found?.title).toBe('Specific');
  });

  it('returns undefined for non-existent tab id', async () => {
    const found = await getTabById('ghost');
    expect(found).toBeUndefined();
  });

  it('updates a tab', async () => {
    const tab = makeTab({ title: 'Old Title' });
    await createTab(tab);
    const updated = await updateTab(tab.id, { title: 'New Title' });
    expect(updated).toBeDefined();
    expect(updated?.title).toBe('New Title');
    expect(updated?.id).toBe(tab.id);
    expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(
      tab.updatedAt.getTime(),
    );
  });

  it('returns undefined when updating non-existent tab', async () => {
    const result = await updateTab('no-tab', { title: 'Ghost' });
    expect(result).toBeUndefined();
  });

  it('deletes a tab', async () => {
    const tab = makeTab();
    await createTab(tab);
    await deleteTab(tab.id);
    const found = await getTabById(tab.id);
    expect(found).toBeUndefined();
  });

  it('deletes all tabs for a group', async () => {
    const tab1 = makeTab({ groupId: 'target-group' });
    const tab2 = makeTab({ groupId: 'target-group' });
    const tab3 = makeTab({ groupId: 'other-group' });
    await createTab(tab1);
    await createTab(tab2);
    await createTab(tab3);
    await deleteTabsByGroupId('target-group');
    const remaining = await getAllTabs();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].groupId).toBe('other-group');
  });
});
