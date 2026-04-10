/**
 * googleDriveSync.ts
 * Google Drive sync provider for TabNova.
 */

import type { EncryptedPayload, SyncProvider } from './syncEngine';

const GDRIVE_FILE_NAME = 'tabnova-sync.json';
const GDRIVE_API = 'https://www.googleapis.com/drive/v3';
const GDRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

interface DriveFilesResponse {
  files: { id: string }[];
}

export class GoogleDriveSyncProvider implements SyncProvider {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /** Finds the file ID of tabnova-sync.json in Drive, or null if not found. */
  private async findFileId(): Promise<string | null> {
    const resp = await fetch(
      `${GDRIVE_API}/files?q=name='${GDRIVE_FILE_NAME}' and trashed=false&fields=files(id)`,
      { headers: { Authorization: `Bearer ${this.accessToken}` } },
    );
    if (!resp.ok) return null;
    const data = (await resp.json()) as DriveFilesResponse;
    return data.files[0]?.id ?? null;
  }

  /** Uploads the encrypted payload, creating or updating the Drive file. */
  async upload(payload: EncryptedPayload): Promise<void> {
    const content = JSON.stringify(payload);
    const fileId = await this.findFileId();

    if (fileId) {
      // Update existing file via PATCH
      await fetch(`${GDRIVE_UPLOAD_API}/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: content,
      });
    } else {
      // Create new file via multipart upload
      const boundary = '-------TabNova';
      const body = [
        `--${boundary}`,
        'Content-Type: application/json',
        '',
        JSON.stringify({ name: GDRIVE_FILE_NAME, mimeType: 'application/json' }),
        `--${boundary}`,
        'Content-Type: application/json',
        '',
        content,
        `--${boundary}--`,
      ].join('\r\n');

      await fetch(`${GDRIVE_UPLOAD_API}/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
      });
    }
  }

  /** Downloads the encrypted payload from Drive, or null if not found. */
  async download(): Promise<EncryptedPayload | null> {
    const fileId = await this.findFileId();
    if (!fileId) return null;

    const resp = await fetch(`${GDRIVE_API}/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!resp.ok) return null;
    return resp.json() as Promise<EncryptedPayload>;
  }
}

/**
 * Initiates the OAuth2 flow via chrome.identity, returning an access token.
 * Opens a Google consent popup when interactive.
 */
export async function initiateGoogleAuth(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError ?? !token) {
        reject(new Error(chrome.runtime.lastError?.message ?? 'Auth failed'));
        return;
      }
      resolve(token as string);
    });
  });
}

/** Revokes the Google OAuth2 token and removes it from the Chrome token cache. */
export async function revokeGoogleAuth(token: string): Promise<void> {
  await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);
  chrome.identity.removeCachedAuthToken({ token }, () => {});
}
