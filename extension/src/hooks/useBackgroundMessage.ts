import { useEffect } from 'react';

type MessageCallback = (type: string, payload: unknown) => void;

export function useBackgroundMessage(callback: MessageCallback): void {
  useEffect(() => {
    const listener = (
      message: { type: string; payload?: unknown },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: unknown) => void
    ) => {
      callback(message.type, message.payload ?? null);
      sendResponse({ received: true });
      return true; // keep channel open
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [callback]);
}
