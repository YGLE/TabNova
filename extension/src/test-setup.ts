import '@testing-library/jest-dom';

// Mock Chrome APIs for tests
const chromeMock = {
  runtime: {
    onInstalled: { addListener: vi.fn() },
    onMessage: { addListener: vi.fn() },
    sendMessage: vi.fn(),
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
