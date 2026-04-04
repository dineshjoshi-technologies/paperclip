import { type BuilderComponent, ComponentType } from './types'

function HeroPreview({ config }: { config: Record<string, unknown> }) {
  const c = config as { title?: string; subtitle?: string; ctaText?: string }
  return (
    <section className="py-16 px-8 text-center bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">{c.title || 'Hero Title'}</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">{c.subtitle || 'Subtitle text'}</p>
      <button className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-6 py-2 rounded-lg text-sm font-medium">
        {c.ctaText || 'Get Started'}
      </button>
    </section>
  )
}

function FeaturesPreview({ config }: { config: Record<string, unknown> }) {
  const c = config as { title?: string; items?: Array<{ icon?: string; title?: string; description?: string }> }
  return (
    <section className="py-12 px-8">
      <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-zinc-50 mb-8">{c.title || 'Features'}</h2>
      <div className="grid grid-cols-3 gap-4">
        {(c.items || []).slice(0, 3).map((item, i) => (
          <div key={i} className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-2xl">{item.icon || '✨'}</span>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mt-2">{item.title || 'Feature'}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.description || 'Description'}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function PricingPreview({ config }: { config: Record<string, unknown> }) {
  const c = config as { title?: string; plans?: Array<{ name?: string; price?: string; features?: string[]; highlighted?: boolean }> }
  return (
    <section className="py-12 px-8">
      <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-zinc-50 mb-8">{c.title || 'Pricing'}</h2>
      <div className="flex gap-4 justify-center">
        {(c.plans || []).slice(0, 2).map((plan, i) => (
          <div key={i} className={`p-6 rounded-xl border ${plan.highlighted ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900 dark:ring-zinc-100' : 'border-zinc-200 dark:border-zinc-800'} text-center`}>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{plan.name || 'Plan'}</h3>
            <div className="text-2xl font-bold my-2 text-zinc-900 dark:text-zinc-50">{plan.price || '$0'}</div>
            <ul className="text-sm text-zinc-500 dark:text-zinc-400 space-y-1">
              {(plan.features || []).map((f, j) => <li key={j}>{f}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function TestimonialPreview({ config }: { config: Record<string, unknown> }) {
  const c = config as { quote?: string; author?: string; role?: string }
  return (
    <section className="py-12 px-8">
      <div className="max-w-xl mx-auto text-center p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900">
        <blockquote className="text-zinc-700 dark:text-zinc-300 italic mb-4">"{c.quote || 'Testimonial quote'}"</blockquote>
        <p className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">{c.author || 'Author'}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{c.role || 'Role'}</p>
      </div>
    </section>
  )
}

function CtaPreview({ config }: { config: Record<string, unknown> }) {
  const c = config as { title?: string; subtitle?: string; buttonText?: string }
  return (
    <section className="py-12 px-8 text-center bg-zinc-900 dark:bg-zinc-100">
      <h2 className="text-2xl font-bold text-white dark:text-zinc-900 mb-2">{c.title || 'Ready?'}</h2>
      <p className="text-zinc-300 dark:text-zinc-600 mb-4">{c.subtitle || 'Subtitle'}</p>
      <button className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-6 py-2 rounded-lg text-sm font-medium">
        {c.buttonText || 'Action'}
      </button>
    </section>
  )
}

function NavbarPreview({ config }: { config: Record<string, unknown> }) {
  const c = config as { brand?: string; links?: Array<{ label?: string; href?: string }> }
  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 dark:border-zinc-800">
      <span className="font-bold text-zinc-900 dark:text-zinc-50">{c.brand || 'Brand'}</span>
      <div className="flex gap-4">
        {(c.links || []).slice(0, 3).map((link, i) => (
          <span key={i} className="text-sm text-zinc-500 dark:text-zinc-400">{link.label}</span>
        ))}
      </div>
    </nav>
  )
}

function TextPreview({ config }: { config: Record<string, unknown> }) {
  const c = config as { content?: string; alignment?: string }
  return (
    <div className={`px-8 py-6 text-zinc-700 dark:text-zinc-300 text-${c.alignment || 'left'}`}>
      {c.content || 'Text content'}
    </div>
  )
}

function ImagePreview({ config }: { config: Record<string, unknown> }) {
  const c = config as { src?: string; alt?: string; width?: string }
  return (
    <div className="px-8 py-4">
      {c.src ? (
        <img src={c.src} alt={c.alt || ''} style={{ width: c.width || '100%' }} className="rounded-lg" />
      ) : (
        <div className="w-full h-32 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400">
          Image placeholder
        </div>
      )}
    </div>
  )
}

function FormPreview({ config }: { config: Record<string, unknown> }) {
  const c = config as { title?: string; fields?: Array<{ type?: string; label?: string; required?: boolean }> }
  return (
    <section className="py-12 px-8">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">{c.title || 'Contact'}</h3>
      <div className="space-y-3 max-w-md">
        {(c.fields || []).map((field, i) => (
          <div key={i}>
            <label className="text-sm text-zinc-600 dark:text-zinc-400 mb-1 block">
              {field.label || 'Field'} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <div className="h-20 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent" />
            ) : (
              <div className="h-9 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent" />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function GalleryPreview({ config }: { config: Record<string, unknown> }) {
  const c = config as { images?: Array<{ src?: string; alt?: string }>; columns?: number }
  return (
    <section className="py-8 px-8">
      <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${c.columns || 3}, 1fr)` }}>
        {(c.images || []).slice(0, 6).map((img, i) => (
          <div key={i} className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 text-sm">
            {img.alt || `Image ${i + 1}`}
          </div>
        ))}
      </div>
    </section>
  )
}

function FooterPreview({ config }: { config: Record<string, unknown> }) {
  const c = config as { brand?: string; description?: string; links?: Array<{ label?: string; href?: string }>; copyright?: string }
  return (
    <footer className="py-8 px-8 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-50">{c.brand || 'Brand'}</h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{c.description || 'Description'}</p>
        </div>
        <div className="flex gap-4">
          {(c.links || []).map((link, i) => (
            <span key={i} className="text-sm text-zinc-500 dark:text-zinc-400">{link.label}</span>
          ))}
        </div>
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        {c.copyright || '© 2026'}
      </p>
    </footer>
  )
}

function SpacerPreview({ config }: { config: Record<string, unknown> }) {
  const c = config as { height?: number }
  return <div style={{ height: `${c.height || 64}px` }} className="border-b border-dashed border-zinc-200 dark:border-zinc-800" />
}

const componentPreviews: Record<ComponentType, React.FC<{ config: Record<string, unknown> }>> = {
  hero: HeroPreview,
  features: FeaturesPreview,
  pricing: PricingPreview,
  testimonial: TestimonialPreview,
  cta: CtaPreview,
  navbar: NavbarPreview,
  text: TextPreview,
  image: ImagePreview,
  form: FormPreview,
  gallery: GalleryPreview,
  footer: FooterPreview,
  spacer: SpacerPreview,
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
      className={`relative group cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-950' : 'hover:ring-1 hover:ring-zinc-300 dark:hover:ring-zinc-700'
      }`}
    >
      <Preview config={component.config} />
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs bg-zinc-900/80 dark:bg-zinc-100/80 text-white dark:text-zinc-900 px-2 py-0.5 rounded">
          {component.type}
        </span>
      </div>
    </div>
  )
}
