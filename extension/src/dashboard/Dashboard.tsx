import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Navbar } from '@components/Navbar';
import { SearchBar } from '@components/SearchBar';
import { BubbleCluster } from '@components/BubbleCluster';
import { Modal } from '@components/Modal';
import { GroupForm } from '@components/GroupForm';
import { ContextMenu } from '@components/ContextMenu';
import type { ContextMenuItem } from '@components/ContextMenu';
import { useGroupStore } from '@store/groupStore';
import { useUIStore } from '@store/uiStore';
import * as groupService from '@services/groupService';
import type { TabGroup } from '@tabnova-types/index';

function EmptyState() {
  return (
    <div
      style={{
        textAlign: 'center',
        color: '#6B7280',
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
    >
      <p style={{ fontSize: '18px', marginBottom: '8px' }}>Pas de groupes trouvés.</p>
      <p style={{ fontSize: '14px' }}>Créez votre premier groupe pour commencer.</p>
    </div>
  );
}

export function Dashboard() {
  const groups = useGroupStore((s) => s.groups);
  const selectedGroupId = useGroupStore((s) => s.selectedGroupId);
  const selectGroup = useGroupStore((s) => s.selectGroup);

  const zoom = useUIStore((s) => s.zoom);
  const setZoom = useUIStore((s) => s.setZoom);
  const setHoveredGroupId = useUIStore((s) => s.setHoveredGroupId);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Modal & context menu state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TabGroup | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    group: TabGroup | null;
  }>({ isOpen: false, position: { x: 0, y: 0 }, group: null });

  // Track real container size
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Handlers
  const handleCreateGroup = async (values: { name: string; color: string }) => {
    try {
      await groupService.createGroup(values.name, values.color);
      toast.success('Groupe créé');
      setIsCreateModalOpen(false);
    } catch {
      toast.error('Erreur lors de la création');
    }
  };

  const handleEditGroup = async (values: { name: string; color: string }) => {
    if (!editingGroup) return;
    try {
      await groupService.updateGroup(editingGroup.id, {
        name: values.name,
        color: values.color,
      });
      toast.success('Groupe modifié');
      setIsEditModalOpen(false);
      setEditingGroup(null);
    } catch {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await groupService.deleteGroup(groupId);
      toast.success('Groupe supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleGroupRightClick = (group: TabGroup, position: { x: number; y: number }) => {
    setContextMenu({ isOpen: true, position, group });
  };

  const contextMenuItems: ContextMenuItem[] = [
    {
      label: 'Renommer',
      icon: '✏️',
      onClick: () => {
        setEditingGroup(contextMenu.group);
        setIsEditModalOpen(true);
        setContextMenu((m) => ({ ...m, isOpen: false }));
      },
    },
    {
      label: 'Supprimer',
      icon: '🗑️',
      variant: 'danger',
      onClick: () => {
        if (contextMenu.group) {
          void handleDeleteGroup(contextMenu.group.id);
        }
        setContextMenu((m) => ({ ...m, isOpen: false }));
      },
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        background: '#000000',
        color: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      <Navbar />
      <SearchBar />

      {/* Main canvas area */}
      <main
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          background: '#000000',
        }}
      >
        {/* Space particles background (CSS only) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(circle 2px at 15% 25%, rgba(255,255,255,0.4) 1px, transparent 1px),
              radial-gradient(circle 1.5px at 75% 65%, rgba(255,255,255,0.3) 1px, transparent 1px),
              radial-gradient(circle 2px at 90% 10%, rgba(255,255,255,0.35) 1px, transparent 1px),
              radial-gradient(circle 1px at 10% 85%, rgba(255,255,255,0.25) 1px, transparent 1px),
              radial-gradient(circle 2px at 45% 50%, rgba(255,255,255,0.3) 1px, transparent 1px),
              radial-gradient(circle 1.5px at 60% 30%, rgba(255,255,255,0.2) 1px, transparent 1px),
              radial-gradient(circle 1px at 30% 70%, rgba(255,255,255,0.35) 1px, transparent 1px),
              #000000
            `,
            pointerEvents: 'none',
          }}
        />

        {/* Bubble cluster / empty state */}
        <div ref={containerRef} style={{ position: 'absolute', inset: 0 }}>
          {groups.length > 0 ? (
            <BubbleCluster
              groups={groups}
              width={dimensions.width}
              height={dimensions.height}
              zoom={zoom}
              onGroupClick={(group) => selectGroup(group.id)}
              onGroupHover={(group) => setHoveredGroupId(group?.id ?? null)}
              selectedGroupId={selectedGroupId}
              onGroupRightClick={handleGroupRightClick}
            />
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Zoom controls */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <span style={{ color: '#6B7280', fontSize: '12px' }}>Zoom:</span>
          <button
            onClick={() => setZoom(zoom - 0.25)}
            style={{
              background: '#1F2937',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              borderRadius: '4px',
              padding: '4px 8px',
            }}
          >
            −
          </button>
          <span
            style={{
              color: '#B0B0B0',
              fontSize: '12px',
              minWidth: '30px',
              textAlign: 'center',
            }}
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(zoom + 0.25)}
            style={{
              background: '#1F2937',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              borderRadius: '4px',
              padding: '4px 8px',
            }}
          >
            +
          </button>
        </div>
      </main>

      {/* FAB: Create group */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-2xl shadow-lg z-40 flex items-center justify-center transition-colors"
        aria-label="Créer un groupe"
      >
        +
      </button>

      {/* Create modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nouveau groupe"
      >
        <GroupForm
          onSubmit={(values) => void handleCreateGroup(values)}
          onCancel={() => setIsCreateModalOpen(false)}
          submitLabel="Créer"
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingGroup(null);
        }}
        title="Modifier le groupe"
      >
        <GroupForm
          initialValues={
            editingGroup ? { name: editingGroup.name, color: editingGroup.color } : undefined
          }
          onSubmit={(values) => void handleEditGroup(values)}
          onCancel={() => {
            setIsEditModalOpen(false);
            setEditingGroup(null);
          }}
        />
      </Modal>

      {/* Context menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        items={contextMenuItems}
        onClose={() => setContextMenu((m) => ({ ...m, isOpen: false }))}
      />
    </div>
  );
}
