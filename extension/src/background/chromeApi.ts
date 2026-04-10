// Wrapper around Chrome APIs for easier testing/mocking

export async function getAllTabGroups(): Promise<chrome.tabGroups.TabGroup[]> {
  try {
    return await chrome.tabGroups.query({});
  } catch (error) {
    console.error('[TabNova] Error fetching tab groups:', error);
    return [];
  }
}

export async function getTabsInGroup(groupId: number): Promise<chrome.tabs.Tab[]> {
  try {
    return await chrome.tabs.query({ groupId });
  } catch (error) {
    console.error('[TabNova] Error fetching tabs for group:', groupId, error);
    return [];
  }
}

export async function updateTabGroup(
  groupId: number,
  updates: chrome.tabGroups.UpdateProperties
): Promise<chrome.tabGroups.TabGroup | null> {
  try {
    return await chrome.tabGroups.update(groupId, updates);
  } catch (error) {
    console.error('[TabNova] Error updating tab group:', groupId, error);
    return null;
  }
}

export async function moveTabToGroup(tabId: number, groupId: number): Promise<void> {
  try {
    await chrome.tabs.group({ tabIds: tabId, groupId });
  } catch (error) {
    console.error('[TabNova] Error moving tab to group:', error);
  }
}

export async function openAllTabsInGroup(groupId: number): Promise<void> {
  try {
    const tabs = await getTabsInGroup(groupId);
    // Focus first tab's window and bring Chrome to foreground
    if (tabs.length > 0 && tabs[0].windowId) {
      await chrome.windows.update(tabs[0].windowId, { focused: true });
    }
    // Activate each tab (open URLs that aren't loaded)
    for (const tab of tabs) {
      if (tab.id) {
        await chrome.tabs.update(tab.id, { active: false });
      }
    }
    // Focus the first tab
    if (tabs[0]?.id) {
      await chrome.tabs.update(tabs[0].id, { active: true });
    }
  } catch (error) {
    console.error('[TabNova] Error opening all tabs in group:', error);
  }
}

/**
 * Creates a new Chrome tab group from the given tab IDs and returns the group ID.
 * Returns null if the operation fails.
 */
export async function createChromeGroup(
  tabIds: number[],
  title: string,
  color?: chrome.tabGroups.ColorEnum
): Promise<number | null> {
  try {
    const groupId = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(groupId, { title, ...(color ? { color } : {}) });
    return groupId;
  } catch (error) {
    console.error('[TabNova] Error creating chrome group:', error);
    return null;
  }
}

/**
 * Ungroups all tabs in the given Chrome group, effectively removing the group.
 */
export async function removeChromeGroup(groupId: number): Promise<void> {
  try {
    const tabs = await getTabsInGroup(groupId);
    const tabIds = tabs.map((t) => t.id).filter((id): id is number => id !== undefined);
    if (tabIds.length > 0) {
      await chrome.tabs.ungroup(tabIds);
    }
  } catch (error) {
    console.error('[TabNova] Error removing chrome group:', groupId, error);
  }
}

/**
 * Renames a Chrome tab group.
 */
export async function renameChromeGroup(groupId: number, title: string): Promise<void> {
  try {
    await chrome.tabGroups.update(groupId, { title });
  } catch (error) {
    console.error('[TabNova] Error renaming chrome group:', groupId, error);
  }
}

/**
 * Returns all Chrome tab groups paired with their tabs.
 */
export async function getAllGroupsWithTabs(): Promise<
  { group: chrome.tabGroups.TabGroup; tabs: chrome.tabs.Tab[] }[]
> {
  const groups = await getAllTabGroups();
  const result: { group: chrome.tabGroups.TabGroup; tabs: chrome.tabs.Tab[] }[] = [];
  for (const group of groups) {
    const tabs = await getTabsInGroup(group.id);
    result.push({ group, tabs });
  }
  return result;
}

export async function setupContextMenus(): Promise<void> {
  try {
    // Remove existing menus first
    await chrome.contextMenus.removeAll();

    // Add to group (single tab)
    // Note: 'tab' context requires @types/chrome update; cast needed for older typedefs
    chrome.contextMenus.create({
      id: 'add-to-group',
      title: 'Ajouter au groupe TabNova',
      contexts: ['tab' as chrome.contextMenus.ContextType],
    });

    // Create group from selected tabs
    chrome.contextMenus.create({
      id: 'create-group',
      title: 'Créer un groupe TabNova',
      contexts: ['tab' as chrome.contextMenus.ContextType],
    });

    console.log('[TabNova] Context menus created');
  } catch (error) {
    console.error('[TabNova] Error creating context menus:', error);
  }
}
