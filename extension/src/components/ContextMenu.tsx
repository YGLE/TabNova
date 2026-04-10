import { useEffect, useRef } from 'react';

export interface ContextMenuItem {
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
}

const MENU_WIDTH = 160;
const ITEM_HEIGHT = 36;

export function ContextMenu({ isOpen, position, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Adjust position to stay within viewport
  let x = position.x;
  let y = position.y;
  if (x + MENU_WIDTH > window.innerWidth) x = position.x - MENU_WIDTH;
  if (y + items.length * ITEM_HEIGHT > window.innerHeight) {
    y = position.y - items.length * ITEM_HEIGHT;
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-gray-900 border border-white/10 rounded-lg shadow-xl py-1"
      style={{ left: x, top: y, minWidth: `${MENU_WIDTH}px` }}
      data-testid="context-menu"
    >
      {items.map((item, index) => (
        <button
          key={index}
          className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 flex items-center gap-2"
          onClick={() => {
            item.onClick();
            onClose();
          }}
        >
          {item.icon && <span>{item.icon}</span>}
          <span className={item.variant === 'danger' ? 'text-red-400' : 'text-white'}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}
