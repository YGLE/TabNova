import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

// Mock requestAnimationFrame / cancelAnimationFrame for jsdom
if (typeof globalThis.requestAnimationFrame === 'undefined') {
  let rafId = 0;
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback): number => {
    rafId += 1;
    const id = rafId;
    setTimeout(() => cb(performance.now()), 16);
    return id;
  };
  globalThis.cancelAnimationFrame = (_id: number): void => {
    // No-op: setTimeout-based rAF cannot be easily cancelled by id in tests
  };
}

// Mock Chrome APIs for tests
const chromeMock = {
  runtime: {
    onInstalled: { addListener: vi.fn() },
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    sendMessage: vi.fn(),
    lastError: undefined as chrome.runtime.LastError | undefined,
  },
  tabGroups: {
    query: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue({}),
    onUpdated: { addListener: vi.fn() },
  },
  tabs: {
    query: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    group: vi.fn().mockResolvedValue(1),
  },
  alarms: {
    onAlarm: { addListener: vi.fn() },
    create: vi.fn(),
  },
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
    },
  },
};

// Inject global chrome mock
Object.defineProperty(globalThis, 'chrome', {
  value: chromeMock,
  writable: true,
});
