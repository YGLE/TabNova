export interface UIState {
  selectedGroupId: string | null;
  hoveredGroupId: string | null;
  searchQuery: string;
  viewMode: 'bubble' | 'list';
  isLoading: boolean;
  error: string | null;
}
