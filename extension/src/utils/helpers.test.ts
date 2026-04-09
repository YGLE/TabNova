import { describe, it, expect } from 'vitest';
import { truncateText, isGroupStale, generateId } from './helpers';

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
