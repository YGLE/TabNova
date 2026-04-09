import { Navbar } from '@components/Navbar';
import { SearchBar } from '@components/SearchBar';
import { useGroupStore } from '@store/groupStore';
import { useUIStore } from '@store/uiStore';

export function Popup() {
  const groups = useGroupStore((s) => s.groups);
  const isLoading = useUIStore((s) => s.isLoading);
  const searchQuery = useUIStore((s) => s.searchQuery);

  const handleOpenDashboard = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    window.close();
  };

  // Filter groups by search
  const filteredGroups = groups.filter((g) =>
    !searchQuery ||
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.tabs.some(
      (t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.url.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '450px',
      minHeight: '600px',
      background: '#000000',
      color: '#FFFFFF',
    }}>
      <Navbar onOpenDashboard={handleOpenDashboard} />
      <SearchBar />

      <main style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {isLoading ? (
          <p style={{ color: '#6B7280', textAlign: 'center', padding: '40px 0' }}>
            Chargement...
          </p>
        ) : filteredGroups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: '#6B7280' }}>
            {groups.length === 0 ? (
              <>
                <p style={{ marginBottom: '12px', fontSize: '16px' }}>
                  Pas de groupes trouvés.
                </p>
                <button
                  style={{
                    color: '#3B82F6',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    textDecoration: 'underline',
                  }}
                  onClick={() => {/* TODO SPRINT 2 */}}
                >
                  Créer un groupe ici ?
                </button>
              </>
            ) : (
              <p>Aucun résultat pour &quot;{searchQuery}&quot;</p>
            )}
          </div>
        ) : (
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredGroups.map((group) => (
              <li
                key={group.id}
                style={{
                  padding: '12px',
                  background: '#111827',
                  border: `1px solid ${group.color}33`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 200ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = group.color;
                  e.currentTarget.style.background = '#1F2937';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${group.color}33`;
                  e.currentTarget.style.background = '#111827';
                }}
                onClick={() => {/* TODO SPRINT 2: open group tabs */}}
              >
                {/* Color indicator */}
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: group.color,
                  flexShrink: 0,
                }} />

                {/* Group info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: group.color }}>
                    {group.isPinned ? '⭐ ' : ''}{group.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    {group.tabs.length} onglet{group.tabs.length > 1 ? 's' : ''}
                  </div>
                </div>

                {/* Badge */}
                <span style={{
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: '12px',
                }}>
                  {group.tabs.length}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer style={{
        padding: '12px 16px',
        borderTop: '1px solid #1F2937',
        display: 'flex',
        gap: '8px',
        flexShrink: 0,
      }}>
        <button
          style={{
            flex: 1,
            padding: '10px 20px',
            background: '#3B82F6',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            height: '40px',
            transition: 'all 200ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#2563EB'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#3B82F6'; }}
          onClick={() => {/* TODO SPRINT 4: Create group */}}
        >
          + Créer groupe
        </button>
        <button
          style={{
            padding: '10px 16px',
            background: 'transparent',
            color: '#B0B0B0',
            border: '1px solid #1F2937',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
            height: '40px',
            transition: 'all 200ms',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1F2937';
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#B0B0B0';
          }}
          onClick={handleOpenDashboard}
        >
          Ouvrir →
        </button>
      </footer>
    </div>
  );
}
