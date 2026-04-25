import { type HTMLAttributes, forwardRef, useEffect, useRef } from 'react'

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean
  onClose: () => void
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className = '', open, onClose, children, ...props }, ref) => {
    const overlayRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)

    const setContentRef = (node: HTMLDivElement | null) => {
      contentRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }

    useEffect(() => {
      if (!open) return

      const modalNode = contentRef.current
      if (!modalNode) return

      const previousActiveElement = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

      const getFocusableElements = () => {
        const selectors = [
          'a[href]',
          'button:not([disabled])',
          'input:not([disabled])',
          'select:not([disabled])',
          'textarea:not([disabled])',
          '[tabindex]:not([tabindex="-1"])'
        ].join(',')

        return Array.from(modalNode.querySelectorAll<HTMLElement>(selectors)).filter(
          (element) => !element.hasAttribute('aria-hidden')
        )
      }

      const focusableElements = getFocusableElements()
      if (focusableElements.length > 0) {
        focusableElements[0].focus()
      } else {
        modalNode.focus()
      }

      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
          return
        }

        if (e.key !== 'Tab') return

        const elements = getFocusableElements()
        if (elements.length === 0) {
          e.preventDefault()
          modalNode.focus()
          return
        }

        const firstElement = elements[0]
        const lastElement = elements[elements.length - 1]
        const activeElement = document.activeElement

        if (e.shiftKey && activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        } else if (!e.shiftKey && activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }

      document.addEventListener('keydown', handleKeyDown)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = previousOverflow
        previousActiveElement?.focus()
      }
    }, [open, onClose])

    if (!open) return null

    return (
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      >
        <div
          ref={setContentRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
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
