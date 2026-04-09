import { describe, it, expect, beforeEach } from 'vitest';
import { useGroupStore } from './groupStore';

const mockGroup = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Dev',
  color: '#3B82F6',
  isPinned: false,
  isArchived: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  tabs: [],
};

describe('useGroupStore', () => {
  beforeEach(() => {
    useGroupStore.setState({ groups: [], selectedGroupId: null });
  });

  it('adds a group', () => {
    useGroupStore.getState().addGroup(mockGroup);
    expect(useGroupStore.getState().groups).toHaveLength(1);
  });

  it('deletes a group', () => {
    useGroupStore.getState().addGroup(mockGroup);
    useGroupStore.getState().deleteGroup(mockGroup.id);
    expect(useGroupStore.getState().groups).toHaveLength(0);
  });

  it('updates a group name', () => {
    useGroupStore.getState().addGroup(mockGroup);
    useGroupStore.getState().updateGroup(mockGroup.id, { name: 'Design' });
    expect(useGroupStore.getState().groups[0].name).toBe('Design');
  });

  it('pins a group', () => {
    useGroupStore.getState().addGroup(mockGroup);
    useGroupStore.getState().pinGroup(mockGroup.id);
    expect(useGroupStore.getState().groups[0].isPinned).toBe(true);
  });

  it('clears selectedGroupId when deleting selected group', () => {
    useGroupStore.getState().addGroup(mockGroup);
    useGroupStore.getState().selectGroup(mockGroup.id);
    useGroupStore.getState().deleteGroup(mockGroup.id);
    expect(useGroupStore.getState().selectedGroupId).toBeNull();
  });
});
