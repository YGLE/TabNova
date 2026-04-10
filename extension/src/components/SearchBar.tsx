import React, { useCallback } from 'react';
import { useUIStore } from '@store/uiStore';

interface SearchBarProps {
  placeholder?: string;
}

export function SearchBar({ placeholder = '🔍 Chercher un onglet ou groupe...' }: SearchBarProps) {
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const resetSearch = useUIStore((s) => s.resetSearch);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        resetSearch();
        e.currentTarget.blur();
      }
    },
    [resetSearch]
  );

  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #1F2937',
        flexShrink: 0,
      }}
    >
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '10px 36px 10px 12px',
            background: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '6px',
            color: '#FFFFFF',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 200ms',
            fontFamily: 'var(--font-sans)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#3B82F6';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#374151';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {/* Clear button */}
        {searchQuery && (
          <button
            onClick={resetSearch}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#6B7280',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '2px',
            }}
            title="Effacer la recherche"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
