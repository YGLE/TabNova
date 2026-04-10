import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncSettingsModal } from '@components/SyncSettingsModal';

// Mock hooks used by SyncSettingsModal and its children
vi.mock('@hooks/useMessage', () => ({
  useMessage: () => ({ sendMessage: vi.fn().mockResolvedValue(undefined) }),
}));

vi.mock('@hooks/useOnlineStatus', () => ({
  useOnlineStatus: vi.fn(() => true),
}));

describe('SyncSettingsModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    render(<SyncSettingsModal isOpen={false} onClose={onClose} />);
    expect(screen.queryByTestId('modal-panel')).not.toBeInTheDocument();
  });

  it('shows provider selection cards', () => {
    render(<SyncSettingsModal isOpen={true} onClose={onClose} />);

    expect(screen.getByTestId('provider-card-google-drive')).toBeInTheDocument();
    expect(screen.getByTestId('provider-card-icloud')).toBeInTheDocument();
    expect(screen.getByTestId('provider-card-none')).toBeInTheDocument();
  });

  it('highlights selected provider', () => {
    render(<SyncSettingsModal isOpen={true} onClose={onClose} />);

    // Default selected is 'none'
    const noneCard = screen.getByTestId('provider-card-none');
    expect(noneCard.className).toContain('border-blue-500');

    // Click Google Drive
    fireEvent.click(screen.getByTestId('provider-card-google-drive'));
    const googleCard = screen.getByTestId('provider-card-google-drive');
    expect(googleCard.className).toContain('border-blue-500');
    expect(noneCard.className).not.toContain('border-blue-500');
  });

  it('shows icloud config fields when icloud selected', () => {
    render(<SyncSettingsModal isOpen={true} onClose={onClose} />);

    // iCloud fields should not be visible initially
    expect(screen.queryByTestId('icloud-config')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('provider-card-icloud'));

    expect(screen.getByTestId('icloud-config')).toBeInTheDocument();
    expect(screen.getByTestId('icloud-container-input')).toBeInTheDocument();
    expect(screen.getByTestId('icloud-token-input')).toBeInTheDocument();
  });

  it('shows encryption key input', () => {
    render(<SyncSettingsModal isOpen={true} onClose={onClose} />);

    expect(screen.getByTestId('encryption-key-input')).toBeInTheDocument();
    expect(screen.getByTestId('generate-key-button')).toBeInTheDocument();
  });

  it('calls onClose when cancelled', () => {
    render(<SyncSettingsModal isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByTestId('cancel-button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
