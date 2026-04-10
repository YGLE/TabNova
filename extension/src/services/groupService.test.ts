import { describe, it, expect, beforeEach } from 'vitest';
import { useGroupStore } from '@store/groupStore';
import { useUndoStore } from '@store/undoStore';
import {
  createGroup,
  updateGroup,
  deleteGroup,
  mergeGroups,
  reorderGroups,
  togglePin,
  archiveGroup,
} from './groupService';
import { GROUP_COLORS } from '@utils/constants';

beforeEach(() => {
  useGroupStore.setState({ groups: [], selectedGroupId: null });
  useUndoStore.setState({ stack: [], canUndo: false });
});

describe('groupService', () => {
  describe('createGroup', () => {
    it('creates a group with correct properties', async () => {
      const group = await createGroup('Mon groupe', '#FF0000');

      expect(group.name).toBe('Mon groupe');
      expect(group.color).toBe('#FF0000');
      expect(group.isPinned).toBe(false);
      expect(group.isArchived).toBe(false);
      expect(group.tabs).toEqual([]);
      expect(group.id).toBeTruthy();
      expect(group.createdAt).toBeInstanceOf(Date);
      expect(group.updatedAt).toBeInstanceOf(Date);
    });

    it('truncates name to 30 chars', async () => {
      const longName = 'A'.repeat(50);
      const group = await createGroup(longName);
      expect(group.name.length).toBe(30);
    });

    it('uses default color if not provided', async () => {
      const group = await createGroup('Test');
      expect(group.color).toBe(GROUP_COLORS[0]);
    });

    it('adds to store', async () => {
      await createGroup('Store Test');
      const { groups } = useGroupStore.getState();
      expect(groups).toHaveLength(1);
      expect(groups[0].name).toBe('Store Test');
    });

    it('pushes undo action', async () => {
      await createGroup('Undo Test');
      const { stack, canUndo } = useUndoStore.getState();
      expect(stack).toHaveLength(1);
      expect(canUndo).toBe(true);
      expect(stack[0].description).toContain('Undo Test');
    });

    it('trims whitespace from name', async () => {
      const group = await createGroup('  Mon groupe  ');
      expect(group.name).toBe('Mon groupe');
    });
  });

  describe('deleteGroup', () => {
    it('removes from store', async () => {
      const group = await createGroup('À supprimer');
      await deleteGroup(group.id);
      const { groups } = useGroupStore.getState();
      expect(groups.find((g) => g.id === group.id)).toBeUndefined();
    });

    it('undo restores the group', async () => {
      const group = await createGroup('À restaurer');
      await deleteGroup(group.id);

      // Reset undo stack to only the delete action (createGroup also pushed)
      const { stack } = useUndoStore.getState();
      // The last action is the delete undo
      const deleteUndoAction = stack[stack.length - 1];
      await deleteUndoAction.undo();

      const { groups } = useGroupStore.getState();
      expect(groups.find((g) => g.id === group.id)).toBeDefined();
    });

    it('does nothing if group does not exist', async () => {
      await expect(deleteGroup('nonexistent-id')).resolves.toBeUndefined();
    });
  });

  describe('updateGroup', () => {
    it('updates name in store', async () => {
      const group = await createGroup('Ancien nom');
      await updateGroup(group.id, { name: 'Nouveau nom' });

      const { groups } = useGroupStore.getState();
      const updated = groups.find((g) => g.id === group.id);
      expect(updated?.name).toBe('Nouveau nom');
    });

    it('undo restores previous name', async () => {
      const group = await createGroup('Ancien nom');
      await updateGroup(group.id, { name: 'Nouveau nom' });

      const { stack } = useUndoStore.getState();
      const updateUndoAction = stack[stack.length - 1];
      await updateUndoAction.undo();

      const { groups } = useGroupStore.getState();
      const restored = groups.find((g) => g.id === group.id);
      expect(restored?.name).toBe('Ancien nom');
    });

    it('does nothing if group does not exist', async () => {
      await expect(updateGroup('nonexistent-id', { name: 'Test' })).resolves.toBeUndefined();
    });
  });

  describe('mergeGroups', () => {
    it('creates new group with combined tabs', async () => {
      const g1 = await createGroup('Groupe 1');
      const g2 = await createGroup('Groupe 2');

      // Ajoute des tabs manuellement dans le store
      useGroupStore.getState().updateGroup(g1.id, {
        tabs: [
          {
            id: 'tab-1',
            groupId: g1.id,
            url: 'https://example.com',
            title: 'Example',
            position: 0,
            isStarred: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });
      useGroupStore.getState().updateGroup(g2.id, {
        tabs: [
          {
            id: 'tab-2',
            groupId: g2.id,
            url: 'https://test.com',
            title: 'Test',
            position: 0,
            isStarred: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      const merged = await mergeGroups([g1.id, g2.id], 'Fusionné');

      const { groups } = useGroupStore.getState();
      const mergedInStore = groups.find((g) => g.id === merged.id);
      expect(mergedInStore).toBeDefined();
      expect(mergedInStore?.tabs).toHaveLength(2);
    });

    it('deletes source groups', async () => {
      const g1 = await createGroup('Source 1');
      const g2 = await createGroup('Source 2');

      await mergeGroups([g1.id, g2.id], 'Fusionné');

      const { groups } = useGroupStore.getState();
      expect(groups.find((g) => g.id === g1.id)).toBeUndefined();
      expect(groups.find((g) => g.id === g2.id)).toBeUndefined();
    });
  });

  describe('reorderGroups', () => {
    it('reorders groups by id array', async () => {
      const g1 = await createGroup('Alpha');
      const g2 = await createGroup('Beta');
      const g3 = await createGroup('Gamma');

      reorderGroups([g3.id, g1.id, g2.id]);

      const { groups } = useGroupStore.getState();
      expect(groups[0].id).toBe(g3.id);
      expect(groups[1].id).toBe(g1.id);
      expect(groups[2].id).toBe(g2.id);
    });
  });

  describe('togglePin', () => {
    it('pins unpinned group', async () => {
      const group = await createGroup('Non épinglé');
      expect(group.isPinned).toBe(false);

      await togglePin(group.id);

      const { groups } = useGroupStore.getState();
      expect(groups.find((g) => g.id === group.id)?.isPinned).toBe(true);
    });

    it('unpins pinned group', async () => {
      const group = await createGroup('Épinglé');
      await togglePin(group.id); // pin
      await togglePin(group.id); // unpin

      const { groups } = useGroupStore.getState();
      expect(groups.find((g) => g.id === group.id)?.isPinned).toBe(false);
    });

    it('undo of pin restores unpinned state', async () => {
      const group = await createGroup('Test pin undo');
      await togglePin(group.id); // pin

      const { stack } = useUndoStore.getState();
      const pinUndoAction = stack[stack.length - 1];
      await pinUndoAction.undo();

      const { groups } = useGroupStore.getState();
      expect(groups.find((g) => g.id === group.id)?.isPinned).toBe(false);
    });

    it('does nothing if group does not exist', async () => {
      await expect(togglePin('nonexistent-id')).resolves.toBeUndefined();
    });
  });

  describe('archiveGroup', () => {
    it('archives a group', async () => {
      const group = await createGroup('À archiver');
      await archiveGroup(group.id);

      const { groups } = useGroupStore.getState();
      expect(groups.find((g) => g.id === group.id)?.isArchived).toBe(true);
    });

    it('undo restores unarchived state', async () => {
      const group = await createGroup('À archiver puis restaurer');
      await archiveGroup(group.id);

      const { stack } = useUndoStore.getState();
      const archiveUndoAction = stack[stack.length - 1];
      await archiveUndoAction.undo();

      const { groups } = useGroupStore.getState();
      expect(groups.find((g) => g.id === group.id)?.isArchived).toBe(false);
    });

    it('does nothing if group does not exist', async () => {
      await expect(archiveGroup('nonexistent-id')).resolves.toBeUndefined();
    });
  });
});
