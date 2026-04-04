export interface BuilderComponent {
  id: string
  type: ComponentType
  config: Record<string, unknown>
  position: number
}

export type ComponentType =
  | 'hero'
  | 'features'
  | 'pricing'
  | 'testimonial'
  | 'cta'
  | 'footer'
  | 'navbar'
  | 'gallery'
  | 'text'
  | 'image'
  | 'form'
  | 'spacer'

export interface ComponentTemplate {
  type: ComponentType
  label: string
  icon: string
  defaultConfig: Record<string, unknown>
}

export const COMPONENT_TEMPLATES: ComponentTemplate[] = [
  {
    type: 'navbar',
    label: 'Navigation Bar',
    icon: '☰',
    defaultConfig: {
      brand: 'My Brand',
      links: [
        { label: 'Home', href: '#' },
        { label: 'About', href: '#about' },
        { label: 'Contact', href: '#contact' },
      ],
    },
  },
  {
    type: 'hero',
    label: 'Hero Section',
    icon: '🏠',
    defaultConfig: {
      title: 'Welcome to Our Platform',
      subtitle: 'Build something amazing today',
      ctaText: 'Get Started',
      ctaLink: '#',
      backgroundImage: '',
    },
  },
  {
    type: 'features',
    label: 'Features Grid',
    icon: '✨',
    defaultConfig: {
      title: 'Our Features',
      items: [
        { icon: '🚀', title: 'Fast', description: 'Lightning fast performance' },
        { icon: '🔒', title: 'Secure', description: 'Enterprise-grade security' },
        { icon: '📱', title: 'Responsive', description: 'Works on all devices' },
      ],
    },
  },
  {
    type: 'pricing',
    label: 'Pricing Table',
    icon: '💰',
    defaultConfig: {
      title: 'Simple Pricing',
      plans: [
        { name: 'Starter', price: '$9/mo', features: ['Feature 1', 'Feature 2'], highlighted: false },
        { name: 'Pro', price: '$29/mo', features: ['All Starter', 'Feature 3', 'Feature 4'], highlighted: true },
      ],
    },
  },
  {
    type: 'testimonial',
    label: 'Testimonial',
    icon: '💬',
    defaultConfig: {
      quote: 'This product changed our workflow completely.',
      author: 'Jane Doe',
      role: 'CEO, Company',
      avatar: '',
    },
  },
  {
    type: 'cta',
    label: 'Call to Action',
    icon: '📢',
    defaultConfig: {
      title: 'Ready to get started?',
      subtitle: 'Join thousands of happy users today',
      buttonText: 'Sign Up Now',
      buttonLink: '#',
    },
  },
  {
    type: 'text',
    label: 'Text Block',
    icon: '📝',
    defaultConfig: {
      content: 'Edit this text to add your content.',
      alignment: 'left' as 'left' | 'center' | 'right',
    },
  },
  {
    type: 'image',
    label: 'Image',
    icon: '🖼️',
    defaultConfig: {
      src: '',
      alt: 'Image description',
      width: '100%',
    },
  },
  {
    type: 'form',
    label: 'Contact Form',
    icon: '📧',
    defaultConfig: {
      title: 'Contact Us',
      fields: [
        { type: 'text', label: 'Name', required: true },
        { type: 'email', label: 'Email', required: true },
        { type: 'textarea', label: 'Message', required: true },
      ],
    },
  },
  {
    type: 'gallery',
    label: 'Image Gallery',
    icon: '🎨',
    defaultConfig: {
      images: [
        { src: '', alt: 'Gallery image 1' },
        { src: '', alt: 'Gallery image 2' },
        { src: '', alt: 'Gallery image 3' },
      ],
      columns: 3,
    },
  },
  {
    type: 'footer',
    label: 'Footer',
    icon: '📄',
    defaultConfig: {
      brand: 'My Brand',
      description: 'Building the future of digital creation.',
      links: [
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' },
      ],
      copyright: '© 2026 My Brand',
    },
  },
  {
    type: 'spacer',
    label: 'Spacer',
    icon: '↕️',
    defaultConfig: {
      height: 64,
    },
  },
]

export function createComponent(type: ComponentType): BuilderComponent {
  const template = COMPONENT_TEMPLATES.find((t) => t.type === type)
  if (!template) throw new Error(`Unknown component type: ${type}`)

  return {
    id: crypto.randomUUID(),
    type,
    config: { ...template.defaultConfig },
    position: 0,
  }
}
