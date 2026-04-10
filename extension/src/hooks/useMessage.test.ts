import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMessage } from '@hooks/useMessage';

describe('useMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset lastError
    Object.defineProperty(chrome.runtime, 'lastError', {
      value: undefined,
      configurable: true,
    });
  });

  it('sends a message and resolves with data', async () => {
    const expectedData = [{ id: '1', name: 'Group 1' }];

    (chrome.runtime.sendMessage as ReturnType<typeof vi.fn>).mockImplementation(
      (_msg: unknown, callback: (resp: { success: boolean; data: unknown }) => void) => {
        callback({ success: true, data: expectedData });
      }
    );

    const { result } = renderHook(() => useMessage());
    const data = await result.current.sendMessage('GET_ALL_GROUPS');

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      { type: 'GET_ALL_GROUPS', payload: undefined },
      expect.any(Function)
    );
    expect(data).toEqual(expectedData);
  });

  it('rejects on chrome.runtime.lastError', async () => {
    (chrome.runtime.sendMessage as ReturnType<typeof vi.fn>).mockImplementation(
      (_msg: unknown, callback: (resp: unknown) => void) => {
        Object.defineProperty(chrome.runtime, 'lastError', {
          value: { message: 'Extension context invalidated' },
          configurable: true,
        });
        callback(undefined);
        Object.defineProperty(chrome.runtime, 'lastError', {
          value: undefined,
          configurable: true,
        });
      }
    );

    const { result } = renderHook(() => useMessage());

    await expect(result.current.sendMessage('PING')).rejects.toThrow(
      'Extension context invalidated'
    );
  });

  it('rejects on timeout', async () => {
    vi.useFakeTimers();

    (chrome.runtime.sendMessage as ReturnType<typeof vi.fn>).mockImplementation(
      // Never calls callback — simulates a hanging request
      () => undefined
    );

    const { result } = renderHook(() => useMessage());
    const promise = result.current.sendMessage('PING', undefined, { timeout: 100 });

    vi.advanceTimersByTime(200);

    await expect(promise).rejects.toThrow('Message timeout: PING');

    vi.useRealTimers();
  });

  it('rejects when response.success is false', async () => {
    (chrome.runtime.sendMessage as ReturnType<typeof vi.fn>).mockImplementation(
      (_msg: unknown, callback: (resp: { success: boolean; error: string }) => void) => {
        callback({ success: false, error: 'Chrome API unavailable' });
      }
    );

    const { result } = renderHook(() => useMessage());

    await expect(result.current.sendMessage('SYNC_FROM_CHROME')).rejects.toThrow(
      'Chrome API unavailable'
    );
  });
});
