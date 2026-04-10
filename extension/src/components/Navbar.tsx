import { useState } from 'react';
import { SyncStatusBadge } from './SyncStatusBadge';
import { SyncSettingsModal } from './SyncSettingsModal';

interface NavbarProps {
  onOpenDashboard?: () => void;
  onOpenSettings?: () => void;
}

export function Navbar({ onOpenDashboard, onOpenSettings }: NavbarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <SyncSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #1F2937',
        height: 'var(--navbar-height)',
        background: 'var(--color-black)',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <h1 style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--color-white)',
          letterSpacing: '0.5px',
          userSelect: 'none',
        }}>
          ✨ TabNova
        </h1>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Sync status badge */}
          <SyncStatusBadge compact />

          {/* Sync settings button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Paramètres de synchronisation"
            data-testid="sync-settings-button"
            style={{
              background: 'none',
              border: 'none',
              color: '#B0B0B0',
              fontSize: '14px',
              cursor: 'pointer',
              padding: '4px 6px',
              transition: 'color 200ms',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#B0B0B0'; }}
          >
            ⚙ Sync
          </button>

          {/* Open Manager */}
          {onOpenDashboard && (
            <button
              onClick={onOpenDashboard}
              title="Ouvrir le gestionnaire"
              style={{
                background: 'none',
                border: 'none',
                color: '#B0B0B0',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px',
                transition: 'color 200ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#B0B0B0'; }}
            >
              ↗️
            </button>
          )}

          {/* Settings */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              title="Paramètres"
              style={{
                background: 'none',
                border: 'none',
                color: '#B0B0B0',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px',
                transition: 'color 200ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#B0B0B0'; }}
            >
              ⚙️
            </button>
          )}
        </div>
      </header>
    </>
  );
}
