import { type BuilderComponent, ComponentType, createComponent } from './types'
import { useState, useCallback } from 'react'
import { ComponentPalette } from './component-palette'
import { ComponentPreview } from './component-preview'
import { ComponentProperties } from './component-properties'
import { Button } from '@/components/ui/button'

interface PageBuilderProps {
  initialComponents?: BuilderComponent[]
  onSave?: (components: BuilderComponent[]) => void
}

export function PageBuilder({ initialComponents = [], onSave }: PageBuilderProps) {
  const [components, setComponents] = useState<BuilderComponent[]>(
    initialComponents.map((c, i) => ({ ...c, position: i }))
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleAddComponent = useCallback((type: ComponentType) => {
    const newComponent = createComponent(type)
    newComponent.position = components.length
    setComponents((prev) => [...prev, newComponent])
    setSelectedId(newComponent.id)
  }, [components.length])

  const handleUpdateConfig = useCallback((config: Record<string, unknown>) => {
    if (!selectedId) return
    setComponents((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, config } : c))
    )
  }, [selectedId])

  const handleDeleteComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id))
    if (selectedId === id) setSelectedId(null)
  }, [selectedId])

  const handleMoveComponent = useCallback((id: string, direction: 'up' | 'down') => {
    setComponents((prev) => {
      const idx = prev.findIndex((c) => c.id === id)
      if (idx === -1) return prev
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= prev.length) return prev
      const newComponents = [...prev]
      ;[newComponents[idx], newComponents[swapIdx]] = [newComponents[swapIdx], newComponents[idx]]
      return newComponents.map((c, i) => ({ ...c, position: i }))
    })
  }, [])

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    const dragIndex = Number(e.dataTransfer.getData('text/plain'))
    if (dragIndex === dropIndex) return

    setComponents((prev) => {
      const newComponents = [...prev]
      const [dragged] = newComponents.splice(dragIndex, 1)
      newComponents.splice(dropIndex, 0, dragged)
      return newComponents.map((c, i) => ({ ...c, position: i }))
    })
    setDragOverIndex(null)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDragOverIndex(null)
  }, [])

  const handleSave = useCallback(() => {
    onSave?.(components)
  }, [components, onSave])

  const selectedComponent = components.find((c) => c.id === selectedId) || null

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left: Component Palette */}
      <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto bg-zinc-50 dark:bg-zinc-950/50">
        <ComponentPalette onAddComponent={handleAddComponent} />
      </div>

      {/* Center: Canvas */}
      <div className="flex-1 overflow-y-auto bg-zinc-100 dark:bg-zinc-900">
        <div className="max-w-3xl mx-auto my-6 bg-white dark:bg-zinc-950 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 min-h-[600px]">
          {components.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-400 dark:text-zinc-600">
              <span className="text-4xl mb-3">📄</span>
              <p className="text-sm">Add components from the left panel to start building</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {components.map((component, index) => (
                <div
                  key={component.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative ${dragOverIndex === index ? 'border-t-2 border-blue-500' : ''}`}
                >
                  <ComponentPreview
                    component={component}
                    isSelected={selectedId === component.id}
                    onClick={() => setSelectedId(component.id)}
                  />
                  {selectedId === component.id && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleMoveComponent(component.id, 'up') }}
                        disabled={index === 0}
                        className="h-6 px-1 text-xs bg-white/90 dark:bg-zinc-900/90"
                      >
                        ↑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleMoveComponent(component.id, 'down') }}
                        disabled={index === components.length - 1}
                        className="h-6 px-1 text-xs bg-white/90 dark:bg-zinc-900/90"
                      >
                        ↓
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleDeleteComponent(component.id) }}
                        className="h-6 px-1 text-xs bg-white/90 dark:bg-zinc-900/90 text-red-500"
                      >
                        ✕
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Properties Panel */}
      <div className="w-72 border-l border-zinc-200 dark:border-zinc-800 overflow-y-auto bg-zinc-50 dark:bg-zinc-950/50">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Properties</h3>
          {components.length > 0 && (
            <Button variant="primary" size="sm" onClick={handleSave}>
              Save
            </Button>
          )}
        </div>
        <ComponentProperties
          component={selectedComponent}
          onUpdateConfig={handleUpdateConfig}
        />
      </div>
    </div>
  )
}
