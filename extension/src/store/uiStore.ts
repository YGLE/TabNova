import { create } from 'zustand';

type ViewMode = 'bubble' | 'list';

interface UIState {
  hoveredGroupId: string | null;
  searchQuery: string;
  viewMode: ViewMode;
  isLoading: boolean;
  zoom: number;

  // Actions
  setHoveredGroupId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setIsLoading: (loading: boolean) => void;
  setZoom: (zoom: number) => void;
  resetSearch: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  hoveredGroupId: null,
  searchQuery: '',
  viewMode: 'bubble',
  isLoading: false,
  zoom: 1,

  setHoveredGroupId: (id) => set({ hoveredGroupId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(3, zoom)) }),
  resetSearch: () => set({ searchQuery: '' }),
}));
