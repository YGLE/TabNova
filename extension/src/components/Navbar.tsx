import { useSyncStore } from '@store/syncStore';

interface NavbarProps {
  onOpenDashboard?: () => void;
  onOpenSettings?: () => void;
}

export function Navbar({ onOpenDashboard, onOpenSettings }: NavbarProps) {
  const syncStatus = useSyncStore((s) => s.syncStatus);

  const syncIcon = {
    idle:    '✓',
    syncing: '⏳',
    success: '✓',
    error:   '⚠️',
  }[syncStatus];

  const syncColor = {
    idle:    '#B0B0B0',
    syncing: '#FBBF24',
    success: '#10B981',
    error:   '#EF4444',
  }[syncStatus];

  return (
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
        {/* Sync indicator */}
        <span
          title={`Sync: ${syncStatus}`}
          style={{
            fontSize: '12px',
            color: syncColor,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '12px',
            border: `1px solid ${syncColor}`,
            opacity: 0.8,
          }}
        >
          {syncIcon} {syncStatus === 'syncing' ? 'Sync...' : 'Synced'}
        </span>

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
            onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#B0B0B0'}
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
            onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#B0B0B0'}
          >
            ⚙️
          </button>
        )}
      </div>
    </header>
  );
}
