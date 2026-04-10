import type { Tab } from '@tabnova-types/index';
import { generateId } from '@utils/helpers';
import { useGroupStore } from '@store/groupStore';

/**
 * Ajoute un tab à un groupe (store uniquement — chrome gère le vrai onglet).
 */
export async function addTab(groupId: string, url: string, title?: string): Promise<Tab> {
  let resolvedTitle: string;
  try {
    resolvedTitle = title ?? new URL(url).hostname;
  } catch {
    resolvedTitle = title ?? url;
  }

  const tab: Tab = {
    id: generateId(),
    groupId,
    url,
    title: resolvedTitle,
    position: 0,
    isStarred: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const { groups, updateGroup } = useGroupStore.getState();
  const group = groups.find((g) => g.id === groupId);
  if (group) {
    updateGroup(groupId, { tabs: [...group.tabs, tab] });
  }

  return tab;
}

/**
 * Supprime un tab d'un groupe.
 */
export async function removeTab(groupId: string, tabId: string): Promise<void> {
  const { groups, updateGroup } = useGroupStore.getState();
  const group = groups.find((g) => g.id === groupId);
  if (!group) return;

  const updatedTabs = group.tabs.filter((t) => t.id !== tabId);
  updateGroup(groupId, { tabs: updatedTabs });
}

/**
 * Met à jour un tab (titre, url, favicon, isStarred).
 */
export async function updateTab(
  groupId: string,
  tabId: string,
  patch: Partial<Pick<Tab, 'title' | 'url' | 'favicon' | 'isStarred'>>
): Promise<void> {
  const { groups, updateGroup } = useGroupStore.getState();
  const group = groups.find((g) => g.id === groupId);
  if (!group) return;

  const updatedTabs = group.tabs.map((t) =>
    t.id === tabId ? { ...t, ...patch, updatedAt: new Date() } : t
  );
  updateGroup(groupId, { tabs: updatedTabs });
}
