import { describe, it, expect, beforeEach } from 'vitest';
import { clearDB } from './db';
import {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  deleteAllGroups,
  getPinnedGroups,
  getArchivedGroups,
} from './groupRepository';
import type { TabGroup } from '@tabnova-types/index';

function makeGroup(overrides: Partial<TabGroup> = {}): TabGroup {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    name: 'Test Group',
    color: '#3B82F6',
    isPinned: false,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
    tabs: [],
    ...overrides,
  };
}

describe('groupRepository', () => {
  beforeEach(async () => {
    await clearDB();
  });

  it('creates a group', async () => {
    const group = makeGroup({ name: 'Dev' });
    const result = await createGroup(group);
    expect(result).toEqual(group);
  });

  it('reads all groups', async () => {
    const g1 = makeGroup({ name: 'Alpha', createdAt: new Date('2024-01-01') });
    const g2 = makeGroup({ name: 'Beta', createdAt: new Date('2024-06-01') });
    await createGroup(g1);
    await createGroup(g2);
    const all = await getAllGroups();
    expect(all).toHaveLength(2);
  });

  it('reads group by id', async () => {
    const group = makeGroup({ name: 'Find Me' });
    await createGroup(group);
    const found = await getGroupById(group.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe('Find Me');
  });

  it('returns undefined for non-existent group id', async () => {
    const found = await getGroupById('does-not-exist');
    expect(found).toBeUndefined();
  });

  it('updates a group', async () => {
    const group = makeGroup({ name: 'Original' });
    await createGroup(group);
    const updated = await updateGroup(group.id, { name: 'Updated' });
    expect(updated).toBeDefined();
    expect(updated?.name).toBe('Updated');
    expect(updated?.id).toBe(group.id);
    // updatedAt should have been refreshed
    expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(
      group.updatedAt.getTime(),
    );
  });

  it('returns undefined when updating a non-existent group', async () => {
    const result = await updateGroup('ghost-id', { name: 'Ghost' });
    expect(result).toBeUndefined();
  });

  it('deletes a group', async () => {
    const group = makeGroup();
    await createGroup(group);
    await deleteGroup(group.id);
    const found = await getGroupById(group.id);
    expect(found).toBeUndefined();
  });

  it('deletes all groups', async () => {
    await createGroup(makeGroup());
    await createGroup(makeGroup());
    await deleteAllGroups();
    const all = await getAllGroups();
    expect(all).toHaveLength(0);
  });

  it('gets pinned groups', async () => {
    const pinned = makeGroup({ isPinned: true });
    const notPinned = makeGroup({ isPinned: false });
    await createGroup(pinned);
    await createGroup(notPinned);
    const results = await getPinnedGroups();
    expect(results.every((g) => g.isPinned)).toBe(true);
    expect(results.some((g) => g.id === pinned.id)).toBe(true);
    expect(results.some((g) => g.id === notPinned.id)).toBe(false);
  });

  it('gets archived groups', async () => {
    const archived = makeGroup({ isArchived: true });
    const active = makeGroup({ isArchived: false });
    await createGroup(archived);
    await createGroup(active);
    const results = await getArchivedGroups();
    expect(results.every((g) => g.isArchived)).toBe(true);
    expect(results.some((g) => g.id === archived.id)).toBe(true);
    expect(results.some((g) => g.id === active.id)).toBe(false);
  });

  it('returns groups sorted by order (createdAt ascending)', async () => {
    const early = makeGroup({ name: 'First', createdAt: new Date('2023-01-01') });
    const late = makeGroup({ name: 'Last', createdAt: new Date('2025-01-01') });
    // Insert in reverse order to confirm sorting
    await createGroup(late);
    await createGroup(early);
    const all = await getAllGroups();
    expect(all[0].name).toBe('First');
    expect(all[1].name).toBe('Last');
  });
});
