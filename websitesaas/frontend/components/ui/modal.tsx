import { type HTMLAttributes, forwardRef, useEffect, useRef } from 'react'

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean
  onClose: () => void
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className = '', open, onClose, children, ...props }, ref) => {
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!open) return
      const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }, [open, onClose])

    if (!open) return null

    return (
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      >
        <div
          ref={ref}
          className={`w-full max-w-lg rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-xl ${className}`}
          {...props}
        >
          {children}
        </div>
      </div>
    )
  }
)
Modal.displayName = 'Modal'

export { Modal }
