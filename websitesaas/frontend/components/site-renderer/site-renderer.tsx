import type { BuilderComponent, BuilderStyle, ComponentType } from '@/components/builder/types'
import {
  HeadingRenderer,
  ParagraphRenderer,
  TextRenderer,
  ImageRenderer,
  ButtonRenderer,
  ContainerRenderer,
  VideoRenderer,
  DividerRenderer,
  SpacerRenderer,
  FormRenderer,
} from './renderers'

const componentRenderers: Record<ComponentType, React.FC<{ config: Record<string, unknown>; style?: BuilderStyle; children?: React.ReactNode }>> = {
  heading: HeadingRenderer,
  paragraph: ParagraphRenderer,
  text: TextRenderer,
  image: ImageRenderer,
  button: ButtonRenderer,
  container: ContainerRenderer,
  video: VideoRenderer,
  divider: DividerRenderer,
  spacer: SpacerRenderer,
  form: FormRenderer,
}

export function SiteRenderer({ components }: { components: BuilderComponent[] }) {
  if (!components || components.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-zinc-500">
        <p>This page has no content yet.</p>
      </div>
    )
  }

  return (
    <>
      {components.map((component) => {
        const Renderer = componentRenderers[component.type]
        if (!Renderer) return null

        if (component.type === 'container') {
          const childComponents = (component.config.children as BuilderComponent[]) || []
          return (
            <Renderer
              key={component.id}
              config={component.config}
              style={component.style}
            >
              {childComponents.length > 0 ? (
                <SiteRenderer components={childComponents} />
              ) : null}
            </Renderer>
          )
        }

        return (
          <Renderer
            key={component.id}
            config={component.config}
            style={component.style}
          />
        )
      })}
    </>
  )
}
