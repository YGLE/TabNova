import { useSyncStore } from '@store/syncStore';
import { useOnlineStatus } from '@hooks/useOnlineStatus';
import { formatRelativeTime } from '@utils/helpers';

interface SyncStatusBadgeProps {
  compact?: boolean;
}

export function SyncStatusBadge({ compact = false }: SyncStatusBadgeProps) {
  const syncStatus = useSyncStore((s) => s.syncStatus);
  const lastSyncAt = useSyncStore((s) => s.lastSyncAt);
  const isOnline = useOnlineStatus();

  const colorClass = !isOnline
    ? 'bg-gray-500'
    : syncStatus === 'syncing'
      ? 'bg-yellow-400'
      : syncStatus === 'error'
        ? 'bg-red-500'
        : 'bg-emerald-500';

  const isPulsing = isOnline && syncStatus === 'syncing';

  if (compact) {
    return (
      <div className="flex items-center gap-1.5" data-testid="sync-status-badge-compact">
        <span
          className={`w-2 h-2 rounded-full ${colorClass} ${isPulsing ? 'animate-pulse' : ''}`}
          data-testid="sync-dot"
        />
        <span className="text-xs text-gray-400">
          {!isOnline ? 'Offline' : 'Sync'}
        </span>
      </div>
    );
  }

  let statusText: string;
  if (!isOnline) {
    statusText = 'Hors ligne';
  } else if (syncStatus === 'syncing') {
    statusText = 'Synchronisation...';
  } else if (syncStatus === 'error') {
    statusText = 'Erreur de sync';
  } else if (lastSyncAt) {
    statusText = `Sync ${formatRelativeTime(lastSyncAt)}`;
  } else {
    statusText = 'Non synchronisé';
  }

  return (
    <div
      className="flex items-center gap-2 text-sm"
      data-testid="sync-status-badge"
    >
      <span
        className={`w-2 h-2 rounded-full ${colorClass} ${isPulsing ? 'animate-pulse' : ''}`}
        data-testid="sync-dot"
      />
      <span className="text-gray-400">{statusText}</span>
    </div>
  );
}
