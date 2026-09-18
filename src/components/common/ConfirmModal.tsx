import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, HelpCircle, LogOut, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  message: React.ReactNode;
  details?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  icon?: 'trash' | 'alert' | 'logout' | 'help';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  subtitle,
  message,
  details,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  icon = 'trash',
  onConfirm,
  onCancel,
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Focus cancel button on open to prevent accidental destructive actions
    const timer = setTimeout(() => {
      cancelButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const renderIcon = () => {
    switch (icon) {
      case 'trash':
        return <Trash2 className="w-5 h-5 text-red-500" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'logout':
        return <LogOut className="w-5 h-5 text-amber-400" />;
      case 'help':
      default:
        return <HelpCircle className="w-5 h-5 text-[#10B981]" />;
    }
  };

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-[#09090B]';
      case 'primary':
      default:
        return 'bg-[#10B981] hover:bg-[#059669] text-[#09090B]';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-[#121215] border border-[#27272A] p-6 shadow-2xl space-y-4 text-zinc-200 relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#18181B] border border-[#27272A] flex items-center justify-center shrink-0">
              {renderIcon()}
            </div>
            <div>
              <h3 id="modal-title" className="text-sm font-bold text-zinc-100 font-mono uppercase tracking-wider">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-[#18181B] border border-transparent hover:border-[#27272A] transition-colors"
            title="Close dialog (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Body */}
        <div className="text-xs text-zinc-400 font-sans leading-relaxed">
          {message}
        </div>

        {/* Optional Details Box */}
        {details && (
          <div className="p-3 bg-[#09090B] border border-[#27272A] space-y-1 text-xs font-mono">
            {details}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#27272A]">
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            className="px-4 py-2 bg-[#18181B] hover:bg-[#27272A] text-xs font-semibold font-mono text-zinc-300 border border-[#27272A] transition-colors focus:outline-none focus:border-zinc-400"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold font-mono transition-colors focus:outline-none ${getConfirmButtonClasses()}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
