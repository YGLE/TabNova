import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  truncateText,
  isGroupStale,
  generateId,
  debounce,
  formatRelativeTime,
  formatRelativeDate,
} from './helpers';

describe('truncateText', () => {
  it('does not truncate short text', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('truncates long text', () => {
    expect(truncateText('Hello World!', 8)).toBe('Hello...');
  });
});

describe('isGroupStale', () => {
  it('returns false if no lastAccessedAt', () => {
    expect(isGroupStale(undefined, 18)).toBe(false);
  });

  it('returns true for old group', () => {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    expect(isGroupStale(twoYearsAgo, 18)).toBe(true);
  });

  it('returns false for recent group', () => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    expect(isGroupStale(lastWeek, 18)).toBe(false);
  });
});

describe('generateId', () => {
  it('generates a valid UUID', () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, generateId));
    expect(ids.size).toBe(100);
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays the function call by the given delay', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('only fires once when called multiple times within delay', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 200);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('resets the timer on each call', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    vi.advanceTimersByTime(50);
    debouncedFn();
    vi.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('passes arguments to the wrapped function', () => {
    const fn = vi.fn<[string], void>();
    const debouncedFn = debounce(fn as unknown as (...args: unknown[]) => void, 50);
    debouncedFn('hello');
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledWith('hello');
  });
});

describe('formatRelativeTime', () => {
  it('returns "à l\'instant" for times less than 1 minute ago', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe("à l'instant");
  });

  it('returns minutes for times less than 1 hour ago', () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    expect(formatRelativeTime(thirtyMinutesAgo)).toBe('il y a 30 min');
  });

  it('returns hours for times 1 hour or more ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoHoursAgo)).toBe('il y a 2 h');
  });
});

describe('formatRelativeDate', () => {
  it('returns "Aujourd\'hui" for today', () => {
    expect(formatRelativeDate(new Date())).toBe("Aujourd'hui");
  });

  it('returns "Hier" for yesterday', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(yesterday)).toBe('Hier');
  });

  it('returns days for less than a week ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(threeDaysAgo)).toBe('Il y a 3 jours');
  });

  it('returns weeks for less than a month ago', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(twoWeeksAgo)).toBe('Il y a 2 semaines');
  });

  it('returns months for less than a year ago', () => {
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(threeMonthsAgo)).toBe('Il y a 3 mois');
  });

  it('returns years for a year or more ago', () => {
    const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(twoYearsAgo)).toBe('Il y a 2 ans');
  });
});
