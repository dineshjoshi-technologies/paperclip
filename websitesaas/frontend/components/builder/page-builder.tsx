'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Save,
  Check,
  Loader2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  X,
  Globe,
  GripVertical,
} from 'lucide-react'
import { type BuilderComponent, ComponentType, createComponent } from './types'
import { ComponentPalette } from './component-palette'
import { ComponentPreview } from './component-preview'
import { ComponentProperties } from './component-properties'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PageBuilderProps {
  initialComponents?: BuilderComponent[]
  onSave?: (components: BuilderComponent[]) => void
  websiteName?: string
  pageName?: string
}

const GRID_SNAP_THRESHOLD = 20
const AUTO_SAVE_INTERVAL = 30000

const dropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
}

function SortableComponent({
  component,
  index,
  isSelected,
  onClick,
  onDelete,
  onMove,
  totalComponents,
}: {
  component: BuilderComponent
  index: number
  isSelected: boolean
  onClick: () => void
  onDelete: () => void
  onMove: (direction: 'up' | 'down') => void
  totalComponents: number
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        isDragging && 'z-50',
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-20"
      >
        <GripVertical className="h-4 w-4 text-zinc-400" />
      </div>

      <ComponentPreview
        component={component}
        isSelected={isSelected}
        onClick={onClick}
      />

      {isSelected && (
        <div className="absolute top-2 right-2 flex gap-1 z-20">
          <button
            onClick={(e) => { e.stopPropagation(); onMove('up') }}
            disabled={index === 0}
            className="h-6 w-6 flex items-center justify-center rounded bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Move up"
          >
            <ArrowUp className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMove('down') }}
            disabled={index === totalComponents - 1}
            className="h-6 w-6 flex items-center justify-center rounded bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Move down"
          >
            <ArrowDown className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="h-6 w-6 flex items-center justify-center rounded bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label="Delete component"
          >
            <Trash2 className="h-3 w-3 text-red-500" />
          </button>
        </div>
      )}
    </div>
  )
}

type ViewportMode = 'desktop' | 'tablet' | 'mobile'

const VIEWPORT_WIDTHS: Record<ViewportMode, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
}

export function PageBuilder({ initialComponents = [], onSave, websiteName, pageName }: PageBuilderProps) {
  const [components, setComponents] = useState<BuilderComponent[]>(
    initialComponents.map((c, i) => ({ ...c, position: i, style: c.style || {} }))
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [viewport, setViewport] = useState<ViewportMode>('desktop')
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const [history, setHistory] = useState<BuilderComponent[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)
  const isHistoryPaused = useRef(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const pushToHistory = useCallback((newComponents: BuilderComponent[]) => {
    if (isHistoryPaused.current) return

    setHistory((prev) => {
      const truncated = prev.slice(0, historyIndex + 1)
      const snapshot = newComponents.map((c) => ({ ...c }))
      const newHistory = [...truncated, snapshot]
      if (newHistory.length > 50) {
        return newHistory.slice(-50)
      }
      return newHistory
    })
    setHistoryIndex((prev) => Math.min(prev + 1, 49))
  }, [historyIndex])

  const undo = useCallback(() => {
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)
    isHistoryPaused.current = true
    setComponents(history[newIndex].map((c) => ({ ...c })))
    setTimeout(() => { isHistoryPaused.current = false }, 0)
  }, [historyIndex, history])

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)
    isHistoryPaused.current = true
    setComponents(history[newIndex].map((c) => ({ ...c })))
    setTimeout(() => { isHistoryPaused.current = false }, 0)
  }, [historyIndex, history])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault()
          handleDeleteComponent(selectedId)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, selectedId])

  useEffect(() => {
    if (components.length > 0 || history.length > 1) {
      setHasUnsavedChanges(true)
    }
  }, [components])

  useEffect(() => {
    const interval = setInterval(() => {
      if (hasUnsavedChanges && components.length > 0) {
        handleAutoSave()
      }
    }, AUTO_SAVE_INTERVAL)

    return () => clearInterval(interval)
  }, [hasUnsavedChanges, components])

  const handleAutoSave = useCallback(async () => {
    if (!onSave || components.length === 0) return
    setIsSaving(true)
    try {
      await onSave(components)
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
    } catch {
    } finally {
      setIsSaving(false)
    }
  }, [components, onSave])

  const handleAddComponent = useCallback((type: ComponentType) => {
    const newComponent = createComponent(type)
    newComponent.position = components.length
    const newComponents = [...components, newComponent]
    setComponents(newComponents)
    setSelectedId(newComponent.id)
    pushToHistory(newComponents)
  }, [components, pushToHistory])

  const handleUpdateConfig = useCallback((config: Record<string, unknown>) => {
    if (!selectedId) return
    const newComponents = components.map((c) =>
      c.id === selectedId ? { ...c, config } : c
    )
    setComponents(newComponents)
  }, [selectedId, components])

  const handleUpdateStyle = useCallback((style: Record<string, unknown>) => {
    if (!selectedId) return
    const newComponents = components.map((c) =>
      c.id === selectedId ? { ...c, style: style as BuilderComponent['style'] } : c
    )
    setComponents(newComponents)
  }, [selectedId, components])

  const handleDeleteComponent = useCallback((id: string) => {
    const newComponents = components.filter((c) => c.id !== id)
    setComponents(newComponents)
    if (selectedId === id) setSelectedId(null)
    pushToHistory(newComponents)
  }, [components, selectedId, pushToHistory])

  const handleMoveComponent = useCallback((id: string, direction: 'up' | 'down') => {
    const idx = components.findIndex((c) => c.id === id)
    if (idx === -1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= components.length) return

    const newComponents = [...components]
    ;[newComponents[idx], newComponents[swapIdx]] = [newComponents[swapIdx], newComponents[idx]]
    const updated = newComponents.map((c, i) => ({ ...c, position: i }))
    setComponents(updated)
    pushToHistory(updated)
  }, [components, pushToHistory])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id !== over.id) {
      const oldIndex = components.findIndex((c) => c.id === active.id)
      const newIndex = components.findIndex((c) => c.id === over?.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newComponents = arrayMove(components, oldIndex, newIndex).map(
          (c, i) => ({ ...c, position: i })
        )
        setComponents(newComponents)
        pushToHistory(newComponents)
      }
    }
  }, [components, pushToHistory])

  const handleSave = useCallback(async () => {
    if (!onSave) return
    setIsSaving(true)
    try {
      await onSave(components)
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      pushToHistory(components)
    } catch {
    } finally {
      setIsSaving(false)
    }
  }, [components, onSave, pushToHistory])

  const selectedComponent = components.find((c) => c.id === selectedId) || null
  const activeComponent = components.find((c) => c.id === activeId) || null

  const viewportWidth = VIEWPORT_WIDTHS[viewport]

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Left: Component Palette */}
        <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex-shrink-0">
          <ComponentPalette onAddComponent={handleAddComponent} />
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <div className="flex items-center gap-2">
              {/* Undo/Redo */}
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="h-7 w-7 flex items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Undo"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="h-7 w-7 flex items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Redo"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </button>

              <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />

              {/* Viewport Toggle */}
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
                {([
                  { mode: 'desktop' as ViewportMode, icon: Monitor, label: 'Desktop' },
                  { mode: 'tablet' as ViewportMode, icon: Tablet, label: 'Tablet' },
                  { mode: 'mobile' as ViewportMode, icon: Smartphone, label: 'Mobile' },
                ]).map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewport(mode)}
                    className={cn(
                      'h-6 w-7 flex items-center justify-center rounded transition-colors',
                      viewport === mode
                        ? 'bg-white dark:bg-zinc-700 shadow-sm'
                        : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    )}
                    aria-label={`${label} view`}
                    title={label}
                  >
                    <Icon className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Save Status */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                {isSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Check className="h-3 w-3 text-green-500" />
                    <span>Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </>
                ) : hasUnsavedChanges ? (
                  <span className="text-amber-500">Unsaved changes</span>
                ) : null}
              </div>

              {/* Save Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || components.length === 0}
                className="h-7 px-2 text-xs gap-1"
              >
                <Save className="h-3 w-3" />
                Save
              </Button>

              {/* Publish Button */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowPublishModal(true)}
                disabled={components.length === 0}
                className="h-7 px-3 text-xs gap-1"
              >
                <Globe className="h-3 w-3" />
                Publish
              </Button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 overflow-y-auto bg-zinc-100 dark:bg-zinc-900 p-4">
            <div
              className={cn(
                'mx-auto bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 min-h-[600px] transition-all duration-200',
                viewport !== 'desktop' && 'border-zinc-300 dark:border-zinc-700'
              )}
              style={{
                width: viewportWidth,
                maxWidth: '100%',
              }}
            >
              {components.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-zinc-400 dark:text-zinc-600">
                  <svg className="h-12 w-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-sm font-medium">Add components from the left panel</p>
                  <p className="text-xs mt-1 text-zinc-400 dark:text-zinc-600">Drag and drop to reorder</p>
                </div>
              ) : (
                <SortableContext
                  items={components.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                    {components.map((component, index) => (
                      <SortableComponent
                        key={component.id}
                        component={component}
                        index={index}
                        isSelected={selectedId === component.id}
                        onClick={() => setSelectedId(component.id)}
                        onDelete={() => handleDeleteComponent(component.id)}
                        onMove={(dir) => handleMoveComponent(component.id, dir)}
                        totalComponents={components.length}
                      />
                    ))}
                  </div>
                </SortableContext>
              )}
            </div>
          </div>
        </div>

        {/* Right: Properties Panel */}
        <div className="w-72 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex-shrink-0">
          <ComponentProperties
            component={selectedComponent}
            onUpdateConfig={handleUpdateConfig}
            onUpdateStyle={handleUpdateStyle}
          />
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeComponent ? (
            <div className="bg-white dark:bg-zinc-950 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 opacity-80">
              <ComponentPreview
                component={activeComponent}
                isSelected={false}
                onClick={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Publish Modal */}
      {showPublishModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowPublishModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Publish page"
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Publish Page</h2>
              <button
                onClick={() => setShowPublishModal(false)}
                className="h-7 w-7 flex items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-zinc-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                <Eye className="h-5 w-5 text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {pageName || 'Untitled Page'}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {websiteName || 'Untitled Website'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Components</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{components.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Last saved</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {lastSaved ? lastSaved.toLocaleString() : 'Not saved yet'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Publishing will make your page live and accessible to visitors. You can unpublish at any time.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPublishModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  await handleSave()
                  setShowPublishModal(false)
                }}
              >
                <Globe className="h-3.5 w-3.5 mr-1" />
                Publish Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
