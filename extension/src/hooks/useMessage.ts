import { useCallback } from 'react';

interface SendMessageOptions {
  timeout?: number; // ms, default: 5000
}

interface ChromeResponse {
  success?: boolean;
  data?: unknown;
  error?: string;
}

export function useMessage() {
  const sendMessage = useCallback(
    async <T = unknown>(
      type: string,
      payload?: unknown,
      options: SendMessageOptions = {}
    ): Promise<T> => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`Message timeout: ${type}`));
        }, options.timeout ?? 5000);

        chrome.runtime.sendMessage({ type, payload }, (response: ChromeResponse) => {
          clearTimeout(timer);
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          if (response?.success === false) {
            reject(new Error(response.error ?? 'Unknown error'));
            return;
          }
          resolve(response?.data as T);
        });
      });
    },
    []
  );

  return { sendMessage };
}
