import { type BuilderComponent, ComponentType } from './types'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'

function HeadingPreview({ config, style }: { config: Record<string, unknown>; style: Record<string, unknown> }) {
  const c = config as { content?: string; level?: string }
  const Tag = (c.level || 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  const s = style as Record<string, string>

  return (
    <div style={{ padding: s.padding || '1rem 2rem' }}>
      <Tag
        style={{
          fontSize: s.fontSize || '2rem',
          fontWeight: s.fontWeight || '700',
          textAlign: (s.textAlign as 'left' | 'center' | 'right') || 'left',
          color: s.textColor || '#0f172a',
        }}
        className="m-0"
      >
        {c.content || 'Add Your Heading'}
      </Tag>
    </div>
  )
}

function ParagraphPreview({ config, style }: { config: Record<string, unknown>; style: Record<string, unknown> }) {
  const c = config as { content?: string }
  const s = style as Record<string, string>

  return (
    <p
      style={{
        fontSize: s.fontSize || '1rem',
        fontWeight: s.fontWeight || '400',
        textAlign: (s.textAlign as 'left' | 'center' | 'right') || 'left',
        color: s.textColor || '#475569',
        padding: s.padding || '0.5rem 2rem',
        lineHeight: s.lineHeight || '1.75',
      }}
      className="m-0"
    >
      {c.content || 'Paragraph text goes here.'}
    </p>
  )
}

function TextPreview({ config, style }: { config: Record<string, unknown>; style: Record<string, unknown> }) {
  const c = config as { content?: string }
  const s = style as Record<string, string>

  return (
    <div
      style={{
        fontSize: s.fontSize || '1rem',
        fontWeight: s.fontWeight || '400',
        textAlign: (s.textAlign as 'left' | 'center' | 'right') || 'left',
        color: s.textColor || '#334155',
        padding: s.padding || '0.5rem 2rem',
      }}
    >
      {c.content || 'Edit this text to add your content.'}
    </div>
  )
}

function ImagePreview({ config, style }: { config: Record<string, unknown>; style: Record<string, unknown> }) {
  const c = config as { src?: string; alt?: string; objectFit?: string }
  const s = style as Record<string, string>

  return (
    <div style={{ padding: s.padding || '1rem 2rem' }}>
      {c.src ? (
        <img
          src={c.src}
          alt={c.alt || ''}
          style={{
            width: s.width || '100%',
            borderRadius: s.borderRadius || '0.5rem',
            objectFit: (c.objectFit as 'cover' | 'contain' | 'fill' | 'none') || 'cover',
          }}
          className="block"
        />
      ) : (
        <div
          className="flex items-center justify-center text-zinc-400 dark:text-zinc-600"
          style={{
            width: s.width || '100%',
            height: '200px',
            borderRadius: s.borderRadius || '0.5rem',
            backgroundColor: '#f1f5f9',
          }}
        >
          <div className="text-center">
            <svg className="mx-auto h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">Click to add image</span>
          </div>
        </div>
      )}
    </div>
  )
}

function ButtonPreview({ config, style }: { config: Record<string, unknown>; style: Record<string, unknown> }) {
  const c = config as { label?: string; href?: string; variant?: string }
  const s = style as Record<string, string>

  return (
    <div style={{ padding: '0.5rem 2rem' }}>
      <button
        style={{
          backgroundColor: s.backgroundColor || '#0f172a',
          color: s.textColor || '#ffffff',
          padding: s.padding || '0.75rem 1.5rem',
          borderRadius: s.borderRadius || '0.5rem',
          fontSize: s.fontSize || '1rem',
          fontWeight: s.fontWeight || '500',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {c.label || 'Click Me'}
      </button>
    </div>
  )
}

function ContainerPreview({ config, style, children }: { config: Record<string, unknown>; style: Record<string, unknown>; children?: React.ReactNode }) {
  const c = config as { minHeight?: string }
  const s = style as Record<string, string>

  return (
    <div
      style={{
        padding: s.padding || '2rem',
        backgroundColor: s.backgroundColor || '#f8fafc',
        borderRadius: s.borderRadius || '0.5rem',
        border: s.borderWidth
          ? `${s.borderWidth} ${s.borderStyle || 'solid'} ${s.borderColor || '#e2e8f0'}`
          : 'none',
        margin: s.margin || '1rem 0',
        minHeight: c.minHeight || '200px',
      }}
    >
      {children || (
        <div className="text-center text-zinc-400 dark:text-zinc-600 text-sm py-8">
          Container - drop components inside
        </div>
      )}
    </div>
  )
}

function VideoPreview({ config, style }: { config: Record<string, unknown>; style: Record<string, unknown> }) {
  const c = config as { src?: string; poster?: string; autoplay?: boolean; controls?: boolean }
  const s = style as Record<string, string>
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div style={{ padding: s.padding || '1rem 2rem' }}>
      {c.src ? (
        <video
          src={c.src}
          poster={c.poster}
          controls={c.controls !== false}
          autoPlay={c.autoplay}
          style={{
            width: s.width || '100%',
            borderRadius: s.borderRadius || '0.5rem',
          }}
          className="block"
        />
      ) : (
        <div
          className="flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          style={{
            width: s.width || '100%',
            height: '300px',
            borderRadius: s.borderRadius || '0.5rem',
            backgroundColor: '#1e293b',
          }}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mb-3">
            {isPlaying ? (
              <Pause className="h-8 w-8 text-white" />
            ) : (
              <Play className="h-8 w-8 text-white ml-1" />
            )}
          </div>
          <span className="text-white/70 text-sm">Click to add video URL</span>
        </div>
      )}
    </div>
  )
}

function DividerPreview({ config, style }: { config: Record<string, unknown>; style: Record<string, unknown> }) {
  const c = config as { style?: string }
  const s = style as Record<string, string>

  return (
    <div style={{ padding: s.padding || '1rem 2rem' }}>
      <hr
        style={{
          borderColor: s.borderColor || '#e2e8f0',
          borderWidth: `0 0 ${s.borderWidth || '1px'} 0`,
          borderStyle: (c.style || s.borderStyle || 'solid') as string,
          margin: 0,
        }}
      />
    </div>
  )
}

function SpacerPreview({ config }: { config: Record<string, unknown> }) {
  const c = config as { height?: number }

  return (
    <div
      className="border-b border-dashed border-zinc-200 dark:border-zinc-800"
      style={{ height: `${c.height || 64}px` }}
    />
  )
}

function FormPreview({ config, style }: { config: Record<string, unknown>; style: Record<string, unknown> }) {
  const c = config as { title?: string; fields?: Array<{ type?: string; label?: string; required?: boolean; placeholder?: string }>; submitLabel?: string }
  const s = style as Record<string, string>
  const fields = c.fields || []

  return (
    <div
      style={{
        padding: s.padding || '2rem',
        backgroundColor: s.backgroundColor || '#ffffff',
        borderRadius: s.borderRadius || '0.5rem',
        border: s.borderWidth
          ? `${s.borderWidth} ${s.borderStyle || 'solid'} ${s.borderColor || '#e2e8f0'}`
          : 'none',
      }}
    >
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
        {c.title || 'Contact Us'}
      </h3>
      <div className="space-y-3 max-w-md">
        {fields.map((field, i) => (
          <div key={i}>
            <label className="text-sm text-zinc-600 dark:text-zinc-400 mb-1 block">
              {field.label || 'Field'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <div
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 h-20"
                title={field.placeholder}
              />
            ) : (
              <div
                className="h-9 rounded-lg border border-zinc-300 dark:border-zinc-700"
                title={field.placeholder}
              />
            )}
          </div>
        ))}
        <button
          className="mt-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-medium"
        >
          {c.submitLabel || 'Submit'}
        </button>
      </div>
    </div>
  )
}

const componentPreviews: Record<ComponentType, React.FC<{ config: Record<string, unknown>; style: Record<string, unknown> }>> = {
  heading: HeadingPreview,
  paragraph: ParagraphPreview,
  text: TextPreview,
  image: ImagePreview,
  button: ButtonPreview,
  container: ContainerPreview,
  video: VideoPreview,
  divider: DividerPreview,
  spacer: SpacerPreview,
  form: FormPreview,
}

interface ComponentPreviewProps {
  component: BuilderComponent
  isSelected: boolean
  onClick: () => void
}

export function ComponentPreview({ component, isSelected, onClick }: ComponentPreviewProps) {
  const Preview = componentPreviews[component.type]
  if (!Preview) return null

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      tabIndex={0}
      role="button"
      aria-label={`${component.type} component`}
      className={`relative group cursor-pointer transition-all ${
        isSelected
          ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-950'
          : 'hover:ring-1 hover:ring-zinc-300 dark:hover:ring-zinc-700'
      }`}
    >
      <Preview config={component.config} style={component.style as Record<string, unknown>} />
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <span className="text-xs bg-zinc-900/80 dark:bg-zinc-100/80 text-white dark:text-zinc-900 px-2 py-0.5 rounded capitalize">
          {component.type}
        </span>
      </div>
    </div>
  )
}
