import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBackgroundMessage } from '@hooks/useBackgroundMessage';

describe('useBackgroundMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers listener on mount', () => {
    const callback = vi.fn();
    renderHook(() => useBackgroundMessage(callback));

    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledTimes(1);
  });

  it('calls callback when message received', () => {
    const callback = vi.fn();
    renderHook(() => useBackgroundMessage(callback));

    // Extract the listener that was registered
    const addListenerMock = chrome.runtime.onMessage.addListener as ReturnType<typeof vi.fn>;
    const registeredListener = addListenerMock.mock.calls[0][0] as (
      message: { type: string; payload?: unknown },
      sender: chrome.runtime.MessageSender,
      sendResponse: (r: unknown) => void
    ) => void;

    const sendResponse = vi.fn();
    registeredListener(
      { type: 'CHROME_GROUP_UPDATED', payload: { id: '1' } },
      {} as chrome.runtime.MessageSender,
      sendResponse
    );

    expect(callback).toHaveBeenCalledWith('CHROME_GROUP_UPDATED', { id: '1' });
    expect(sendResponse).toHaveBeenCalledWith({ received: true });
  });

  it('removes listener on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useBackgroundMessage(callback));

    unmount();

    expect(chrome.runtime.onMessage.removeListener).toHaveBeenCalledTimes(1);
  });
});
