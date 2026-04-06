import {
  Type,
  Image,
  Square,
  AlignLeft,
  Video,
  Minus,
  ArrowDownUp,
  FormInput,
  LayoutGrid,
  Heading1,
  MousePointerClick,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface BuilderStyle {
  backgroundColor?: string
  textColor?: string
  fontSize?: string
  fontWeight?: string
  textAlign?: 'left' | 'center' | 'right'
  padding?: string
  margin?: string
  borderRadius?: string
  borderWidth?: string
  borderColor?: string
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  width?: string
  height?: string
  opacity?: number
  lineHeight?: string
}

export interface BuilderComponent {
  id: string
  type: ComponentType
  config: Record<string, unknown>
  style: BuilderStyle
  position: number
}

export type ComponentType =
  | 'text'
  | 'image'
  | 'button'
  | 'container'
  | 'heading'
  | 'paragraph'
  | 'video'
  | 'divider'
  | 'spacer'
  | 'form'

export interface ComponentCategory {
  label: string
  types: ComponentType[]
}

export const COMPONENT_CATEGORIES: ComponentCategory[] = [
  {
    label: 'Basic',
    types: ['text', 'heading', 'paragraph', 'image', 'button'],
  },
  {
    label: 'Layout',
    types: ['container', 'divider', 'spacer'],
  },
  {
    label: 'Media',
    types: ['video'],
  },
  {
    label: 'Forms',
    types: ['form'],
  },
]

export interface ComponentTemplate {
  type: ComponentType
  label: string
  icon: LucideIcon
  description: string
  defaultConfig: Record<string, unknown>
  defaultStyle: BuilderStyle
}

export const COMPONENT_TEMPLATES: ComponentTemplate[] = [
  {
    type: 'heading',
    label: 'Heading',
    icon: Heading1,
    description: 'Section heading text',
    defaultConfig: {
      content: 'Add Your Heading',
      level: 'h2',
    },
    defaultStyle: {
      fontSize: '2rem',
      fontWeight: '700',
      textAlign: 'left',
      textColor: '#0f172a',
      padding: '1rem 2rem',
    },
  },
  {
    type: 'paragraph',
    label: 'Paragraph',
    icon: AlignLeft,
    description: 'Body text paragraph',
    defaultConfig: {
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    defaultStyle: {
      fontSize: '1rem',
      fontWeight: '400',
      textAlign: 'left',
      textColor: '#475569',
      padding: '0.5rem 2rem',
      lineHeight: '1.75',
    },
  },
  {
    type: 'text',
    label: 'Text Block',
    icon: Type,
    description: 'Editable text block',
    defaultConfig: {
      content: 'Edit this text to add your content.',
    },
    defaultStyle: {
      fontSize: '1rem',
      fontWeight: '400',
      textAlign: 'left',
      textColor: '#334155',
      padding: '0.5rem 2rem',
    },
  },
  {
    type: 'image',
    label: 'Image',
    icon: Image,
    description: 'Image with alt text',
    defaultConfig: {
      src: '',
      alt: 'Image description',
      objectFit: 'cover',
    },
    defaultStyle: {
      padding: '1rem 2rem',
      borderRadius: '0.5rem',
      width: '100%',
    },
  },
  {
    type: 'button',
    label: 'Button',
    icon: MousePointerClick,
    description: 'Clickable button',
    defaultConfig: {
      label: 'Click Me',
      href: '#',
      variant: 'primary',
    },
    defaultStyle: {
      padding: '0.75rem 1.5rem',
      textAlign: 'left',
      borderRadius: '0.5rem',
      backgroundColor: '#0f172a',
      textColor: '#ffffff',
      fontSize: '1rem',
      fontWeight: '500',
    },
  },
  {
    type: 'container',
    label: 'Container',
    icon: LayoutGrid,
    description: 'Flexible container box',
    defaultConfig: {
      children: [],
      minHeight: '200px',
    },
    defaultStyle: {
      padding: '2rem',
      backgroundColor: '#f8fafc',
      borderRadius: '0.5rem',
      borderWidth: '1px',
      borderColor: '#e2e8f0',
      borderStyle: 'solid',
      margin: '1rem 0',
    },
  },
  {
    type: 'video',
    label: 'Video',
    icon: Video,
    description: 'Embedded video player',
    defaultConfig: {
      src: '',
      poster: '',
      autoplay: false,
      controls: true,
    },
    defaultStyle: {
      padding: '1rem 2rem',
      borderRadius: '0.5rem',
      width: '100%',
    },
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: Minus,
    description: 'Horizontal line separator',
    defaultConfig: {
      style: 'solid',
    },
    defaultStyle: {
      padding: '1rem 2rem',
      borderColor: '#e2e8f0',
      borderWidth: '1px',
    },
  },
  {
    type: 'spacer',
    label: 'Spacer',
    icon: ArrowDownUp,
    description: 'Vertical spacing',
    defaultConfig: {
      height: 64,
    },
    defaultStyle: {},
  },
  {
    type: 'form',
    label: 'Form',
    icon: FormInput,
    description: 'Contact form',
    defaultConfig: {
      title: 'Contact Us',
      fields: [
        { type: 'text', label: 'Name', required: true, placeholder: 'Your name' },
        { type: 'email', label: 'Email', required: true, placeholder: 'you@example.com' },
        { type: 'textarea', label: 'Message', required: true, placeholder: 'Your message' },
      ],
      submitLabel: 'Send Message',
    },
    defaultStyle: {
      padding: '2rem',
      backgroundColor: '#ffffff',
      borderRadius: '0.5rem',
      borderWidth: '1px',
      borderColor: '#e2e8f0',
      borderStyle: 'solid',
    },
  },
]

const templateMap = new Map<ComponentType, ComponentTemplate>()
COMPONENT_TEMPLATES.forEach((t) => templateMap.set(t.type, t))

export function getTemplate(type: ComponentType): ComponentTemplate {
  const template = templateMap.get(type)
  if (!template) throw new Error(`Unknown component type: ${type}`)
  return template
}

export function createComponent(type: ComponentType): BuilderComponent {
  const template = getTemplate(type)

  return {
    id: crypto.randomUUID(),
    type,
    config: { ...template.defaultConfig },
    style: { ...template.defaultStyle },
    position: 0,
  }
}
