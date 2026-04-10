import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleMessage } from './messageHandler';

describe('messageHandler', () => {
  let sendResponse: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sendResponse = vi.fn();
  });

  it('responds to PING', () => {
    handleMessage({ type: 'PING' }, {} as chrome.runtime.MessageSender, sendResponse);
    expect(sendResponse).toHaveBeenCalledWith({ success: true, data: 'pong' });
  });

  it('handles unknown message type', () => {
    handleMessage(
      { type: 'UNKNOWN' as unknown as 'PING' },
      {} as chrome.runtime.MessageSender,
      sendResponse
    );
    expect(sendResponse).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('handles GET_ALL_GROUPS', async () => {
    // Chrome mock is set up in test-setup.ts
    handleMessage({ type: 'GET_ALL_GROUPS' }, {} as chrome.runtime.MessageSender, sendResponse);
    // Wait for async response
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(sendResponse).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});
