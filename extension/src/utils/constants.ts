export const DB_NAME = 'TabNova';
export const DB_VERSION = 1;

export const GROUP_COLORS = [
  '#3B82F6', // Bleu Dev
  '#EC4899', // Rose Design
  '#FBBF24', // Jaune Achats
  '#10B981', // Vert Docs
  '#8B5CF6', // Violet Archive
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#6366F1', // Indigo
] as const;

export const MAX_GROUP_NAME_LENGTH = 30;
export const MAX_UNDO_HISTORY = 5;
export const MAX_TABS_PER_GROUP = 100;
export const ARCHIVE_THRESHOLD_MONTHS = 18;
export const SYNC_DEBOUNCE_MS = 500;
export const POPUP_DEFAULT_WIDTH = 450;
export const POPUP_DEFAULT_HEIGHT = 600;
