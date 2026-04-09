import { describe, it, expect } from 'vitest';
import { TabValidator, TabGroupValidator } from './validators';

describe('TabValidator', () => {
  it('validates a correct tab', () => {
    const tab = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      groupId: '123e4567-e89b-12d3-a456-426614174001',
      url: 'https://github.com',
      title: 'GitHub',
      position: 0,
      isStarred: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(() => TabValidator.parse(tab)).not.toThrow();
  });

  it('rejects an invalid URL', () => {
    const tab = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      groupId: '123e4567-e89b-12d3-a456-426614174001',
      url: 'not-a-url',
      title: 'Bad URL',
      position: 0,
      isStarred: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(() => TabValidator.parse(tab)).toThrow();
  });
});

describe('TabGroupValidator', () => {
  it('validates a correct group', () => {
    const group = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Dev',
      color: '#3B82F6',
      isPinned: false,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      tabs: [],
    };
    expect(() => TabGroupValidator.parse(group)).not.toThrow();
  });

  it('rejects a group name that is too long', () => {
    const group = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'A'.repeat(31),
      color: '#3B82F6',
      isPinned: false,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      tabs: [],
    };
    expect(() => TabGroupValidator.parse(group)).toThrow();
  });

  it('rejects an invalid hex color', () => {
    const group = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Dev',
      color: 'not-a-color',
      isPinned: false,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      tabs: [],
    };
    expect(() => TabGroupValidator.parse(group)).toThrow();
  });
});
