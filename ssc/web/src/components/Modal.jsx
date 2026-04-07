import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { X } from "lucide-react";

export function Modal({
  isOpen,
  onClose,
  title,
  description = null,
  children,
  footer = null,
  size = "md",
  className = "",
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) {
  const handleKeyDown = useCallback(
    (e) => {
      if (closeOnEscape && e.key === "Escape") {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-[95vw]",
  };

  return (
    <div className="fixed inset-0 z-modal" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity",
          "animate-fadeIn"
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal */}
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className={clsx(
              "relative w-full bg-card border border-border rounded-lg shadow-xl",
              "animate-slideUp",
              sizeClasses[size],
              className
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-4 border-b border-border">
              <div className="flex-1">
                {title && (
                  <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                )}
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="ml-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="flex justify-end gap-2 p-4 border-t border-border">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
