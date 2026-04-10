import { useCallback } from 'react';
import { useMessage } from '@hooks/useMessage';
import { useGroupStore } from '@store/groupStore';
import { useUndoStore } from '@store/undoStore';
import { generateId } from '@utils/helpers';
import type { TabGroup } from '@tabnova-types/index';

// ── Hex → Chrome color mapping ───────────────────────────────────────────────

const HEX_TO_CHROME: Record<string, string> = {
  '#3B82F6': 'blue',
  '#EF4444': 'red',
  '#FBBF24': 'yellow',
  '#10B981': 'green',
  '#EC4899': 'pink',
  '#8B5CF6': 'purple',
  '#06B6D4': 'cyan',
  '#F97316': 'orange',
};

function mapHexToChrome(hex: string): string {
  return HEX_TO_CHROME[hex] ?? 'blue';
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useGroupActions() {
  const { sendMessage } = useMessage();
  const addGroup = useGroupStore((s) => s.addGroup);
  const updateGroup = useGroupStore((s) => s.updateGroup);
  const deleteGroup = useGroupStore((s) => s.deleteGroup);
  const pushUndo = useUndoStore((s) => s.push);

  /** Crée un groupe dans Chrome ET dans le store. */
  const createGroup = useCallback(
    async (name: string, color: string, tabIds: number[] = []): Promise<void> => {
      // 1. Crée dans Chrome via le background
      const chromeGroupId = await sendMessage<number>('CREATE_GROUP', {
        tabIds,
        title: name,
        color: mapHexToChrome(color),
      });

      // 2. Crée dans le store local (avec chromeGroupId en syncId)
      const group: TabGroup = {
        id: generateId(),
        name,
        color,
        isPinned: false,
        isArchived: false,
        syncId: String(chromeGroupId),
        createdAt: new Date(),
        updatedAt: new Date(),
        tabs: [],
      };
      addGroup(group);

      pushUndo({
        description: `Créer groupe "${name}"`,
        undo: () => deleteGroup(group.id),
      });
    },
    [sendMessage, addGroup, deleteGroup, pushUndo]
  );

  /** Met à jour un groupe dans Chrome ET dans le store. */
  const editGroup = useCallback(
    async (
      id: string,
      chromeGroupId: number | undefined,
      patch: { name?: string; color?: string }
    ): Promise<void> => {
      // 1. Envoie au background si chromeGroupId existe
      if (chromeGroupId !== undefined) {
        await sendMessage('UPDATE_GROUP', { chromeGroupId, title: patch.name });
      }

      // 2. Sauvegarde l'état avant modification pour l'undo
      const savedGroup = useGroupStore.getState().groups.find((g) => g.id === id);

      // 3. Met à jour le store
      updateGroup(id, patch);

      // 4. Push undo
      if (savedGroup) {
        pushUndo({
          description: `Modifier groupe`,
          undo: () => updateGroup(id, { name: savedGroup.name, color: savedGroup.color }),
        });
      }
    },
    [sendMessage, updateGroup, pushUndo]
  );

  /** Supprime un groupe de Chrome ET du store. */
  const removeGroup = useCallback(
    async (id: string, chromeGroupId: number | undefined): Promise<void> => {
      // 1. Envoie au background pour supprimer de Chrome
      if (chromeGroupId !== undefined) {
        await sendMessage('DELETE_GROUP', { chromeGroupId });
      }

      // 2. Sauvegarde l'état avant suppression pour l'undo
      const savedGroup = useGroupStore.getState().groups.find((g) => g.id === id);

      // 3. Supprime du store
      deleteGroup(id);

      // 4. Push undo (re-ajoute dans le store — mais pas dans Chrome)
      if (savedGroup) {
        pushUndo({
          description: `Supprimer groupe "${savedGroup.name}"`,
          undo: () => addGroup(savedGroup),
        });
      }
    },
    [sendMessage, deleteGroup, addGroup, pushUndo]
  );

  return { createGroup, editGroup, removeGroup };
}
