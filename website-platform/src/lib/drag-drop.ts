let dragState: { type: string; payload?: Record<string, unknown> } | null = null;

export function setDragData(type: string, payload?: Record<string, unknown>) {
  dragState = { type, payload };
}

export function getDragData() {
  return dragState;
}

export function clearDragData() {
  dragState = null;
}

export function setupTouchDrag(element: HTMLElement, handlers: {
  onStart: (e: TouchEvent) => void;
  onMove: (e: TouchEvent) => void;
  onEnd: (e: TouchEvent) => void;
}) {
  element.addEventListener('touchstart', handlers.onStart, { passive: false });
  element.addEventListener('touchmove', handlers.onMove, { passive: false });
  element.addEventListener('touchend', handlers.onEnd);
}

export function cleanupTouchDrag(element: HTMLElement, handlers: {
  onStart: (e: TouchEvent) => void;
  onMove: (e: TouchEvent) => void;
  onEnd: (e: TouchEvent) => void;
}) {
  element.removeEventListener('touchstart', handlers.onStart);
  element.removeEventListener('touchmove', handlers.onMove);
  element.removeEventListener('touchend', handlers.onEnd);
}

export interface DropZoneState {
  isOver: boolean;
  position: 'top' | 'bottom' | 'inside' | null;
}

export function getDropZoneState(e: DragEvent, element: HTMLElement): DropZoneState {
  const rect = element.getBoundingClientRect();
  const y = e.clientY - rect.top;
  const relY = y / rect.height;

  if (rect.width === 0 || rect.height === 0) return { isOver: false, position: null };

  const position: DropZoneState['position'] =
    relY < 0.25 ? 'top' : relY > 0.75 ? 'bottom' : 'inside';

  return { isOver: true, position };
}
