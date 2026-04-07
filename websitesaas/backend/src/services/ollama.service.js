const { logger } = require('../services/logger')

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.AI_MODEL || 'llama3'
const OLLAMA_TIMEOUT = parseInt(process.env.OLLAMA_TIMEOUT || '60000', 10)
const MAX_RETRIES = parseInt(process.env.OLLAMA_MAX_RETRIES || '2', 10)

let ollamaAvailable = null
let lastHealthCheck = 0
const HEALTH_CHECK_INTERVAL = 30000

async function checkOllamaHealth() {
  const now = Date.now()
  if (ollamaAvailable !== null && now - lastHealthCheck < HEALTH_CHECK_INTERVAL) {
    return ollamaAvailable
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: controller.signal
    })
    clearTimeout(timeout)
    ollamaAvailable = response.ok
    lastHealthCheck = now
    if (ollamaAvailable) {
      logger.info('Ollama service is available')
    } else {
      logger.warn({ status: response.status }, 'Ollama health check failed')
    }
  } catch (error) {
    ollamaAvailable = false
    lastHealthCheck = now
    logger.warn({ error: error.message }, 'Ollama service is not reachable')
  }

  return ollamaAvailable
}

function buildPrompt(request) {
  const { operation, data } = request

  const prompts = {
    generateSection: () => {
      const { sectionType, prompt, tone = 'professional', targetAudience = 'general' } = data
      return `Generate a ${sectionType} website section with the following details:
Description: ${prompt}
Tone: ${tone}
Target Audience: ${targetAudience}

Return ONLY valid JSON with this structure - no markdown wrappers, no explanations:
{
  "type": "container",
  "config": {
    "className": "appropriate tailwind classes",
    "children": [
      {
        "type": "heading|paragraph|button|etc",
        "config": {
          "text": "generated content",
          "className": "tailwind classes",
          "level": "h1|h2|h3 if heading",
          "variant": "primary|secondary|ghost if button"
        }
      }
    ]
  }
}

Supported component types: heading, paragraph, text, image, button, container, video, divider, spacer, form
Make the generated content specific to the description, not generic.`
    },

    suggestCopy: () => {
      const { field, context, currentValue } = data
      return `Generate exactly 4 creative copy suggestions for a ${field} field.
Context: ${context}
Current value: ${currentValue || '(empty)'}

Return ONLY a JSON array of strings, like this:
["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"]

Make each suggestion distinct and valuable. Adapt tone to the context.`
    },

    generateSEOMeta: () => {
      const { pageTitle, description, keywords = [], industry, targetAudience } = data
      return `Generate SEO-optimized meta tags for this webpage:
Page Title: ${pageTitle}
Description: ${description}
Keywords: ${keywords.join(', ')}
${industry ? 'Industry: ' + industry : ''}
${targetAudience ? 'Target Audience: ' + targetAudience : ''}

Return ONLY valid JSON with this structure:
{
  "title": "optimized title (max 60 chars)",
  "description": "optimized description (max 155 chars)",
  "keywords": "comma-separated keywords",
  "ogTitle": "Open Graph title",
  "ogDescription": "Open Graph description",
  "twitterCard": "summary_large_image",
  "twitterTitle": "Twitter card title"
}`
    },

    recommendTemplates: () => {
      const { industry, businessType, features = [] } = data
      return `Recommend website templates for this request:
Industry: ${industry}
${businessType ? 'Business Type: ' + businessType : ''}
${features.length ? 'Required Features: ' + features.join(', ') : ''}

Return ONLY a JSON array of recommendations:
[
  {
    "templateName": "template name",
    "matchScore": 0-100,
    "reason": "why this matches",
    "suggestedComponents": ["hero", "features", "etc"]
  }
]

Provide 2-3 recommendations. Make matchScore realistic.`
    },

    generateContent: () => {
      const { prompt } = data
      return `Generate content based on this prompt:
${prompt}`
    }
  }

  const builder = prompts[operation]
  return builder ? builder() : data.prompt || ''
}

async function callOllamaWithRetry(prompt, model = OLLAMA_MODEL, maxTokens = 2048, temperature = 0.7, retries = 0) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT)

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
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      throw new Error(`Ollama returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    return data.response || ''
  } catch (error) {
    if (retries < MAX_RETRIES) {
      logger.warn({ attempt: retries + 1, error: error.message }, 'Retrying Ollama request')
      await new Promise(r => setTimeout(r, 1000 * (retries + 1)))
      return callOllamaWithRetry(prompt, model, maxTokens, temperature, retries + 1)
    }
    throw error
  }
}

async function processRequest(request) {
  const available = await checkOllamaHealth()
  if (!available) {
    throw new Error('OLLAMA_UNAVAILABLE')
  }

  const prompt = buildPrompt(request)
  if (!prompt) {
    throw new Error('INVALID_REQUEST')
  }

  const raw = await callOllamaWithRetry(prompt)

  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  const arrayMatch = raw.match(/\[[\s\S]*\]/)

  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0])
    } catch {
      return { raw }
    }
  }

  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0])
    } catch {
      return { raw }
    }
  }

  return { raw }
}

async function generateSection(data) {
  return processRequest({ operation: 'generateSection', data })
}

async function suggestCopy(data) {
  return processRequest({ operation: 'suggestCopy', data })
}

async function generateSEOMeta(data) {
  return processRequest({ operation: 'generateSEOMeta', data })
}

async function recommendTemplates(data) {
  return processRequest({ operation: 'recommendTemplates', data })
}

async function generateContent(data) {
  const response = await callOllamaWithRetry(data.prompt, data.model, data.maxTokens, data.temperature)
  return { content: response, model: data.model || OLLAMA_MODEL }
}

module.exports = {
  checkOllamaHealth,
  generateSection,
  suggestCopy,
  generateSEOMeta,
  recommendTemplates,
  generateContent,
  OLLAMA_MODEL,
}
