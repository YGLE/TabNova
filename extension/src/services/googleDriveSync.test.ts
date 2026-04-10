import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GoogleDriveSyncProvider, initiateGoogleAuth, revokeGoogleAuth } from './googleDriveSync';
import type { EncryptedPayload } from './syncEngine';

const MOCK_TOKEN = 'mock-access-token';

const mockPayload: EncryptedPayload = {
  ciphertext: 'abc123',
  iv: 'iv456',
  timestamp: 1234567890,
  deviceId: 'device-1',
  version: 1,
};

// Helper: build a Response-like object
function mockResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

describe('GoogleDriveSyncProvider', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('findFileId (via download/upload)', () => {
    it('returns null when no file exists (empty files list)', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({ files: [] }));

      const provider = new GoogleDriveSyncProvider(MOCK_TOKEN);
      const result = await provider.download();
      expect(result).toBeNull();
    });

    it('returns null when Drive API responds with non-ok status', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse(null, false, 401));

      const provider = new GoogleDriveSyncProvider(MOCK_TOKEN);
      const result = await provider.download();
      expect(result).toBeNull();
    });
  });

  describe('upload', () => {
    it('creates a new file (multipart) when no file exists', async () => {
      // First call: findFileId → empty list; second call: multipart POST
      vi.mocked(fetch)
        .mockResolvedValueOnce(mockResponse({ files: [] }))
        .mockResolvedValueOnce(mockResponse({ id: 'new-file-id' }));

      const provider = new GoogleDriveSyncProvider(MOCK_TOKEN);
      await provider.upload(mockPayload);

      // Second fetch call should be a multipart POST to create
      const [, createCall] = vi.mocked(fetch).mock.calls;
      expect(createCall[0]).toContain('uploadType=multipart');
      expect((createCall[1] as RequestInit).method).toBe('POST');
    });

    it('updates an existing file (PATCH) when file is found', async () => {
      // First call: findFileId → file found; second call: PATCH update
      vi.mocked(fetch)
        .mockResolvedValueOnce(mockResponse({ files: [{ id: 'existing-file-id' }] }))
        .mockResolvedValueOnce(mockResponse({}));

      const provider = new GoogleDriveSyncProvider(MOCK_TOKEN);
      await provider.upload(mockPayload);

      const [, updateCall] = vi.mocked(fetch).mock.calls;
      expect(updateCall[0]).toContain('existing-file-id');
      expect((updateCall[1] as RequestInit).method).toBe('PATCH');
    });

    it('sends authorization header with access token on all requests', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(mockResponse({ files: [] }))
        .mockResolvedValueOnce(mockResponse({ id: 'new-id' }));

      const provider = new GoogleDriveSyncProvider(MOCK_TOKEN);
      await provider.upload(mockPayload);

      for (const [, init] of vi.mocked(fetch).mock.calls) {
        expect(
          (init as RequestInit & { headers: Record<string, string> }).headers['Authorization']
        ).toBe(`Bearer ${MOCK_TOKEN}`);
      }
    });
  });

  describe('download', () => {
    it('returns null when no file exists', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({ files: [] }));

      const provider = new GoogleDriveSyncProvider(MOCK_TOKEN);
      const result = await provider.download();
      expect(result).toBeNull();
    });

    it('returns null when file download responds with non-ok status', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(mockResponse({ files: [{ id: 'file-id' }] }))
        .mockResolvedValueOnce(mockResponse(null, false, 404));

      const provider = new GoogleDriveSyncProvider(MOCK_TOKEN);
      const result = await provider.download();
      expect(result).toBeNull();
    });

    it('returns parsed EncryptedPayload when file exists', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(mockResponse({ files: [{ id: 'file-id' }] }))
        .mockResolvedValueOnce(mockResponse(mockPayload));

      const provider = new GoogleDriveSyncProvider(MOCK_TOKEN);
      const result = await provider.download();
      expect(result).toEqual(mockPayload);
    });

    it('fetches file content with alt=media query param', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce(mockResponse({ files: [{ id: 'file-id' }] }))
        .mockResolvedValueOnce(mockResponse(mockPayload));

      const provider = new GoogleDriveSyncProvider(MOCK_TOKEN);
      await provider.download();

      const [, downloadCall] = vi.mocked(fetch).mock.calls;
      expect(downloadCall[0]).toContain('alt=media');
    });
  });
});

describe('initiateGoogleAuth', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves with token from chrome.identity.getAuthToken', async () => {
    // chrome.identity.getAuthToken is already mocked in test-setup to call back 'mock-token'
    const token = await initiateGoogleAuth();
    expect(token).toBe('mock-token');
    expect(chrome.identity.getAuthToken).toHaveBeenCalledWith(
      { interactive: true },
      expect.any(Function)
    );
  });

  it('rejects when chrome.runtime.lastError is set', async () => {
    vi.spyOn(chrome.identity, 'getAuthToken').mockImplementation(
      (_options: unknown, callback: (token?: string) => void) => {
        Object.defineProperty(chrome.runtime, 'lastError', {
          value: { message: 'User cancelled' },
          configurable: true,
        });
        callback(undefined);
        // Restore after callback
        Object.defineProperty(chrome.runtime, 'lastError', {
          value: undefined,
          configurable: true,
        });
      }
    );

    await expect(initiateGoogleAuth()).rejects.toThrow('User cancelled');
  });

  it('rejects when token is empty/undefined (no lastError)', async () => {
    vi.spyOn(chrome.identity, 'getAuthToken').mockImplementation(
      (_options: unknown, callback: (token?: string) => void) => {
        callback(undefined);
      }
    );

    await expect(initiateGoogleAuth()).rejects.toThrow('Auth failed');
  });
});

describe('revokeGoogleAuth', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse({})));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls revoke endpoint and removes cached token', async () => {
    await revokeGoogleAuth('some-token');

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('some-token'));
    expect(chrome.identity.removeCachedAuthToken).toHaveBeenCalledWith(
      { token: 'some-token' },
      expect.any(Function)
    );
  });
});
