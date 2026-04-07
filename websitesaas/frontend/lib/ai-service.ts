'use client'

export interface AIRequest {
  prompt: string
  maxTokens?: number
  temperature?: number
  model?: string
}

export interface AIResponse {
  content: string
  model: string
  cached?: boolean
}

export interface SectionGenerationRequest {
  sectionType: 'hero' | 'features' | 'testimonials' | 'cta' | 'faq' | 'pricing'
  prompt: string
  tone?: 'professional' | 'casual' | 'playful' | 'authoritative'
  targetAudience?: string
}

export interface CopySuggestionRequest {
  field: 'heading' | 'description' | 'cta' | 'tagline' | 'testimonial'
  currentValue?: string
  context: string
}

export interface SEOMetaRequest {
  pageTitle: string
  description: string
  keywords: string[]
  industry?: string
  targetAudience?: string
}

export interface TemplateRecommendationRequest {
  industry: string
  businessType?: string
  targetAudience?: string
  features?: string[]
}

export interface TemplateRecommendation {
  templateName: string
  matchScore: number
  reason: string
  suggestedComponents: string[]
}

export interface GeneratedSection {
  type: string
  config: Record<string, unknown>
}

const OLLAMA_BASE_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434'
const AI_MODEL = process.env.NEXT_PUBLIC_AI_MODEL || 'llama3'

async function callOllama(prompt: string, model: string = AI_MODEL, maxTokens: number = 1024, temperature: number = 0.7): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          num_predict: maxTokens,
          temperature,
        },
      }),
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      throw new Error('Ollama request failed')
    }

    const data = await response.json()
    return data.response || ''
  } catch {
    return ''
  }
}

function generateMockSection(request: SectionGenerationRequest): GeneratedSection {
  const { sectionType, prompt, tone = 'professional' } = request
  
  const toneStyles: Record<string, string> = {
    professional: 'text-zinc-900',
    casual: 'text-blue-600',
    playful: 'text-purple-600',
    authoritative: 'text-slate-800',
  }

  const styleClass = toneStyles[tone] || toneStyles.professional

  const sectionTemplates: Record<string, GeneratedSection> = {
    hero: {
      type: 'container',
      config: {
        className: `relative overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 text-white py-20 px-8 ${styleClass}`,
        children: [
          {
            type: 'heading',
            config: {
              text: prompt ? `Build ${prompt} With Confidence` : 'Transform Your Ideas Into Reality',
              level: 'h1',
              className: 'text-4xl md:text-6xl font-bold mb-6 text-center',
            },
          },
          {
            type: 'paragraph',
            config: {
              text: prompt
                ? `The all-in-one platform for ${prompt}. Design, launch, and scale — no code required.`
                : 'Design, launch, and scale your business with our intuitive drag-and-drop website builder.',
              className: 'text-lg md:text-xl mb-8 max-w-2xl mx-auto text-center opacity-90',
            },
          },
          {
            type: 'button',
            config: {
              text: 'Get Started Free',
              className: 'bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-zinc-100 transition-colors',
              variant: 'primary',
            },
          },
        ],
      },
    },
    features: {
      type: 'container',
      config: {
        className: 'py-16 px-8 bg-white dark:bg-zinc-950',
        children: [
          {
            type: 'heading',
            config: {
              text: 'Everything You Need',
              level: 'h2',
              className: 'text-3xl font-bold mb-12 text-center text-zinc-900 dark:text-zinc-50',
            },
          },
          {
            type: 'container',
            config: {
              className: 'grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto',
              children: ['Lightning Fast', 'AI-Powered', 'Fully Customizable'].map(feature => ({
                type: 'container',
                config: {
                  className: 'text-center p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900',
                  children: [
                    {
                      type: 'heading',
                      config: {
                        text: feature,
                        level: 'h3',
                        className: 'text-xl font-semibold mb-3 text-zinc-900 dark:text-zinc-50',
                      },
                    },
                    {
                      type: 'paragraph',
                      config: {
                        text: `Experience the power of ${feature.toLowerCase()} technology built into every page.`,
                        className: 'text-zinc-600 dark:text-zinc-400',
                      },
                    },
                  ],
                },
              })),
            },
          },
        ],
      },
    },
    testimonials: {
      type: 'container',
      config: {
        className: 'py-16 px-8 bg-zinc-50 dark:bg-zinc-900',
        children: [
          {
            type: 'heading',
            config: {
              text: 'What Our Customers Say',
              level: 'h2',
              className: 'text-3xl font-bold mb-12 text-center text-zinc-900 dark:text-zinc-50',
            },
          },
          {
            type: 'container',
            config: {
              className: 'grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto',
              children: [
                {
                  type: 'container',
                  config: {
                    className: 'bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm',
                    children: [
                      {
                        type: 'paragraph',
                        config: {
                          text: '"This platform completely transformed how we build our online presence. Incredibly intuitive."',
                          className: 'text-zinc-700 dark:text-zinc-300 italic mb-4',
                        },
                      },
                      {
                        type: 'heading',
                        config: {
                          text: '— Sarah Chen, CEO at TechFlow',
                          level: 'h4',
                          className: 'text-sm font-semibold text-zinc-900 dark:text-zinc-50',
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'container',
                  config: {
                    className: 'bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm',
                    children: [
                      {
                        type: 'paragraph',
                        config: {
                          text: '"We launched our site in hours, not weeks. The AI features are genuinely game-changing."',
                          className: 'text-zinc-700 dark:text-zinc-300 italic mb-4',
                        },
                      },
                      {
                        type: 'heading',
                        config: {
                          text: '— Marcus Rivera, Founder of LaunchPad',
                          level: 'h4',
                          className: 'text-sm font-semibold text-zinc-900 dark:text-zinc-50',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    cta: {
      type: 'container',
      config: {
        className: 'py-16 px-8 bg-blue-600 text-white text-center',
        children: [
          {
            type: 'heading',
            config: {
              text: prompt || 'Ready to Get Started?',
              level: 'h2',
              className: 'text-3xl font-bold mb-4',
            },
          },
          {
            type: 'paragraph',
            config: {
              text: 'Join thousands of creators building amazing websites today.',
              className: 'text-lg mb-8 opacity-90',
            },
          },
          {
            type: 'button',
            config: {
              text: 'Start Building Now',
              className: 'bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-zinc-100 transition-colors',
              variant: 'primary',
            },
          },
        ],
      },
    },
    faq: {
      type: 'container',
      config: {
        className: 'py-16 px-8 bg-white dark:bg-zinc-950',
        children: [
          {
            type: 'heading',
            config: {
              text: 'Frequently Asked Questions',
              level: 'h2',
              className: 'text-3xl font-bold mb-12 text-center text-zinc-900 dark:text-zinc-50',
            },
          },
          {
            type: 'container',
            config: {
              className: 'max-w-3xl mx-auto space-y-4',
              children: [
                {
                  type: 'container',
                  config: {
                    className: 'border-b border-zinc-200 dark:border-zinc-800 pb-4',
                    children: [
                      {
                        type: 'heading',
                        config: {
                          text: 'How do I get started?',
                          level: 'h3',
                          className: 'text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-50',
                        },
                      },
                      {
                        type: 'paragraph',
                        config: {
                          text: 'Sign up for free and use our drag-and-drop builder to create your first page in minutes.',
                          className: 'text-zinc-600 dark:text-zinc-400',
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'container',
                  config: {
                    className: 'border-b border-zinc-200 dark:border-zinc-800 pb-4',
                    children: [
                      {
                        type: 'heading',
                        config: {
                          text: 'Can I use my own domain?',
                          level: 'h3',
                          className: 'text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-50',
                        },
                      },
                      {
                        type: 'paragraph',
                        config: {
                          text: 'Yes! Connect any custom domain to your site with our simple DNS configuration.',
                          className: 'text-zinc-600 dark:text-zinc-400',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    pricing: {
      type: 'container',
      config: {
        className: 'py-16 px-8 bg-zinc-50 dark:bg-zinc-900',
        children: [
          {
            type: 'heading',
            config: {
              text: 'Simple, Transparent Pricing',
              level: 'h2',
              className: 'text-3xl font-bold mb-12 text-center text-zinc-900 dark:text-zinc-50',
            },
          },
          {
            type: 'container',
            config: {
              className: 'grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto',
              children: [
                {
                  type: 'container',
                  config: {
                    className: 'bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm text-center',
                    children: [
                      {
                        type: 'heading',
                        config: { text: 'Free', level: 'h3', className: 'text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-50' },
                      },
                      {
                        type: 'paragraph',
                        config: { text: '$0/mo', className: 'text-3xl font-bold text-blue-600 mb-4' },
                      },
                      {
                        type: 'paragraph',
                        config: { text: '1 page, basic templates, community support', className: 'text-sm text-zinc-600 dark:text-zinc-400 mb-4' },
                      },
                      {
                        type: 'button',
                        config: { text: 'Get Started', variant: 'ghost', className: 'w-full' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  }

  return sectionTemplates[sectionType] || sectionTemplates.hero
}

function generateMockCopySuggestions(request: CopySuggestionRequest): string[] {
  const { field, currentValue, context } = request
  
  const suggestions: Record<string, string[]> = {
    heading: [
      `Transform ${context || 'Your Business'} Today`,
      `The Future of ${context || 'Web Design'} is Here`,
      `Build ${context || 'Amazing Websites'} in Minutes`,
      currentValue ? `${currentValue} — Reimagined` : `Elevate Your ${context || 'Online Presence'}`,
    ],
    description: [
      `Experience the power of intelligent web design. Build, launch, and grow — all in one platform.`,
      `Your vision, our tools. Create stunning websites without writing a single line of code.`,
      `Join thousands of creators who trust our platform to bring their ideas to life.`,
      currentValue ? `${currentValue} — now with AI-powered enhancements.` : `Discover a smarter way to build online.`,
    ],
    cta: [
      `Start Building Free`,
      `Launch Your Vision`,
      `Get Started Today`,
      currentValue || `Try It Now`,
    ],
    tagline: [
      `Where Ideas Become Websites`,
      `Build Smarter, Not Harder`,
      `Your Website, Reimagined with AI`,
      currentValue || `Design. Launch. Grow.`,
    ],
    testimonial: [
      `"This platform saved us weeks of development time. Absolutely game-changing."`,
      `"Intuitive, powerful, and beautifully designed. Exactly what we needed."`,
      `"We went from concept to launch in days. The AI features are incredible."`,
      currentValue || `"Highly recommend for any team looking to build fast."`,
    ],
  }

  return suggestions[field] || suggestions.description
}

function generateMockSEO(request: SEOMetaRequest) {
  const { pageTitle, description, keywords, industry, targetAudience } = request
  
  const industryKeywords = industry ? [industry, `${industry} website`, `${industry} design`] : []
  const audienceKeywords = targetAudience ? [`for ${targetAudience}`, `${targetAudience} solutions`] : []
  const allKeywords = [...new Set([...keywords, ...industryKeywords, ...audienceKeywords])]

  return {
    title: `${pageTitle} | DJ Technologies - AI-Powered Website Builder`,
    description: description.length > 155 ? description.slice(0, 152) + '...' : description,
    keywords: allKeywords.join(', '),
    ogTitle: `${pageTitle} - Build with AI`,
    ogDescription: description,
    twitterCard: 'summary_large_image',
    twitterTitle: `${pageTitle} | DJ Technologies`,
    metaStructure: {
      type: 'container',
      config: {
        metaTags: [
          { name: 'title', content: `${pageTitle} | DJ Technologies` },
          { name: 'description', content: description },
          { name: 'keywords', content: allKeywords.join(', ') },
          { name: 'og:title', content: `${pageTitle} - Build with AI` },
          { name: 'og:description', content: description },
          { name: 'og:type', content: 'website' },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:title', content: `${pageTitle} | DJ Technologies` },
        ],
      },
    },
  }
}

function generateMockTemplateRecommendations(
  request: TemplateRecommendationRequest
): TemplateRecommendation[] {
  const { industry, businessType, features = [] } = request

  const industryTemplates: Record<string, TemplateRecommendation[]> = {
    technology: [
      {
        templateName: 'TechLaunch Pro',
        matchScore: 95,
        reason: 'Optimized for SaaS and tech startups with feature showcases and pricing tables.',
        suggestedComponents: ['hero', 'features', 'pricing', 'testimonials', 'cta'],
      },
      {
        templateName: 'DevPortfolio',
        matchScore: 78,
        reason: 'Clean, minimal design perfect for developer portfolios and tech agencies.',
        suggestedComponents: ['hero', 'gallery', 'testimonials', 'contact'],
      },
    ],
    ecommerce: [
      {
        templateName: 'ShopBuilder',
        matchScore: 97,
        reason: 'Built for online stores with product grids, cart integration, and checkout flows.',
        suggestedComponents: ['hero', 'product-grid', 'features', 'testimonials', 'faq'],
      },
      {
        templateName: 'BrandStore',
        matchScore: 85,
        reason: 'Premium ecommerce template with brand storytelling elements.',
        suggestedComponents: ['hero', 'gallery', 'features', 'testimonials'],
      },
    ],
    healthcare: [
      {
        templateName: 'HealthConnect',
        matchScore: 92,
        reason: 'Trust-building design with appointment booking and service showcases.',
        suggestedComponents: ['hero', 'services', 'testimonials', 'faq', 'contact'],
      },
    ],
    education: [
      {
        templateName: 'LearnHub',
        matchScore: 94,
        reason: 'Course-focused layout with enrollment CTAs and curriculum displays.',
        suggestedComponents: ['hero', 'features', 'pricing', 'testimonials', 'faq'],
      },
    ],
    restaurant: [
      {
        templateName: 'DineOnline',
        matchScore: 96,
        reason: 'Menu displays, reservation booking, and location maps built-in.',
        suggestedComponents: ['hero', 'gallery', 'menu', 'testimonials', 'contact'],
      },
    ],
    fitness: [
      {
        templateName: 'FitPro',
        matchScore: 93,
        reason: 'Dynamic layout for gyms, trainers, and wellness brands with class schedules.',
        suggestedComponents: ['hero', 'features', 'pricing', 'testimonials', 'cta'],
      },
    ],
    finance: [
      {
        templateName: 'FinServe',
        matchScore: 91,
        reason: 'Professional design with trust indicators, service pages, and contact forms.',
        suggestedComponents: ['hero', 'services', 'testimonials', 'faq', 'contact'],
      },
    ],
    real_estate: [
      {
        templateName: 'EstateView',
        matchScore: 95,
        reason: 'Property showcase with image galleries, search filters, and contact CTAs.',
        suggestedComponents: ['hero', 'gallery', 'features', 'testimonials', 'contact'],
      },
    ],
  }

  const templates = industryTemplates[industry.toLowerCase()] || [
    {
      templateName: 'Universal Starter',
      matchScore: 80,
      reason: `Versatile template adaptable for ${industry || 'any'} business needs.`,
      suggestedComponents: ['hero', 'features', 'testimonials', 'faq', 'cta'],
    },
    {
      templateName: 'Business Pro',
      matchScore: 75,
      reason: 'Professional layout suitable for most business types and industries.',
      suggestedComponents: ['hero', 'features', 'pricing', 'testimonials', 'contact'],
    },
  ]

  if (businessType) {
    return templates.map(t => ({
      ...t,
      reason: `${t.reason} (Optimized for ${businessType})`,
    }))
  }

  return templates
}

export class AIService {
  private useMock: boolean = true

  constructor() {
    if (typeof window !== 'undefined') {
      const ollamaUrl = process.env.NEXT_PUBLIC_OLLAMA_URL
      this.useMock = !ollamaUrl
    }
  }

  async generateContent(request: AIRequest): Promise<AIResponse> {
    if (!this.useMock) {
      const content = await callOllama(request.prompt, request.model, request.maxTokens, request.temperature)
      if (content) {
        return { content, model: request.model || AI_MODEL }
      }
    }

    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))

    return {
      content: `[AI Generated Placeholder]\n\nBased on your prompt: "${request.prompt}"\n\nThis is a mock response. Connect Ollama for full AI content generation.\n\nNEXT_PUBLIC_OLLAMA_URL environment variable: ${typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_OLLAMA_URL : 'server-only'}`,
      model: request.model || AI_MODEL,
      cached: false,
    }
  }

  async generateSection(request: SectionGenerationRequest): Promise<GeneratedSection> {
    if (!this.useMock) {
      const prompt = `Generate a ${request.sectionType} website section with the following details:
Description: ${request.prompt}
Tone: ${request.tone || 'professional'}
Target Audience: ${request.targetAudience || 'general'}

Return only valid JSON with component structure.`
      const content = await callOllama(prompt)
      if (content) {
        try {
          const parsed = JSON.parse(content)
          return parsed as GeneratedSection
        } catch {
        }
      }
    }

    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800))

    return generateMockSection(request)
  }

  async suggestCopy(request: CopySuggestionRequest): Promise<string[]> {
    if (!this.useMock) {
      const prompt = `Generate 4 creative copy suggestions for a ${request.field} field.
Context: ${request.context}
Current value: ${request.currentValue || '(empty)'}

Return only a JSON array of strings.`
      const content = await callOllama(prompt)
      if (content) {
        try {
          const parsed = JSON.parse(content)
          if (Array.isArray(parsed)) return parsed as string[]
        } catch {
        }
      }
    }

    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))

    return generateMockCopySuggestions(request)
  }

  async generateSEOMeta(request: SEOMetaRequest) {
    if (!this.useMock) {
      const prompt = `Generate SEO meta tags for a webpage with these details:
Page Title: ${request.pageTitle}
Description: ${request.description}
Keywords: ${request.keywords.join(', ')}
${request.industry ? `Industry: ${request.industry}` : ''}
${request.targetAudience ? `Target Audience: ${request.targetAudience}` : ''}

Return SEO-optimized title, description, and Open Graph tags.`
      const content = await callOllama(prompt)
      if (content) {
      }
    }

    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400))

    return generateMockSEO(request)
  }

  async recommendTemplates(request: TemplateRecommendationRequest): Promise<TemplateRecommendation[]> {
    if (!this.useMock) {
      const prompt = `Recommend website templates based on:
Industry: ${request.industry}
${request.businessType ? `Business Type: ${request.businessType}` : ''}
${request.features ? `Required Features: ${request.features.join(', ')}` : ''}

Return ranked recommendations with reasons.`
      const content = await callOllama(prompt)
      if (content) {
      }
    }

    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 600))

    return generateMockTemplateRecommendations(request)
  }
}

export const aiService = new AIService()
