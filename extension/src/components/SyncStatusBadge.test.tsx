import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncStatusBadge } from '@components/SyncStatusBadge';
import { useSyncStore } from '@store/syncStore';

vi.mock('@hooks/useOnlineStatus', () => ({
  useOnlineStatus: vi.fn(() => true),
}));

import { useOnlineStatus } from '@hooks/useOnlineStatus';

describe('SyncStatusBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSyncStore.setState({ syncStatus: 'idle', lastSyncAt: null, error: null });
    vi.mocked(useOnlineStatus).mockReturnValue(true);
  });

  it('shows offline state when not online', () => {
    vi.mocked(useOnlineStatus).mockReturnValue(false);
    render(<SyncStatusBadge />);

    expect(screen.getByText('Hors ligne')).toBeInTheDocument();
    const dot = screen.getByTestId('sync-dot');
    expect(dot.className).toContain('bg-gray-500');
  });

  it('shows syncing state with pulse', () => {
    vi.mocked(useOnlineStatus).mockReturnValue(true);
    useSyncStore.setState({ syncStatus: 'syncing' });
    render(<SyncStatusBadge />);

    expect(screen.getByText('Synchronisation...')).toBeInTheDocument();
    const dot = screen.getByTestId('sync-dot');
    expect(dot.className).toContain('animate-pulse');
    expect(dot.className).toContain('bg-yellow-400');
  });

  it('shows idle state with last sync time', () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - 5);
    useSyncStore.setState({ syncStatus: 'idle', lastSyncAt: date });
    render(<SyncStatusBadge />);

    expect(screen.getByText(/il y a 5 min/i)).toBeInTheDocument();
  });

  it('shows error state in red', () => {
    useSyncStore.setState({ syncStatus: 'error' });
    render(<SyncStatusBadge />);

    expect(screen.getByText('Erreur de sync')).toBeInTheDocument();
    const dot = screen.getByTestId('sync-dot');
    expect(dot.className).toContain('bg-red-500');
  });

  it('renders compact version', () => {
    render(<SyncStatusBadge compact />);

    expect(screen.getByTestId('sync-status-badge-compact')).toBeInTheDocument();
    // In compact mode with isOnline=true, shows "Sync"
    expect(screen.getByText('Sync')).toBeInTheDocument();
  });
});
