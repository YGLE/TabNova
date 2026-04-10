/**
 * iCloudSync.ts
 * iCloud CloudKit Web Services sync provider for TabNova.
 */

import type { EncryptedPayload, SyncProvider } from './syncEngine';

const ICLOUD_RECORD_TYPE = 'TabNovaSync';
const ICLOUD_RECORD_NAME = 'main-sync';

export interface iCloudConfig {
  containerIdentifier: string; // e.g. 'iCloud.com.tabnova'
  apiToken: string; // CloudKit Web Services API token
  environment: 'development' | 'production';
}

interface CloudKitField {
  value: string;
}

interface CloudKitRecord {
  fields?: {
    data?: CloudKitField;
  };
}

interface CloudKitLookupResponse {
  records: CloudKitRecord[];
}

interface CloudKitModifyBody {
  records: Array<{
    recordType: string;
    recordName: string;
    fields: {
      data: { value: string };
    };
  }>;
}

export class iCloudSyncProvider implements SyncProvider {
  private config: iCloudConfig;
  private baseUrl: string;

  constructor(config: iCloudConfig) {
    this.config = config;
    const env = config.environment === 'production' ? 'production' : 'development';
    this.baseUrl = `https://api.apple-cloudkit.com/database/1/${config.containerIdentifier}/${env}/public`;
  }

  /** Uploads the encrypted payload to iCloud CloudKit. */
  async upload(payload: EncryptedPayload): Promise<void> {
    const body: CloudKitModifyBody = {
      records: [
        {
          recordType: ICLOUD_RECORD_TYPE,
          recordName: ICLOUD_RECORD_NAME,
          fields: {
            data: { value: JSON.stringify(payload) },
          },
        },
      ],
    };

    const resp = await fetch(`${this.baseUrl}/records/modify?ckAPIToken=${this.config.apiToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      throw new Error(`iCloud upload failed: ${resp.status}`);
    }
  }

  /** Downloads the encrypted payload from iCloud CloudKit, or null if not found. */
  async download(): Promise<EncryptedPayload | null> {
    const resp = await fetch(`${this.baseUrl}/records/lookup?ckAPIToken=${this.config.apiToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records: [{ recordName: ICLOUD_RECORD_NAME }],
      }),
    });

    if (!resp.ok) return null;

    const data = (await resp.json()) as CloudKitLookupResponse;
    const record = data.records[0];
    if (!record?.fields?.data?.value) return null;

    return JSON.parse(record.fields.data.value) as EncryptedPayload;
  }
}
