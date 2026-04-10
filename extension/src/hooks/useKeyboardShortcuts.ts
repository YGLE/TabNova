import { useEffect } from 'react';
import { useUIStore } from '@store/uiStore';

export function useKeyboardShortcuts() {
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const resetSearch = useUIStore((s) => s.resetSearch);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+K / Cmd+K → focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Dispatch custom event for SearchBar to pick up
        window.dispatchEvent(new CustomEvent('tabnova:focus-search'));
      }
      // Escape → clear search
      if (e.key === 'Escape') {
        resetSearch();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSearchQuery, resetSearch]);
}
