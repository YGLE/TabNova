import type { TabGroup } from '@tabnova-types/index';
import { ARCHIVE_THRESHOLD_MONTHS } from '@utils/constants';

/**
 * Retourne true si le groupe est considéré comme "stale" (pas accédé depuis
 * ARCHIVE_THRESHOLD_MONTHS mois) et n'est pas encore archivé.
 */
export function isGroupStale(group: TabGroup): boolean {
  if (group.isArchived) return false;

  const threshold = ARCHIVE_THRESHOLD_MONTHS;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - threshold);

  const lastAccess = group.lastAccessedAt ?? group.updatedAt ?? group.createdAt;
  return lastAccess < cutoff;
}

/**
 * Retourne les groupes non-archivés qui n'ont pas été accédés depuis
 * ARCHIVE_THRESHOLD_MONTHS mois.
 */
export function getStaleCandidates(groups: TabGroup[]): TabGroup[] {
  return groups.filter(isGroupStale);
}
