import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap: Record<NonNullable<ModalProps['size']>, string> = {
  sm: '400px',
  md: '500px',
  lg: '640px',
};

const MODAL_TITLE_ID = 'modal-title';

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Focus trap: focus first focusable element on open, restore focus on close
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement;
    const panel = panelRef.current;
    if (panel) {
      const focusable = panel.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }
    return () => previousFocus?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
      data-testid="modal-overlay"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={MODAL_TITLE_ID}
        className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl"
        style={{ width: sizeMap[size], maxWidth: '95vw' }}
        onClick={(e) => e.stopPropagation()}
        data-testid="modal-panel"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 id={MODAL_TITLE_ID} className="text-white font-semibold text-lg">{title}</h2>
          <button
            className="text-gray-400 hover:text-white transition-colors"
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
