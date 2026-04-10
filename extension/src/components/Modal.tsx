import { useEffect } from 'react';

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

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
      data-testid="modal-overlay"
    >
      <div
        className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl"
        style={{ width: sizeMap[size], maxWidth: '95vw' }}
        onClick={(e) => e.stopPropagation()}
        data-testid="modal-panel"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg">{title}</h2>
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
