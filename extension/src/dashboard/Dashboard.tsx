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

function GroupDetailPanel({ group, onClose }: { group: TabGroup; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '280px',
        background: '#111827',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 20,
        boxShadow: '-4px 0 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: group.color,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            color: '#fff',
            fontWeight: 600,
            fontSize: '15px',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {group.name}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#6B7280',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '2px 6px',
            borderRadius: '4px',
          }}
          aria-label="Fermer"
        >
          ×
        </button>
      </div>

      {/* Tab count */}
      <div style={{ padding: '8px 16px 4px', color: '#6B7280', fontSize: '12px' }}>
        {group.tabs.length} onglet{group.tabs.length !== 1 ? 's' : ''}
      </div>

      {/* Tab list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {group.tabs.length === 0 ? (
          <p
            style={{
              color: '#4B5563',
              fontSize: '13px',
              textAlign: 'center',
              padding: '24px 16px',
            }}
          >
            Aucun onglet dans ce groupe.
          </p>
        ) : (
          group.tabs.map((tab) => (
            <a
              key={tab.id}
              href={tab.url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 16px',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {/* Favicon */}
              <div style={{ width: '16px', height: '16px', flexShrink: 0 }}>
                {tab.favicon ? (
                  <img
                    src={tab.favicon}
                    width={16}
                    height={16}
                    style={{ borderRadius: '2px' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      background: group.color,
                      borderRadius: '2px',
                      opacity: 0.6,
                    }}
                  />
                )}
              </div>
              {/* Title + URL */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div
                  style={{
                    color: '#E5E7EB',
                    fontSize: '13px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.title || 'Sans titre'}
                </div>
                <div
                  style={{
                    color: '#4B5563',
                    fontSize: '11px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.url}
                </div>
              </div>
            </a>
          ))
        )}
      </div>
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

  // Charge les groupes persistés au mount (IndexedDB via background)
  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_PERSISTED_GROUPS' }, (resp) => {
      if (chrome.runtime.lastError) return;
      if (resp?.success && Array.isArray(resp.data) && resp.data.length > 0) {
        useGroupStore.getState().setGroups(resp.data);
      } else {
        // Aucun groupe persisté → sync depuis Chrome directement
        chrome.runtime.sendMessage({ type: 'SYNC_FROM_CHROME' }, (syncResp) => {
          if (chrome.runtime.lastError) return;
          if (syncResp?.success && Array.isArray(syncResp.data)) {
            useGroupStore.getState().setGroups(syncResp.data);
          }
        });
      }
    });
  }, []);

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
              onGroupClick={(group) => {
                selectGroup(group.id === selectedGroupId ? null : group.id);
              }}
              onGroupHover={(group) => setHoveredGroupId(group?.id ?? null)}
              selectedGroupId={selectedGroupId}
              onGroupRightClick={handleGroupRightClick}
            />
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Detail panel (tab list) */}
        {selectedGroupId &&
          (() => {
            const g = groups.find((gr) => gr.id === selectedGroupId);
            return g ? <GroupDetailPanel group={g} onClose={() => selectGroup(null)} /> : null;
          })()}

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
