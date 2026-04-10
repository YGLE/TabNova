import { useState, useCallback } from 'react';
import { Modal } from './Modal';
import { SyncStatusBadge } from './SyncStatusBadge';
import { useMessage } from '@hooks/useMessage';

interface SyncSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Provider = 'google-drive' | 'icloud' | 'none';

interface ProviderCard {
  id: Provider;
  label: string;
  description: string;
}

const PROVIDERS: ProviderCard[] = [
  { id: 'google-drive', label: 'Google Drive', description: 'Sync via votre compte Google' },
  { id: 'icloud', label: 'iCloud', description: 'Sync via votre compte Apple' },
  { id: 'none', label: 'Aucune', description: 'Désactiver la synchronisation' },
];

function generateRandomKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

export function SyncSettingsModal({ isOpen, onClose }: SyncSettingsModalProps) {
  const { sendMessage } = useMessage();

  const [selectedProvider, setSelectedProvider] = useState<Provider>('none');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [icloudContainer, setIcloudContainer] = useState('');
  const [icloudApiToken, setIcloudApiToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSave = useCallback(async () => {
    await sendMessage('CONFIGURE_SYNC', {
      provider: selectedProvider,
      encryptionKey,
      icloudConfig:
        selectedProvider === 'icloud'
          ? {
              containerIdentifier: icloudContainer,
              apiToken: icloudApiToken,
              environment: 'production',
            }
          : undefined,
    });
    onClose();
  }, [sendMessage, selectedProvider, encryptionKey, icloudContainer, icloudApiToken, onClose]);

  const handleConnectGoogle = useCallback(async () => {
    setIsConnecting(true);
    try {
      await sendMessage('CONFIGURE_SYNC', { provider: 'google-drive' });
      setSelectedProvider('google-drive');
    } catch {
      // toast error would go here
    } finally {
      setIsConnecting(false);
    }
  }, [sendMessage]);

  const handleGenerateKey = useCallback(() => {
    setEncryptionKey(generateRandomKey());
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Paramètres de synchronisation" size="md">
      <div className="flex flex-col gap-5">
        {/* Section 1: Provider selection */}
        <section>
          <h3 className="text-white text-sm font-semibold mb-3">Méthode de synchronisation</h3>
          <div className="flex gap-2" data-testid="provider-cards">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProvider(p.id)}
                data-testid={`provider-card-${p.id}`}
                className={`flex-1 p-3 rounded-lg border text-left transition-all ${
                  selectedProvider === p.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="text-white font-medium text-sm">{p.label}</div>
                <div className="text-gray-400 text-xs mt-1">{p.description}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Section 2: Current status */}
        <section>
          <h3 className="text-white text-sm font-semibold mb-2">Statut actuel</h3>
          <SyncStatusBadge />
        </section>

        {/* Section 3: Provider-specific config */}
        {selectedProvider === 'google-drive' && (
          <section data-testid="google-config">
            <h3 className="text-white text-sm font-semibold mb-2">Configuration</h3>
            <button
              onClick={() => void handleConnectGoogle()}
              disabled={isConnecting}
              className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm transition-colors"
            >
              {isConnecting ? 'Connexion...' : 'Connecter Google Drive'}
            </button>
          </section>
        )}

        {selectedProvider === 'icloud' && (
          <section data-testid="icloud-config">
            <h3 className="text-white text-sm font-semibold mb-2">Configuration iCloud</h3>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Container ID (ex: iCloud.com.yourapp)"
                value={icloudContainer}
                onChange={(e) => setIcloudContainer(e.target.value)}
                data-testid="icloud-container-input"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <input
                type="password"
                placeholder="API Token"
                value={icloudApiToken}
                onChange={(e) => setIcloudApiToken(e.target.value)}
                data-testid="icloud-token-input"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </section>
        )}

        {selectedProvider === 'none' && (
          <section data-testid="no-sync-info">
            <p className="text-gray-400 text-sm">
              La synchronisation est désactivée. Vos groupes sont uniquement stockés localement.
            </p>
          </section>
        )}

        {/* Section 4: Encryption key */}
        <section>
          <h3 className="text-white text-sm font-semibold mb-1">Clé de chiffrement</h3>
          <p className="text-gray-400 text-xs mb-2">
            Cette clé chiffre vos données. Partagez-la entre vos appareils.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Clé de chiffrement"
              value={encryptionKey}
              onChange={(e) => setEncryptionKey(e.target.value)}
              data-testid="encryption-key-input"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleGenerateKey}
              data-testid="generate-key-button"
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors whitespace-nowrap"
            >
              Générer une clé
            </button>
          </div>
        </section>

        {/* Footer buttons */}
        <div className="flex gap-2 justify-end pt-1 border-t border-white/10">
          <button
            onClick={onClose}
            data-testid="cancel-button"
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => void handleSave()}
            data-testid="save-button"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </Modal>
  );
}
