import { memo } from 'react';
import type { TabGroup } from '@tabnova-types/TabGroup';

interface GroupCardProps {
  group: TabGroup;
  onOpenTabs: (group: TabGroup) => void;
  onClick: (group: TabGroup) => void;
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export const GroupCard = memo(function GroupCard({ group, onOpenTabs, onClick }: GroupCardProps) {
  const previewTabs = group.tabs.slice(0, 3);

  return (
    <div
      role="article"
      className="p-3 hover:bg-white/5 rounded-lg cursor-pointer border-b border-white/10"
      tabIndex={0}
      onClick={() => onClick(group)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClick(group);
      }}
    >
      {/* Header: bullet + name + count */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: group.color }}
          />
          <span className="font-medium text-white truncate">
            {group.isPinned ? '⭐ ' : ''}{group.name}
          </span>
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
          {group.tabs.length} onglet{group.tabs.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Preview tabs + open button */}
      <div className="flex items-end justify-between">
        <ul className="flex-1 min-w-0">
          {previewTabs.map((tab) => (
            <li key={tab.id} className="text-xs text-gray-400 truncate leading-5">
              {truncate(tab.title, 35)}
            </li>
          ))}
        </ul>

        <button
          className="text-xs text-blue-400 hover:text-blue-300 flex-shrink-0 ml-2 py-0.5"
          aria-label={`Ouvrir le groupe ${group.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onOpenTabs(group);
          }}
        >
          ▶ Ouvrir
        </button>
      </div>
    </div>
  );
});
