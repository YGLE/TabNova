import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { iCloudSyncProvider } from './iCloudSync';
import type { iCloudConfig } from './iCloudSync';
import type { EncryptedPayload } from './syncEngine';

const mockConfig: iCloudConfig = {
  containerIdentifier: 'iCloud.com.tabnova',
  apiToken: 'test-api-token',
  environment: 'development',
};

const mockPayload: EncryptedPayload = {
  ciphertext: 'ciphertext-data',
  iv: 'iv-data',
  timestamp: 1234567890,
  deviceId: 'device-2',
  version: 1,
};

function mockResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response;
}

describe('iCloudSyncProvider', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('upload', () => {
    it('posts a record to the CloudKit records/modify endpoint', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({}));

      const provider = new iCloudSyncProvider(mockConfig);
      await provider.upload(mockPayload);

      expect(fetch).toHaveBeenCalledOnce();
      const [url, init] = vi.mocked(fetch).mock.calls[0];
      expect(url).toContain('records/modify');
      expect(url).toContain(`ckAPIToken=${mockConfig.apiToken}`);
      expect((init as RequestInit).method).toBe('POST');
    });

    it('includes the payload data in the request body fields', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({}));

      const provider = new iCloudSyncProvider(mockConfig);
      await provider.upload(mockPayload);

      const [, init] = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse((init as RequestInit).body as string) as {
        records: Array<{ fields: { data: { value: string } } }>;
      };
      const fieldValue = JSON.parse(body.records[0].fields.data.value) as EncryptedPayload;
      expect(fieldValue).toEqual(mockPayload);
    });

    it('uses the correct container URL based on config', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({}));

      const prodConfig: iCloudConfig = { ...mockConfig, environment: 'production' };
      const provider = new iCloudSyncProvider(prodConfig);
      await provider.upload(mockPayload);

      const [url] = vi.mocked(fetch).mock.calls[0];
      expect(url).toContain('/production/');
      expect(url).toContain(mockConfig.containerIdentifier);
    });

    it('throws on API error response', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse(null, false, 503));

      const provider = new iCloudSyncProvider(mockConfig);
      await expect(provider.upload(mockPayload)).rejects.toThrow('iCloud upload failed: 503');
    });
  });

  describe('download', () => {
    it('returns null when the API responds with non-ok status', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse(null, false, 404));

      const provider = new iCloudSyncProvider(mockConfig);
      const result = await provider.download();
      expect(result).toBeNull();
    });

    it('returns null when the record has no data field', async () => {
      vi.mocked(fetch).mockResolvedValue(
        mockResponse({ records: [{ fields: {} }] }),
      );

      const provider = new iCloudSyncProvider(mockConfig);
      const result = await provider.download();
      expect(result).toBeNull();
    });

    it('returns null when records array is empty', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({ records: [{}] }));

      const provider = new iCloudSyncProvider(mockConfig);
      const result = await provider.download();
      expect(result).toBeNull();
    });

    it('returns parsed EncryptedPayload when record exists', async () => {
      vi.mocked(fetch).mockResolvedValue(
        mockResponse({
          records: [
            {
              fields: {
                data: { value: JSON.stringify(mockPayload) },
              },
            },
          ],
        }),
      );

      const provider = new iCloudSyncProvider(mockConfig);
      const result = await provider.download();
      expect(result).toEqual(mockPayload);
    });

    it('posts to the records/lookup endpoint with the correct record name', async () => {
      vi.mocked(fetch).mockResolvedValue(mockResponse({ records: [{}] }));

      const provider = new iCloudSyncProvider(mockConfig);
      await provider.download();

      const [url, init] = vi.mocked(fetch).mock.calls[0];
      expect(url).toContain('records/lookup');
      expect((init as RequestInit).method).toBe('POST');
      const body = JSON.parse((init as RequestInit).body as string) as {
        records: Array<{ recordName: string }>;
      };
      expect(body.records[0].recordName).toBe('main-sync');
    });
  });
});
