"use client";

import { ReactNode } from "react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

// Shared modal shell for the admin portal — matches the overlay/header style used
// by the clinician modals (EditProgramModal).
export default function AdminModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-lg",
}: AdminModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} flex flex-col max-h-[90%] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-5">
          <h2 className="text-xl font-extrabold text-left text-[#12606A] tracking-tight">
            {title}
          </h2>
        </div>
        <div className="h-px w-full bg-[#12606A]" />

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 min-h-0">{children}</div>

        {/* Actions */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 flex-shrink-0 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
