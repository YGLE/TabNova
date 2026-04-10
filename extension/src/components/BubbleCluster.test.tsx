import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BubbleCluster } from '@components/BubbleCluster';
import type { TabGroup } from '@tabnova-types/TabGroup';

// ── Mock D3 to avoid jsdom incompatibilities ─────────────────────────────────

vi.mock('d3', () => ({
  forceSimulation: vi.fn(() => ({
    force: vi.fn().mockReturnThis(),
    on: vi.fn().mockImplementation(function (
      this: Record<string, unknown>,
      event: string,
      cb: () => void
    ) {
      // Immediately invoke the 'end' callback so positions are set
      if (event === 'end') cb();
      return this;
    }),
    nodes: vi.fn().mockReturnThis(),
    stop: vi.fn(),
  })),
  forceCenter: vi.fn(),
  forceCollide: vi.fn(() => ({ radius: vi.fn().mockReturnThis() })),
  forceManyBody: vi.fn(() => ({ strength: vi.fn().mockReturnThis() })),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeGroup(overrides: Partial<TabGroup> = {}): TabGroup {
  return {
    id: '1',
    name: 'Work',
    color: '#3B82F6',
    isPinned: false,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    tabs: [
      {
        id: 't1',
        groupId: '1',
        url: 'https://example.com',
        title: 'Example',
        position: 0,
        isStarred: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    ...overrides,
  };
}

const mockGroups: TabGroup[] = [
  makeGroup({ id: '1', name: 'Work', color: '#3B82F6' }),
  makeGroup({ id: '2', name: 'Personal', color: '#EC4899', tabs: [] }),
];

const defaultProps = {
  groups: mockGroups,
  width: 800,
  height: 600,
  zoom: 1,
  onGroupClick: vi.fn(),
  onGroupHover: vi.fn(),
  selectedGroupId: null,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('BubbleCluster', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders an SVG element', () => {
    const { container } = render(<BubbleCluster {...defaultProps} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg).toHaveAttribute('width', '800');
    expect(svg).toHaveAttribute('height', '600');
  });

  it('renders correct number of group bubbles', () => {
    const { container } = render(<BubbleCluster {...defaultProps} />);
    const bubbleGroups = container.querySelectorAll('[data-testid^="bubble-group-"]');
    expect(bubbleGroups).toHaveLength(mockGroups.length);
  });

  it('calls onGroupClick when bubble clicked', () => {
    const onGroupClick = vi.fn();
    const { container } = render(<BubbleCluster {...defaultProps} onGroupClick={onGroupClick} />);
    const firstBubble = container.querySelector('[data-testid="bubble-group-1"]');
    expect(firstBubble).toBeTruthy();
    fireEvent.click(firstBubble!);
    expect(onGroupClick).toHaveBeenCalledTimes(1);
    expect(onGroupClick).toHaveBeenCalledWith(mockGroups[0]);
  });

  it('calls onGroupHover on mouse enter', () => {
    const onGroupHover = vi.fn();
    const { container } = render(<BubbleCluster {...defaultProps} onGroupHover={onGroupHover} />);
    const firstBubble = container.querySelector('[data-testid="bubble-group-1"]');
    expect(firstBubble).toBeTruthy();
    fireEvent.mouseEnter(firstBubble!);
    expect(onGroupHover).toHaveBeenCalledTimes(1);
    expect(onGroupHover).toHaveBeenCalledWith(mockGroups[0]);
  });

  it('calls onGroupHover with null on mouse leave', () => {
    const onGroupHover = vi.fn();
    const { container } = render(<BubbleCluster {...defaultProps} onGroupHover={onGroupHover} />);
    const firstBubble = container.querySelector('[data-testid="bubble-group-1"]');
    expect(firstBubble).toBeTruthy();
    fireEvent.mouseLeave(firstBubble!);
    expect(onGroupHover).toHaveBeenCalledTimes(1);
    expect(onGroupHover).toHaveBeenCalledWith(null);
  });

  it('shows tab count badge', () => {
    render(<BubbleCluster {...defaultProps} />);
    // Work group has 1 tab, Personal has 0
    const badges = screen.getAllByText(/^\d+$/);
    const badgeValues = badges.map((el) => el.textContent);
    expect(badgeValues).toContain('1'); // Work: 1 tab
    expect(badgeValues).toContain('0'); // Personal: 0 tabs
  });

  it('applies selected styling when selectedGroupId matches', () => {
    const { container } = render(<BubbleCluster {...defaultProps} selectedGroupId="1" />);
    // The selected bubble's circle should have white stroke
    const firstBubble = container.querySelector('[data-testid="bubble-group-1"]');
    const circle = firstBubble?.querySelector('circle');
    expect(circle).toHaveAttribute('stroke', 'white');
    expect(circle).toHaveAttribute('stroke-width', '2');
  });

  it('renders group names truncated when over 12 chars', () => {
    const longNameGroup = makeGroup({
      id: '3',
      name: 'A Very Long Group Name',
    });
    render(<BubbleCluster {...defaultProps} groups={[longNameGroup]} />);
    // Should be truncated to 10 chars + ellipsis
    expect(screen.getByText('A Very Lon\u2026')).toBeInTheDocument();
  });

  it('renders group name as-is when 12 chars or fewer', () => {
    const shortNameGroup = makeGroup({ id: '4', name: 'Work' });
    render(<BubbleCluster {...defaultProps} groups={[shortNameGroup]} />);
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('renders nothing when groups array is empty', () => {
    const { container } = render(<BubbleCluster {...defaultProps} groups={[]} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    const bubbleGroups = container.querySelectorAll('[data-testid^="bubble-group-"]');
    expect(bubbleGroups).toHaveLength(0);
  });
});
