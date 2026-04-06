import type { BuilderStyle } from '@/components/builder/types'

function applyStyle(base: React.CSSProperties = {}, style?: BuilderStyle): React.CSSProperties {
  if (!style) return base
  const s: React.CSSProperties = { ...base }

  if (style.backgroundColor) s.backgroundColor = style.backgroundColor
  if (style.textColor) s.color = style.textColor
  if (style.fontSize) s.fontSize = style.fontSize
  if (style.fontWeight) s.fontWeight = style.fontWeight
  if (style.textAlign) s.textAlign = style.textAlign
  if (style.padding) s.padding = style.padding
  if (style.margin) s.margin = style.margin
  if (style.borderRadius) s.borderRadius = style.borderRadius
  if (style.width) s.width = style.width
  if (style.height) s.height = style.height
  if (style.opacity != null) s.opacity = style.opacity
  if (style.lineHeight) s.lineHeight = style.lineHeight

  if (style.borderWidth && style.borderColor) {
    s.border = `${style.borderWidth} ${style.borderStyle || 'solid'} ${style.borderColor}`
  }

  return s
}

export function HeadingRenderer({ config, style }: { config: Record<string, unknown>; style?: BuilderStyle }) {
  const c = config as { content?: string; level?: string }
  const Tag = (c.level || 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

  return (
    <div style={applyStyle({}, style)}>
      <Tag
        style={applyStyle({ margin: 0 }, style)}
      >
        {c.content || ''}
      </Tag>
    </div>
  )
}

export function ParagraphRenderer({ config, style }: { config: Record<string, unknown>; style?: BuilderStyle }) {
  const c = config as { content?: string }

  return (
    <p
      style={applyStyle({ margin: 0 }, style)}
    >
      {c.content || ''}
    </p>
  )
}

export function TextRenderer({ config, style }: { config: Record<string, unknown>; style?: BuilderStyle }) {
  const c = config as { content?: string }

  return (
    <div style={applyStyle({}, style)}>
      {c.content || ''}
    </div>
  )
}

export function ImageRenderer({ config, style }: { config: Record<string, unknown>; style?: BuilderStyle }) {
  const c = config as { src?: string; alt?: string; objectFit?: string }

  if (!c.src) return null

  return (
    <div style={applyStyle({}, style)}>
      <img
        src={c.src}
        alt={c.alt || ''}
        loading="lazy"
        style={applyStyle({
          width: style?.width || '100%',
          display: 'block',
          objectFit: (c.objectFit as React.CSSProperties['objectFit']) || 'cover',
        }, style)}
      />
    </div>
  )
}

export function ButtonRenderer({ config, style }: { config: Record<string, unknown>; style?: BuilderStyle }) {
  const c = config as { label?: string; href?: string }

  const buttonStyle = applyStyle({
    border: 'none',
    cursor: 'pointer',
    display: 'inline-block',
    textDecoration: 'none',
    textAlign: 'center' as const,
  }, style)

  if (c.href) {
    return (
      <div style={{ padding: style?.padding || '0.5rem 2rem' }}>
        <a href={c.href} style={buttonStyle}>
          {c.label || 'Click Me'}
        </a>
      </div>
    )
  }

  return (
    <div style={{ padding: style?.padding || '0.5rem 2rem' }}>
      <button type="button" style={buttonStyle}>
        {c.label || 'Click Me'}
      </button>
    </div>
  )
}

export function ContainerRenderer({ config, style, children }: { config: Record<string, unknown>; style?: BuilderStyle; children?: React.ReactNode }) {
  const c = config as { children?: unknown[]; minHeight?: string }

  return (
    <div
      style={applyStyle({
        minHeight: c.minHeight || '100px',
      }, style)}
    >
      {children}
    </div>
  )
}

export function VideoRenderer({ config, style }: { config: Record<string, unknown>; style?: BuilderStyle }) {
  const c = config as { src?: string; poster?: string; autoplay?: boolean; controls?: boolean }

  if (!c.src) return null

  const isYoutube = c.src.includes('youtube.com') || c.src.includes('youtu.be')
  const isVimeo = c.src.includes('vimeo.com')

  if (isYoutube) {
    const videoId = c.src.includes('youtu.be')
      ? c.src.split('/').pop()
      : new URL(c.src).searchParams.get('v')
    if (!videoId) return null
    return (
      <div style={applyStyle({}, style)}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          allowFullScreen
          style={applyStyle({
            width: style?.width || '100%',
            aspectRatio: '16/9',
            border: 'none',
            borderRadius: style?.borderRadius,
          }, style)}
        />
      </div>
    )
  }

  if (isVimeo) {
    const videoId = c.src.split('/').pop()
    if (!videoId) return null
    return (
      <div style={applyStyle({}, style)}>
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          allowFullScreen
          style={applyStyle({
            width: style?.width || '100%',
            aspectRatio: '16/9',
            border: 'none',
            borderRadius: style?.borderRadius,
          }, style)}
        />
      </div>
    )
  }

  return (
    <div style={applyStyle({}, style)}>
      <video
        src={c.src}
        poster={c.poster}
        controls={c.controls !== false}
        autoPlay={c.autoplay}
        muted={c.autoplay}
        style={applyStyle({
          width: style?.width || '100%',
          display: 'block',
          borderRadius: style?.borderRadius,
        }, style)}
      />
    </div>
  )
}

export function DividerRenderer({ config, style }: { config: Record<string, unknown>; style?: BuilderStyle }) {
  const c = config as { style?: string }

  return (
    <div style={applyStyle({}, style)}>
      <hr
        style={{
          borderColor: style?.borderColor || '#e2e8f0',
          borderWidth: `0 0 ${style?.borderWidth || '1px'} 0`,
          borderStyle: (c.style || style?.borderStyle || 'solid') as string,
          margin: 0,
        }}
      />
    </div>
  )
}

export function SpacerRenderer({ config }: { config: Record<string, unknown> }) {
  const c = config as { height?: number }

  return (
    <div style={{ height: `${c.height || 64}px` }} />
  )
}

export function FormRenderer({ config, style }: { config: Record<string, unknown>; style?: BuilderStyle }) {
  const c = config as {
    title?: string
    fields?: Array<{ type?: string; label?: string; required?: boolean; placeholder?: string }>
    submitLabel?: string
  }
  const fields = c.fields || []

  return (
    <form
      style={applyStyle({}, style)}
      onSubmit={(e) => e.preventDefault()}
    >
      {c.title && (
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
          {c.title}
        </h3>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '480px' }}>
        {fields.map((field, i) => (
          <div key={i}>
            <label style={{ fontSize: '0.875rem', marginBottom: '0.25rem', display: 'block' }}>
              {field.label || 'Field'} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                placeholder={field.placeholder}
                required={field.required}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                }}
              />
            ) : field.type === 'email' ? (
              <input
                type="email"
                placeholder={field.placeholder}
                required={field.required}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  fontSize: '0.875rem',
                }}
              />
            ) : (
              <input
                type="text"
                placeholder={field.placeholder}
                required={field.required}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  fontSize: '0.875rem',
                }}
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          style={{
            padding: '0.625rem 1.25rem',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: '0.375rem',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          {c.submitLabel || 'Submit'}
        </button>
      </div>
    </form>
  )
}
