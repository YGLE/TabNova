import { describe, it, expect } from 'vitest';
import type { TabGroup } from '@tabnova-types/index';
import type { Change } from '@tabnova-types/Sync';
import { resolveGroupConflict, mergeChangeLogs, applyChanges } from './conflictResolver';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeGroup(overrides: Partial<TabGroup> = {}): TabGroup {
  return {
    id: 'group-1',
    name: 'Test Group',
    color: '#3B82F6',
    isPinned: false,
    isArchived: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-01'),
    tabs: [],
    ...overrides,
  };
}

function makeChange(overrides: Partial<Change> = {}): Change {
  return {
    id: 'change-1',
    type: 'CREATE',
    entity: 'GROUP',
    entityId: 'group-1',
    timestamp: new Date('2024-06-01T10:00:00Z'),
    ...overrides,
  };
}

// ─── resolveGroupConflict ─────────────────────────────────────────────────────

describe('resolveGroupConflict', () => {
  it('returns local if local is more recent', () => {
    const local = makeGroup({ updatedAt: new Date('2024-06-10') });
    const remote = makeGroup({ updatedAt: new Date('2024-06-01') });
    expect(resolveGroupConflict(local, remote)).toBe(local);
  });

  it('returns remote if remote is more recent', () => {
    const local = makeGroup({ updatedAt: new Date('2024-06-01') });
    const remote = makeGroup({ updatedAt: new Date('2024-06-10') });
    expect(resolveGroupConflict(local, remote)).toBe(remote);
  });

  it('returns local if timestamps are equal', () => {
    const ts = new Date('2024-06-05');
    const local = makeGroup({ updatedAt: ts });
    const remote = makeGroup({ updatedAt: ts });
    expect(resolveGroupConflict(local, remote)).toBe(local);
  });
});

// ─── mergeChangeLogs ──────────────────────────────────────────────────────────

describe('mergeChangeLogs', () => {
  it('combines local and remote changes with distinct entityIds', () => {
    const local: Change[] = [
      makeChange({ id: 'c1', entityId: 'group-1', timestamp: new Date('2024-06-01T10:00:00Z') }),
    ];
    const remote: Change[] = [
      makeChange({ id: 'c2', entityId: 'group-2', timestamp: new Date('2024-06-01T09:00:00Z') }),
    ];
    const merged = mergeChangeLogs(local, remote);
    expect(merged).toHaveLength(2);
    const ids = merged.map((c) => c.entityId);
    expect(ids).toContain('group-1');
    expect(ids).toContain('group-2');
  });

  it('uses most recent change when entityId conflicts', () => {
    const older = makeChange({
      id: 'old',
      entityId: 'group-1',
      timestamp: new Date('2024-06-01T08:00:00Z'),
      type: 'CREATE',
    });
    const newer = makeChange({
      id: 'new',
      entityId: 'group-1',
      timestamp: new Date('2024-06-01T12:00:00Z'),
      type: 'UPDATE',
    });
    const merged = mergeChangeLogs([newer], [older]);
    expect(merged).toHaveLength(1);
    expect(merged[0].type).toBe('UPDATE');
    expect(merged[0].id).toBe('new');
  });

  it('sorts results by timestamp ascending', () => {
    const local: Change[] = [
      makeChange({ id: 'c1', entityId: 'g1', timestamp: new Date('2024-06-03T00:00:00Z') }),
    ];
    const remote: Change[] = [
      makeChange({ id: 'c2', entityId: 'g2', timestamp: new Date('2024-06-01T00:00:00Z') }),
      makeChange({ id: 'c3', entityId: 'g3', timestamp: new Date('2024-06-02T00:00:00Z') }),
    ];
    const merged = mergeChangeLogs(local, remote);
    expect(merged[0].id).toBe('c2');
    expect(merged[1].id).toBe('c3');
    expect(merged[2].id).toBe('c1');
  });
});

// ─── applyChanges ─────────────────────────────────────────────────────────────

describe('applyChanges', () => {
  it('applies CREATE change', () => {
    const groups: TabGroup[] = [];
    const newGroup = makeGroup({ id: 'g-new', name: 'New Group' });
    const changes: Change[] = [makeChange({ type: 'CREATE', entityId: 'g-new', data: newGroup })];
    const result = applyChanges(groups, changes);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('g-new');
  });

  it('applies UPDATE change', () => {
    const groups: TabGroup[] = [makeGroup({ id: 'g1', name: 'Old Name' })];
    const changes: Change[] = [
      makeChange({ type: 'UPDATE', entityId: 'g1', data: { name: 'New Name' } }),
    ];
    const result = applyChanges(groups, changes);
    expect(result[0].name).toBe('New Name');
  });

  it('applies DELETE change', () => {
    const groups: TabGroup[] = [makeGroup({ id: 'g1' }), makeGroup({ id: 'g2' })];
    const changes: Change[] = [makeChange({ type: 'DELETE', entityId: 'g1' })];
    const result = applyChanges(groups, changes);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('g2');
  });

  it('skips TAB changes (only processes GROUP)', () => {
    const groups: TabGroup[] = [makeGroup({ id: 'g1' })];
    const changes: Change[] = [makeChange({ type: 'DELETE', entity: 'TAB', entityId: 'g1' })];
    const result = applyChanges(groups, changes);
    // Group must not be deleted because entity is TAB
    expect(result).toHaveLength(1);
  });

  it('does not duplicate on CREATE if group already exists', () => {
    const existing = makeGroup({ id: 'g1', name: 'Existing' });
    const groups: TabGroup[] = [existing];
    const changes: Change[] = [
      makeChange({
        type: 'CREATE',
        entityId: 'g1',
        data: makeGroup({ id: 'g1', name: 'Duplicate' }),
      }),
    ];
    const result = applyChanges(groups, changes);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Existing');
  });
});
