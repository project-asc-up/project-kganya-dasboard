'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    } else {
      dialog.close();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDialogElement>) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 rounded-2xl border border-[color:var(--color-border)] shadow-2xl backdrop:bg-black/50 open:animate-modal-in"
    >
      <div className="max-h-[90vh] w-full overflow-y-auto">
        <div className={`${sizeClasses[size]} flex flex-col bg-white`}>
          {/* Header */}
          <div className="border-b border-[color:var(--color-border)] px-6 py-5 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-[color:var(--color-primary-dark)]">
                {title}
              </h2>
              <IconButton
                icon={X}
                onClick={onClose}
                aria-label="Close modal"
                variant="ghost"
                rounded="full"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 py-5 sm:px-8 sm:py-6">
            {children}
          </div>
        </div>
      </div>
    </dialog>
  );
}
