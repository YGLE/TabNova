import { describe, it, expect, beforeEach } from 'vitest';
import { useGroupStore } from '@store/groupStore';
import { useUndoStore } from '@store/undoStore';
import { createGroup } from './groupService';
import { addTab, removeTab, updateTab } from './tabService';

beforeEach(() => {
  useGroupStore.setState({ groups: [], selectedGroupId: null });
  useUndoStore.setState({ stack: [], canUndo: false });
});

describe('tabService', () => {
  it('adds a tab to a group', async () => {
    const group = await createGroup('Mon groupe');
    const tab = await addTab(group.id, 'https://example.com', 'Example');

    expect(tab.id).toBeTruthy();
    expect(tab.groupId).toBe(group.id);
    expect(tab.url).toBe('https://example.com');
    expect(tab.title).toBe('Example');
    expect(tab.isStarred).toBe(false);
    expect(tab.position).toBe(0);

    const { groups } = useGroupStore.getState();
    const updatedGroup = groups.find((g) => g.id === group.id);
    expect(updatedGroup?.tabs).toHaveLength(1);
    expect(updatedGroup?.tabs[0].id).toBe(tab.id);
  });

  it('uses hostname as title if not provided', async () => {
    const group = await createGroup('Mon groupe');
    const tab = await addTab(group.id, 'https://github.com/user/repo');

    expect(tab.title).toBe('github.com');
  });

  it('removes a tab from a group', async () => {
    const group = await createGroup('Mon groupe');
    const tab = await addTab(group.id, 'https://example.com', 'Example');

    const { groups: groupsBefore } = useGroupStore.getState();
    expect(groupsBefore.find((g) => g.id === group.id)?.tabs).toHaveLength(1);

    await removeTab(group.id, tab.id);

    const { groups: groupsAfter } = useGroupStore.getState();
    expect(groupsAfter.find((g) => g.id === group.id)?.tabs).toHaveLength(0);
  });

  it('updates tab properties', async () => {
    const group = await createGroup('Mon groupe');
    const tab = await addTab(group.id, 'https://example.com', 'Ancien titre');

    await updateTab(group.id, tab.id, { title: 'Nouveau titre', isStarred: true });

    const { groups } = useGroupStore.getState();
    const updatedTab = groups.find((g) => g.id === group.id)?.tabs.find((t) => t.id === tab.id);
    expect(updatedTab?.title).toBe('Nouveau titre');
    expect(updatedTab?.isStarred).toBe(true);
  });

  it('does nothing when removing from non-existent group', async () => {
    await expect(removeTab('nonexistent-group', 'tab-id')).resolves.toBeUndefined();
  });

  it('does nothing when updating tab in non-existent group', async () => {
    await expect(
      updateTab('nonexistent-group', 'tab-id', { title: 'Test' })
    ).resolves.toBeUndefined();
  });

  it('adds multiple tabs to the same group', async () => {
    const group = await createGroup('Multi-tabs');
    await addTab(group.id, 'https://a.com', 'A');
    await addTab(group.id, 'https://b.com', 'B');
    await addTab(group.id, 'https://c.com', 'C');

    const { groups } = useGroupStore.getState();
    expect(groups.find((g) => g.id === group.id)?.tabs).toHaveLength(3);
  });
});
