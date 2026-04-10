import type { TabGroup } from '@tabnova-types/index';
import { generateId } from '@utils/helpers';
import { GROUP_COLORS } from '@utils/constants';
import { useGroupStore } from '@store/groupStore';
import { useUndoStore } from '@store/undoStore';

/**
 * Crée un nouveau groupe dans le store et la DB, avec undo.
 */
export async function createGroup(name: string, color?: string): Promise<TabGroup> {
  const group: TabGroup = {
    id: generateId(),
    name: name.trim().slice(0, 30),
    color: color ?? GROUP_COLORS[0],
    isPinned: false,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    tabs: [],
  };

  useGroupStore.getState().addGroup(group);

  useUndoStore.getState().push({
    description: `Créer groupe "${group.name}"`,
    undo: () => useGroupStore.getState().deleteGroup(group.id),
  });

  return group;
}

/**
 * Met à jour un groupe (store + DB) avec undo.
 */
export async function updateGroup(
  id: string,
  patch: Partial<Pick<TabGroup, 'name' | 'color' | 'isPinned'>>
): Promise<void> {
  const { groups } = useGroupStore.getState();
  const previous = groups.find((g) => g.id === id);
  if (!previous) return;

  const previousSnapshot: Partial<Pick<TabGroup, 'name' | 'color' | 'isPinned'>> = {
    name: previous.name,
    color: previous.color,
    isPinned: previous.isPinned,
  };

  useGroupStore.getState().updateGroup(id, patch);

  useUndoStore.getState().push({
    description: `Modifier groupe`,
    undo: () => useGroupStore.getState().updateGroup(id, previousSnapshot),
  });
}

/**
 * Supprime un groupe (store + DB) avec undo.
 */
export async function deleteGroup(id: string): Promise<void> {
  const { groups } = useGroupStore.getState();
  const savedGroup = groups.find((g) => g.id === id);
  if (!savedGroup) return;

  // Snapshot complet pour le undo
  const snapshot: TabGroup = { ...savedGroup };

  useGroupStore.getState().deleteGroup(id);

  useUndoStore.getState().push({
    description: `Supprimer groupe "${snapshot.name}"`,
    undo: () => useGroupStore.getState().addGroup(snapshot),
  });
}

/**
 * Fusionne plusieurs groupes en un seul nouveau groupe.
 */
export async function mergeGroups(
  ids: string[],
  finalName: string,
  finalColor?: string
): Promise<TabGroup> {
  const { groups } = useGroupStore.getState();

  // Rassemble tous les tabs des groupes source
  const combinedTabs = ids.flatMap((id) => {
    const group = groups.find((g) => g.id === id);
    return group ? group.tabs : [];
  });

  // Crée le nouveau groupe fusionné
  const newGroup = await createGroup(finalName, finalColor);

  // Met à jour le nouveau groupe avec les tabs combinés
  if (combinedTabs.length > 0) {
    useGroupStore.getState().updateGroup(newGroup.id, { tabs: combinedTabs });
    newGroup.tabs = combinedTabs;
  }

  // Supprime les anciens groupes
  for (const id of ids) {
    useGroupStore.getState().deleteGroup(id);
  }

  return newGroup;
}

/**
 * Réordonne les groupes dans le store selon un tableau d'IDs.
 */
export function reorderGroups(newOrder: string[]): void {
  const { groups } = useGroupStore.getState();

  const reorderedGroups = newOrder
    .map((id) => groups.find((g) => g.id === id))
    .filter((g): g is TabGroup => g !== undefined);

  // Ajoute les groupes éventuellement absents de newOrder à la fin
  const orderedIds = new Set(newOrder);
  const remaining = groups.filter((g) => !orderedIds.has(g.id));

  useGroupStore.getState().setGroups([...reorderedGroups, ...remaining]);
}

/**
 * Pine ou dépine un groupe avec undo.
 */
export async function togglePin(id: string): Promise<void> {
  const { groups } = useGroupStore.getState();
  const group = groups.find((g) => g.id === id);
  if (!group) return;

  if (group.isPinned) {
    useGroupStore.getState().unpinGroup(id);
    useUndoStore.getState().push({
      description: `Dépiner groupe "${group.name}"`,
      undo: () => useGroupStore.getState().pinGroup(id),
    });
  } else {
    useGroupStore.getState().pinGroup(id);
    useUndoStore.getState().push({
      description: `Épingler groupe "${group.name}"`,
      undo: () => useGroupStore.getState().unpinGroup(id),
    });
  }
}

/**
 * Archive un groupe avec undo.
 */
export async function archiveGroup(id: string): Promise<void> {
  const { groups } = useGroupStore.getState();
  const group = groups.find((g) => g.id === id);
  if (!group) return;

  useGroupStore.getState().archiveGroup(id);

  useUndoStore.getState().push({
    description: `Archiver groupe "${group.name}"`,
    undo: () => useGroupStore.getState().updateGroup(id, { isArchived: false }),
  });
}
