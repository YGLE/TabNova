import { describe, it, expect } from 'vitest';
import type { TabGroup } from '@tabnova-types/index';
import { isGroupStale, getStaleCandidates } from './archiveService';
import { ARCHIVE_THRESHOLD_MONTHS } from '@utils/constants';

/** Crée une date dans le passé, il y a `months` mois. */
function monthsAgo(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
}

/** Fabrique un TabGroup minimal pour les tests. */
function makeGroup(overrides: Partial<TabGroup> = {}): TabGroup {
  return {
    id: 'test-id',
    name: 'Test Group',
    color: '#3B82F6',
    isPinned: false,
    isArchived: false,
    createdAt: monthsAgo(24),
    updatedAt: monthsAgo(24),
    tabs: [],
    ...overrides,
  };
}

describe('archiveService', () => {
  describe('isGroupStale', () => {
    it('identifies stale groups (last access > 18 months ago)', () => {
      const staleGroup = makeGroup({
        lastAccessedAt: monthsAgo(ARCHIVE_THRESHOLD_MONTHS + 1),
      });
      expect(isGroupStale(staleGroup)).toBe(true);
    });

    it('excludes already archived groups', () => {
      const archivedGroup = makeGroup({
        isArchived: true,
        lastAccessedAt: monthsAgo(ARCHIVE_THRESHOLD_MONTHS + 6),
      });
      expect(isGroupStale(archivedGroup)).toBe(false);
    });

    it('excludes recently accessed groups', () => {
      const recentGroup = makeGroup({
        lastAccessedAt: monthsAgo(ARCHIVE_THRESHOLD_MONTHS - 1),
      });
      expect(isGroupStale(recentGroup)).toBe(false);
    });

    it('uses updatedAt if lastAccessedAt is not set', () => {
      const groupWithRecentUpdate = makeGroup({
        lastAccessedAt: undefined,
        updatedAt: monthsAgo(1),
      });
      expect(isGroupStale(groupWithRecentUpdate)).toBe(false);

      const groupWithOldUpdate = makeGroup({
        lastAccessedAt: undefined,
        updatedAt: monthsAgo(ARCHIVE_THRESHOLD_MONTHS + 2),
      });
      expect(isGroupStale(groupWithOldUpdate)).toBe(true);
    });

    it('uses createdAt if both lastAccessedAt and updatedAt are unavailable', () => {
      // updatedAt est toujours requis par l'interface, mais on peut forcer via cast
      const group = makeGroup({
        lastAccessedAt: undefined,
        updatedAt: monthsAgo(ARCHIVE_THRESHOLD_MONTHS + 3),
        createdAt: monthsAgo(ARCHIVE_THRESHOLD_MONTHS + 3),
      });
      expect(isGroupStale(group)).toBe(true);
    });

    it('returns false for a group accessed very recently', () => {
      // Un accès hier ne doit jamais être stale
      const recentGroup = makeGroup({
        lastAccessedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // hier
      });
      expect(isGroupStale(recentGroup)).toBe(false);
    });
  });

  describe('getStaleCandidates', () => {
    it('returns only stale non-archived groups', () => {
      const stale1 = makeGroup({ id: 'stale-1', lastAccessedAt: monthsAgo(24) });
      const stale2 = makeGroup({ id: 'stale-2', lastAccessedAt: monthsAgo(20) });
      const recent = makeGroup({ id: 'recent', lastAccessedAt: monthsAgo(3) });
      const archived = makeGroup({
        id: 'archived',
        isArchived: true,
        lastAccessedAt: monthsAgo(30),
      });

      const candidates = getStaleCandidates([stale1, stale2, recent, archived]);

      expect(candidates).toHaveLength(2);
      expect(candidates.map((g) => g.id)).toContain('stale-1');
      expect(candidates.map((g) => g.id)).toContain('stale-2');
    });

    it('returns empty array if no stale groups', () => {
      const recentGroups = [
        makeGroup({ id: '1', lastAccessedAt: monthsAgo(1) }),
        makeGroup({ id: '2', lastAccessedAt: monthsAgo(6) }),
      ];
      expect(getStaleCandidates(recentGroups)).toHaveLength(0);
    });

    it('returns empty array for empty input', () => {
      expect(getStaleCandidates([])).toHaveLength(0);
    });
  });
});
