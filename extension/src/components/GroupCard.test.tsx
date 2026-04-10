import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GroupCard } from '@components/GroupCard';
import type { TabGroup } from '@tabnova-types/TabGroup';

function makeGroup(overrides: Partial<TabGroup> = {}): TabGroup {
  return {
    id: 'group-1',
    name: 'Mon Groupe',
    color: '#EC4899',
    isPinned: false,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    tabs: [
      {
        id: 'tab-1',
        groupId: 'group-1',
        url: 'https://example.com',
        title: 'Example Tab',
        position: 0,
        isStarred: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'tab-2',
        groupId: 'group-1',
        url: 'https://google.com',
        title: 'Google',
        position: 1,
        isStarred: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    ...overrides,
  };
}

describe('GroupCard', () => {
  it('renders group name', () => {
    const group = makeGroup({ name: 'Travail' });
    render(<GroupCard group={group} onOpenTabs={vi.fn()} onClick={vi.fn()} />);
    expect(screen.getByText('Travail')).toBeInTheDocument();
  });

  it('renders tab count', () => {
    const group = makeGroup();
    render(<GroupCard group={group} onOpenTabs={vi.fn()} onClick={vi.fn()} />);
    expect(screen.getByText('2 onglets')).toBeInTheDocument();
  });

  it('renders tab count singular when 1 tab', () => {
    const group = makeGroup({
      tabs: [
        {
          id: 'tab-1',
          groupId: 'group-1',
          url: 'https://example.com',
          title: 'Seul Onglet',
          position: 0,
          isStarred: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });
    render(<GroupCard group={group} onOpenTabs={vi.fn()} onClick={vi.fn()} />);
    expect(screen.getByText('1 onglet')).toBeInTheDocument();
  });

  it('renders colored bullet', () => {
    const group = makeGroup({ color: '#EC4899' });
    const { container } = render(
      <GroupCard group={group} onOpenTabs={vi.fn()} onClick={vi.fn()} />
    );
    const bullet = container.querySelector('[style*="background-color"]');
    expect(bullet).toBeTruthy();
    expect(bullet).toHaveStyle({ backgroundColor: 'rgb(236, 72, 153)' });
  });

  it('calls onOpenTabs when Ouvrir button clicked', () => {
    const onOpenTabs = vi.fn();
    const group = makeGroup();
    render(<GroupCard group={group} onOpenTabs={onOpenTabs} onClick={vi.fn()} />);

    fireEvent.click(screen.getByText('▶ Ouvrir'));
    expect(onOpenTabs).toHaveBeenCalledTimes(1);
    expect(onOpenTabs).toHaveBeenCalledWith(group);
  });

  it('calls onClick when card clicked', () => {
    const onClick = vi.fn();
    const group = makeGroup({ name: 'ClickMe' });
    render(<GroupCard group={group} onOpenTabs={vi.fn()} onClick={onClick} />);

    fireEvent.click(screen.getByText('ClickMe'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(group);
  });

  it('does not call onClick when Ouvrir button clicked (stopPropagation)', () => {
    const onClick = vi.fn();
    const onOpenTabs = vi.fn();
    const group = makeGroup();
    render(<GroupCard group={group} onOpenTabs={onOpenTabs} onClick={onClick} />);

    fireEvent.click(screen.getByText('▶ Ouvrir'));
    expect(onOpenTabs).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders at most 3 preview tabs', () => {
    const group = makeGroup({
      tabs: [
        { id: 't1', groupId: 'g1', url: 'https://a.com', title: 'Tab A', position: 0, isStarred: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 't2', groupId: 'g1', url: 'https://b.com', title: 'Tab B', position: 1, isStarred: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 't3', groupId: 'g1', url: 'https://c.com', title: 'Tab C', position: 2, isStarred: false, createdAt: new Date(), updatedAt: new Date() },
        { id: 't4', groupId: 'g1', url: 'https://d.com', title: 'Tab D', position: 3, isStarred: false, createdAt: new Date(), updatedAt: new Date() },
      ],
    });
    render(<GroupCard group={group} onOpenTabs={vi.fn()} onClick={vi.fn()} />);
    expect(screen.getByText('Tab A')).toBeInTheDocument();
    expect(screen.getByText('Tab B')).toBeInTheDocument();
    expect(screen.getByText('Tab C')).toBeInTheDocument();
    expect(screen.queryByText('Tab D')).not.toBeInTheDocument();
  });

  it('shows pinned star when group is pinned', () => {
    const group = makeGroup({ name: 'Pinned', isPinned: true });
    render(<GroupCard group={group} onOpenTabs={vi.fn()} onClick={vi.fn()} />);
    expect(screen.getByText(/⭐/)).toBeInTheDocument();
  });
});
