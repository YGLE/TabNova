import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { TabGroup } from '@tabnova-types/index';

// ── Types ────────────────────────────────────────────────────────────────────

interface BubbleNode extends d3.SimulationNodeDatum {
  group: TabGroup;
  radius: number;
}

interface NodePosition {
  id: string;
  x: number;
  y: number;
}

interface BubbleClusterProps {
  groups: TabGroup[];
  width: number;
  height: number;
  zoom: number;
  onGroupClick: (group: TabGroup) => void;
  onGroupHover: (group: TabGroup | null) => void;
  selectedGroupId: string | null;
  onGroupRightClick?: (group: TabGroup, position: { x: number; y: number }) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function calcRadius(group: TabGroup): number {
  return Math.max(45, Math.min(80, 35 + group.tabs.length * 8));
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BubbleCluster({
  groups,
  width,
  height,
  zoom,
  onGroupClick,
  onGroupHover,
  selectedGroupId,
  onGroupRightClick,
}: BubbleClusterProps) {
  const [positions, setPositions] = useState<NodePosition[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const nodesRef = useRef<BubbleNode[]>([]);

  // ── D3 force simulation ────────────────────────────────────────────────────

  useEffect(() => {
    const nodes: BubbleNode[] = groups.map((group) => {
      const existing = nodesRef.current.find((n) => n.group.id === group.id);
      return {
        group,
        radius: calcRadius(group),
        // Preserve prior positions to avoid jumps on group list updates
        x: existing?.x ?? (Math.random() - 0.5) * 100,
        y: existing?.y ?? (Math.random() - 0.5) * 100,
      };
    });

    nodesRef.current = nodes;

    const simulation = d3
      .forceSimulation<BubbleNode>(nodes)
      .force('center', d3.forceCenter(0, 0))
      .force(
        'collide',
        d3.forceCollide<BubbleNode>((d) => d.radius + 15),
      )
      .force('charge', d3.forceManyBody<BubbleNode>().strength(-80));

    simulation.on('end', () => {
      setPositions(
        nodes.map((n) => ({
          id: n.group.id,
          x: n.x ?? 0,
          y: n.y ?? 0,
        })),
      );
    });

    // Fallback: also capture intermediate ticks so the canvas is not blank
    // on slow machines where 'end' might take a while
    simulation.on('tick', () => {
      // no-op — we update only on end for performance
    });

    return () => {
      simulation.stop();
    };
  }, [groups]);

  // ── Render ─────────────────────────────────────────────────────────────────

  const cx = width / 2;
  const cy = height / 2;

  return (
    <svg
      width={width}
      height={height}
      style={{ display: 'block' }}
      aria-label="Bubble cluster"
    >
      <g transform={`translate(${cx}, ${cy}) scale(${zoom})`}>
        {groups.map((group, index) => {
          const pos = positions.find((p) => p.id === group.id);
          const x = pos?.x ?? 0;
          const y = pos?.y ?? 0;
          const radius = calcRadius(group);
          const isSelected = group.id === selectedGroupId;
          const isHovered = group.id === hoveredId;

          return (
            <g
              key={group.id}
              transform={`translate(${x}, ${y})`}
              style={{ cursor: 'pointer' }}
              onClick={() => onGroupClick(group)}
              onContextMenu={(e) => {
                e.preventDefault();
                onGroupRightClick?.(group, { x: e.clientX, y: e.clientY });
              }}
              onMouseEnter={() => {
                setHoveredId(group.id);
                onGroupHover(group);
              }}
              onMouseLeave={() => {
                setHoveredId(null);
                onGroupHover(null);
              }}
              data-testid={`bubble-group-${group.id}`}
            >
              {/* Main circle */}
              <circle
                r={radius}
                fill={group.color}
                fillOpacity={0.85}
                stroke={isSelected ? 'white' : 'transparent'}
                strokeWidth={isSelected ? 2 : 0}
                style={{
                  filter: isHovered
                    ? `drop-shadow(0 0 12px ${group.color})`
                    : 'none',
                  transition: 'filter 0.2s ease',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: 'center',
                  animation: `bubbleEntrance 0.8s ease-out ${index * 0.06}s both`,
                }}
              />

              {/* Group name */}
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={radius > 60 ? 13 : 11}
                fontWeight="600"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {group.name.length > 12
                  ? group.name.slice(0, 10) + '\u2026'
                  : group.name}
              </text>

              {/* Tab count badge */}
              <g transform={`translate(${radius * 0.6}, ${-radius * 0.6})`}>
                <circle r={10} fill="rgba(0,0,0,0.6)" />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={9}
                  fontWeight="bold"
                >
                  {group.tabs.length}
                </text>
              </g>

              {/* Orbiting tabs (visible on hover only) */}
              {isHovered &&
                group.tabs.slice(0, 5).map((tab, i) => {
                  const angle =
                    (i / Math.min(group.tabs.length, 5)) * 2 * Math.PI -
                    Math.PI / 2;
                  const orbitRadius = radius + 35;
                  const tx = Math.cos(angle) * orbitRadius;
                  const ty = Math.sin(angle) * orbitRadius;
                  return (
                    <g
                      key={tab.id}
                      transform={`translate(${tx}, ${ty})`}
                      style={{
                        animation: 'orbitFadeIn 0.2s ease-out both',
                      }}
                    >
                      <circle
                        r={16}
                        fill="rgba(0,0,0,0.8)"
                        stroke={group.color}
                        strokeWidth={1.5}
                      />
                      {tab.favicon ? (
                        <image
                          href={tab.favicon}
                          x={-8}
                          y={-8}
                          width={16}
                          height={16}
                        />
                      ) : (
                        <text
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={8}
                          fill="white"
                        >
                          {tab.title.slice(0, 2)}
                        </text>
                      )}
                    </g>
                  );
                })}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
