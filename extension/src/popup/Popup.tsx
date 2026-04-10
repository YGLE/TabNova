import { useTabGroups } from '@hooks/useTabGroups';
import { GroupCard } from '@components/GroupCard';
import { SearchBar } from '@components/SearchBar';
import { Navbar } from '@components/Navbar';
import type { TabGroup } from '@tabnova-types/TabGroup';

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
      <div
        className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
        role="status"
        aria-label="Chargement"
      />
      <span className="text-sm">Synchronisation...</span>
    </div>
  );
}

function EmptyNoGroups({ onSync, isSyncing }: { onSync: () => void; isSyncing: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400 px-6 text-center">
      <span className="text-4xl">📂</span>
      <p className="text-sm">Aucun groupe trouvé.</p>
      <button
        onClick={onSync}
        disabled={isSyncing}
        className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50"
      >
        {isSyncing ? 'Syncing...' : 'Sync depuis Chrome'}
      </button>
    </div>
  );
}

function EmptySearch({ query }: { query: string }) {
  return (
    <div className="flex items-center justify-center h-full text-gray-400 px-6 text-center">
      <p className="text-sm">Aucun résultat pour &quot;{query}&quot;</p>
    </div>
  );
}

function Footer({
  onSync,
  onOpenDashboard,
  isSyncing,
}: {
  onSync: () => void;
  onOpenDashboard: () => void;
  isSyncing: boolean;
}) {
  return (
    <div className="p-3 border-t border-white/10 flex gap-2 flex-shrink-0">
      <button
        onClick={onSync}
        disabled={isSyncing}
        className="flex-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg py-2 transition-colors"
      >
        {isSyncing ? 'Syncing...' : 'Sync depuis Chrome'}
      </button>
      <button
        onClick={onOpenDashboard}
        className="text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-2 transition-colors"
      >
        Manager
      </button>
    </div>
  );
}

export function Popup() {
  const { groups, filteredGroups, searchQuery, syncFromChrome, isSyncing } = useTabGroups();

  const openDashboard = () => {
    chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
    window.close();
  };

  const handleOpenTabs = (group: TabGroup) => {
    chrome.runtime.sendMessage({ type: 'OPEN_GROUP_TABS', groupId: group.id });
  };

  const handleClickGroup = (group: TabGroup) => {
    chrome.runtime.sendMessage({ type: 'OPEN_GROUP_TABS', groupId: group.id });
  };

  return (
    <div className="w-[400px] h-[600px] bg-gray-950 flex flex-col">
      <Navbar onOpenDashboard={openDashboard} />
      <SearchBar />

      <div className="flex-1 overflow-y-auto">
        {isSyncing ? (
          <LoadingState />
        ) : filteredGroups.length === 0 ? (
          groups.length === 0 ? (
            <EmptyNoGroups onSync={syncFromChrome} isSyncing={isSyncing} />
          ) : (
            <EmptySearch query={searchQuery} />
          )
        ) : (
          <div>
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onOpenTabs={handleOpenTabs}
                onClick={handleClickGroup}
              />
            ))}
          </div>
        )}
      </div>

      <Footer onSync={syncFromChrome} onOpenDashboard={openDashboard} isSyncing={isSyncing} />
    </div>
  );
}
