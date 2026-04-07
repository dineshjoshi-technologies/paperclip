'use client'

import { useState } from 'react'
import { Loader2, Sparkles, ChevronDown, ChevronRight, Globe, Pencil, Layout, MessageSquare, Plus, Check } from 'lucide-react'
import { type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { aiService, type GeneratedSection, type CopySuggestionRequest, type SectionGenerationRequest } from '@/lib/ai-service'
import { type BuilderComponent } from './types'

interface AIContentPanelProps {
  selectedComponent?: BuilderComponent | null
  onInsertSection?: (section: GeneratedSection) => void
  onApplyCopy?: (config: Record<string, unknown>) => void
}

type AITab = 'generate' | 'copy' | 'seo' | 'templates'

export function AIContentPanel({ selectedComponent, onInsertSection, onApplyCopy }: AIContentPanelProps) {
  const [activeTab, setActiveTab] = useState<AITab>('generate')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResult, setGeneratedResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const tabs: { key: AITab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'generate', label: 'Generate', icon: Sparkles },
    { key: 'copy', label: 'Copy', icon: Pencil },
    { key: 'seo', label: 'SEO', icon: Globe },
    { key: 'templates', label: 'Templates', icon: Layout },
  ]

  const resetState = () => {
    setGeneratedResult(null)
    setError(null)
    setIsGenerating(false)
  }

  const handleTabChange = (tab: AITab) => {
    setActiveTab(tab)
    resetState()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-purple-600" />
          AI Assistant
        </span>
      </div>

      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium capitalize transition-colors',
              activeTab === key
                ? 'text-zinc-900 dark:text-zinc-50 border-b-2 border-zinc-900 dark:border-zinc-50'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300',
            )}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'generate' && (
          <SectionGenerator
            isGenerating={isGenerating}
            onInsert={onInsertSection}
          />
        )}
        {activeTab === 'copy' && (
          <CopySuggester
            selectedComponent={selectedComponent}
            isGenerating={isGenerating}
            onApplyCopy={onApplyCopy}
          />
        )}
        {activeTab === 'seo' && (
          <SEOGenerator
            isGenerating={isGenerating}
          />
        )}
        {activeTab === 'templates' && (
          <TemplateRecommender
            isGenerating={isGenerating}
            onInsertSection={onInsertSection}
          />
        )}
      </div>
    </div>
  )
}

interface SectionGeneratorProps {
  isGenerating: boolean
  onInsert?: (section: GeneratedSection) => void
}

function SectionGenerator({ isGenerating: parentGenerating, onInsert }: SectionGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [sectionType, setSectionType] = useState<string>('hero')
  const [tone, setTone] = useState<string>('professional')
  const [localGenerating, setLocalGenerating] = useState(false)
  const [generatedSection, setGeneratedSection] = useState<GeneratedSection | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isGenerating = parentGenerating || localGenerating

  const handleGenerate = async () => {
    if (!prompt.trim() && sectionType) {
      setError('Please enter a description for your section')
      return
    }

    setLocalGenerating(true)
    setError(null)
    setGeneratedSection(null)

    try {
      const result = await aiService.generateSection({
        sectionType: sectionType as any,
        prompt: prompt.trim(),
        tone: tone as any,
      })
      setGeneratedSection(result)
    } catch {
      setError('Failed to generate section. Please try again.')
    } finally {
      setLocalGenerating(false)
    }
  }

  const handleInsert = () => {
    if (generatedSection && onInsert) {
      onInsert(generatedSection)
      setGeneratedSection(null)
    }
  }

  const sections = [
    { value: 'hero', label: 'Hero' },
    { value: 'features', label: 'Features' },
    { value: 'testimonials', label: 'Testimonials' },
    { value: 'cta', label: 'Call to Action' },
    { value: 'faq', label: 'FAQ' },
    { value: 'pricing', label: 'Pricing' },
  ]

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'playful', label: 'Playful' },
    { value: 'authoritative', label: 'Authoritative' },
  ]

  const quickPrompts = [
    'a modern SaaS landing page',
    'an e-commerce store homepage',
    'a personal portfolio',
    'a restaurant website with menu',
    'a fitness studio with class schedules',
    'a healthcare provider booking site',
  ]

  return (
    <div className="p-3 space-y-4">
      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Section Type
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {sections.map(s => (
            <button
              key={s.value}
              onClick={() => setSectionType(s.value)}
              className={cn(
                'px-2 py-1.5 text-xs rounded-md border transition-colors',
                sectionType === s.value
                  ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                  : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Tone
        </label>
        <div className="flex gap-1.5">
          {tones.map(t => (
            <button
              key={t.value}
              onClick={() => setTone(t.value)}
              className={cn(
                'px-2 py-1 text-xs rounded-md border transition-colors',
                tone === t.value
                  ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                  : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Describe your section
        </label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="e.g., A hero section for a modern SaaS landing page with a bold headline..."
          rows={3}
          className="w-full px-2.5 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none placeholder:text-zinc-400"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Quick prompts
        </label>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map(p => (
            <button
              key={p}
              onClick={() => setPrompt(p)}
              className="px-2 py-1 text-[11px] rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <Button
        variant="primary"
        size="sm"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full gap-1.5"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5" />
            Generate Section
          </>
        )}
      </Button>

      {error && (
        <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {generatedSection && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Generated Result</span>
            {onInsert && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleInsert}
                className="gap-1 h-6 px-2 text-[11px]"
              >
                <Plus className="h-3 w-3" />
                Insert
              </Button>
            )}
          </div>
          <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-[11px] text-zinc-600 dark:text-zinc-400 font-mono overflow-hidden">
            <div className="truncate">{JSON.stringify(generatedSection, null, 2).slice(0, 200)}...</div>
          </div>
        </div>
      )}
    </div>
  )
}

interface CopySuggesterProps {
  selectedComponent?: BuilderComponent | null
  isGenerating: boolean
  onApplyCopy?: (config: Record<string, unknown>) => void
}

function CopySuggester({ selectedComponent, isGenerating: parentGenerating, onApplyCopy }: CopySuggesterProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [localGenerating, setLocalGenerating] = useState(false)
  const [appliedIndex, setAppliedIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isGenerating = parentGenerating || localGenerating
  const hasSelection = !!selectedComponent

  const handleGenerate = async () => {
    if (!selectedComponent) {
      setError('Select a component in the canvas to get copy suggestions')
      return
    }

    setLocalGenerating(true)
    setError(null)
    setAppliedIndex(null)

    try {
      const fields = Object.keys(selectedComponent.config)
      const mainField = fields.find(f => typeof selectedComponent.config[f] === 'string') || 'heading'

      const context = `a ${selectedComponent.type} component in a website builder`
      const currentValue = typeof selectedComponent.config[mainField] === 'string'
        ? selectedComponent.config[mainField] as string
        : undefined

      const request: CopySuggestionRequest = {
        field: mainField as any,
        currentValue,
        context,
      }

      const results = await aiService.suggestCopy(request)
      setSuggestions(results)
    } catch {
      setError('Failed to generate suggestions. Please try again.')
    } finally {
      setLocalGenerating(false)
    }
  }

  const handleApplySuggestion = (suggestion: string) => {
    if (!selectedComponent || !onApplyCopy) return

    const fields = Object.keys(selectedComponent.config).filter(
      f => typeof selectedComponent.config[f] === 'string'
    )
    const mainField = fields[0] || 'text'

    const newConfig = { ...selectedComponent.config, [mainField]: suggestion }
    onApplyCopy(newConfig)
    setAppliedIndex(suggestions.indexOf(suggestion))
  }

  if (!hasSelection) {
    return (
      <div className="p-6 text-center space-y-3">
        <MessageSquare className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mx-auto" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Select a component in the canvas to get AI-powered copy suggestions
        </p>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-4">
      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Selected Component
        </label>
        <div className="px-2.5 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-xs">
          <span className=" font-semibold text-zinc-900 dark:text-zinc-50 capitalize">{selectedComponent.type}</span>
        </div>
      </div>

      <Button
        variant="primary"
        size="sm"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full gap-1.5"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Pencil className="h-3.5 w-3.5" />
            Generate Suggestions
          </>
        )}
      </Button>

      {error && (
        <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Suggestions
          </label>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={cn(
                'p-2.5 rounded-lg border text-xs transition-colors',
                appliedIndex === index
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              )}
            >
              <p className="text-zinc-700 dark:text-zinc-300">{suggestion}</p>
              {onApplyCopy && (
                <button
                  onClick={() => handleApplySuggestion(suggestion)}
                  className={cn(
                    'mt-1.5 text-[11px] font-medium flex items-center gap-1 transition-colors',
                    appliedIndex === index
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-purple-600 dark:text-purple-400 hover:text-purple-700'
                  )}
                >
                  {appliedIndex === index ? (
                    <>
                      <Check className="h-3 w-3" />
                      Applied
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3" />
                      Apply
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface SEOGeneratorProps {
  isGenerating: boolean
}

function SEOGenerator({ isGenerating: parentGenerating }: SEOGeneratorProps) {
  const [pageTitle, setPageTitle] = useState('')
  const [description, setDescription] = useState('')
  const [keywords, setKeywords] = useState('')
  const [industry, setIndustry] = useState('')
  const [localGenerating, setLocalGenerating] = useState(false)
  const [seResult, setSeResult] = useState<{ title: string; description: string; keywords: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isGenerating = parentGenerating || localGenerating

  const handleGenerate = async () => {
    if (!pageTitle.trim()) {
      setError('Please enter a page title')
      return
    }

    setLocalGenerating(true)
    setError(null)
    setSeResult(null)

    try {
      const result = await aiService.generateSEOMeta({
        pageTitle: pageTitle.trim(),
        description: description.trim() || `Discover ${pageTitle.trim()} - build amazing websites with AI-powered tools`,
        keywords: keywords ? keywords.split(',').map(k => k.trim()).filter(Boolean) : [pageTitle.trim()],
        industry: industry || undefined,
      })
      setSeResult({
        title: result.title,
        description: result.description,
        keywords: result.keywords,
      })
    } catch {
      setError('Failed to generate SEO meta tags. Please try again.')
    } finally {
      setLocalGenerating(false)
    }
  }

  const handleCopyMeta = () => {
    if (!seResult) return
    const metaString = `<title>${seResult.title}</title>
<meta name="description" content="${seResult.description}">
<meta name="keywords" content="${seResult.keywords}">`
    navigator.clipboard.writeText(metaString)
  }

  return (
    <div className="p-3 space-y-4">
      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Page Title
        </label>
        <input
          type="text"
          value={pageTitle}
          onChange={e => setPageTitle(e.target.value)}
          placeholder="e.g., My Amazing Website"
          className="w-full h-8 px-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-zinc-400"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Description
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Brief description of your page..."
          rows={2}
          className="w-full px-2.5 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none placeholder:text-zinc-400"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Keywords (comma-separated)
        </label>
        <input
          type="text"
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
          placeholder="e.g., website builder, AI, no-code"
          className="w-full h-8 px-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-zinc-400"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Industry/Category
        </label>
        <input
          type="text"
          value={industry}
          onChange={e => setIndustry(e.target.value)}
          placeholder="e.g., Technology, E-commerce, Healthcare"
          className="w-full h-8 px-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-zinc-400"
        />
      </div>

      <Button
        variant="primary"
        size="sm"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full gap-1.5"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Globe className="h-3.5 w-3.5" />
            Generate SEO Meta
          </>
        )}
      </Button>

      {error && (
        <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {seResult && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Generated Meta Tags</span>
            <button
              onClick={handleCopyMeta}
              className="text-[11px] text-purple-600 dark:text-purple-400 hover:text-purple-700 font-medium"
            >
              Copy HTML
            </button>
          </div>
          <div className="space-y-1.5">
            <div className="p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
              <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">Title</span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 truncate">{seResult.title}</p>
            </div>
            <div className="p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
              <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">Description</span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2">{seResult.description}</p>
            </div>
            <div className="p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
              <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">Keywords</span>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 truncate">{seResult.keywords}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface TemplateRecommenderProps {
  isGenerating: boolean
  onInsertSection?: (section: GeneratedSection) => void
}

function TemplateRecommender({ isGenerating: parentGenerating, onInsertSection }: TemplateRecommenderProps) {
  const [industry, setIndustry] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [localGenerating, setLocalGenerating] = useState(false)
  const [recommendations, setRecommendations] = useState<Awaited<ReturnType<typeof aiService.recommendTemplates>>>([])
  const [error, setError] = useState<string | null>(null)

  const isGenerating = parentGenerating || localGenerating

  const industries = [
    { value: 'technology', label: 'Technology / SaaS' },
    { value: 'ecommerce', label: 'E-Commerce' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'restaurant', label: 'Restaurant / Food' },
    { value: 'fitness', label: 'Fitness / Wellness' },
    { value: 'finance', label: 'Finance' },
    { value: 'real_estate', label: 'Real Estate' },
  ]

  const handleRecommend = async () => {
    if (!industry.trim()) {
      setError('Please select an industry')
      return
    }

    setLocalGenerating(true)
    setError(null)

    try {
      const results = await aiService.recommendTemplates({
        industry: industry.trim(),
        businessType: businessType.trim() || undefined,
      })
      setRecommendations(results)
    } catch {
      setError('Failed to get recommendations. Please try again.')
    } finally {
      setLocalGenerating(false)
    }
  }

  const handleUseTemplate = async (rec: Awaited<ReturnType<typeof aiService.recommendTemplates>>[0]) => {
    if (!onInsertSection) return

    const primaryType = rec.suggestedComponents[0] as SectionGenerationRequest['sectionType'] || 'hero'
    try {
      const section = await aiService.generateSection({
        sectionType: primaryType,
        prompt: `Generate a ${primaryType} section for a ${rec.templateName} template in the ${industry} industry`,
        tone: 'professional',
      })
      onInsertSection(section)
    } catch {
      setError('Failed to generate template. Please try again.')
    }
  }

  return (
    <div className="p-3 space-y-4">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Get AI-powered template recommendations based on your industry.
      </p>

      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Industry
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {industries.map(ind => (
            <button
              key={ind.value}
              onClick={() => setIndustry(ind.value)}
              className={cn(
                'px-2 py-1.5 text-xs rounded-md border transition-colors text-left',
                industry === ind.value
                  ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                  : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              )}
            >
              {ind.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          Business Type (optional)
        </label>
        <input
          type="text"
          value={businessType}
          onChange={e => setBusinessType(e.target.value)}
          placeholder="e.g., Startup, Agency, Freelance"
          className="w-full h-8 px-2.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-zinc-400"
        />
      </div>

      <Button
        variant="primary"
        size="sm"
        onClick={handleRecommend}
        disabled={isGenerating || !industry}
        className="w-full gap-1.5"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5" />
            Get Recommendations
          </>
        )}
      </Button>

      {error && (
        <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Recommended Templates
          </p>
          {recommendations.map((rec) => (
            <div
              key={rec.templateName}
              className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{rec.templateName}</span>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{rec.matchScore}% match</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2">{rec.reason}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {rec.suggestedComponents.map(comp => (
                  <span key={comp} className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 capitalize">
                    {comp}
                  </span>
                ))}
              </div>
              {onInsertSection && (
                <button
                  onClick={() => handleUseTemplate(rec)}
                  disabled={isGenerating}
                  className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Use this template
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
