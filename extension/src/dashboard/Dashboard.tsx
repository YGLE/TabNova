import { Navbar } from '@components/Navbar';
import { SearchBar } from '@components/SearchBar';
import { useGroupStore } from '@store/groupStore';
import { useUIStore } from '@store/uiStore';

export function Dashboard() {
  const groups = useGroupStore((s) => s.groups);
  const zoom = useUIStore((s) => s.zoom);
  const setZoom = useUIStore((s) => s.setZoom);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      height: '100vh',
      background: '#000000',
      color: '#FFFFFF',
      overflow: 'hidden',
    }}>
      <Navbar />
      <SearchBar />

      {/* Main canvas area */}
      <main style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: '#000000',
      }}>
        {/* Space particles background (CSS only for now) */}
        <div style={{
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
        }} />

        {/* Bubble cluster placeholder */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {groups.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6B7280' }}>
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>
                Pas de groupes trouvés.
              </p>
              <p style={{ fontSize: '14px' }}>
                Créez votre premier groupe pour commencer.
              </p>
            </div>
          ) : (
            <p style={{ color: '#6B7280', fontSize: '14px' }}>
              Bubble cluster D3.js → SPRINT 3
              <br />
              {groups.length} groupe{groups.length > 1 ? 's' : ''} chargé{groups.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Zoom controls */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}>
          <span style={{ color: '#6B7280', fontSize: '12px' }}>Zoom:</span>
          <button
            onClick={() => setZoom(zoom - 0.25)}
            style={{ background: '#1F2937', border: 'none', color: '#FFFFFF', cursor: 'pointer', borderRadius: '4px', padding: '4px 8px' }}
          >
            −
          </button>
          <span style={{ color: '#B0B0B0', fontSize: '12px', minWidth: '30px', textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(zoom + 0.25)}
            style={{ background: '#1F2937', border: 'none', color: '#FFFFFF', cursor: 'pointer', borderRadius: '4px', padding: '4px 8px' }}
          >
            +
          </button>
        </div>
      </main>
    </div>
  );
}
