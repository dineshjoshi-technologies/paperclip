const aiService = require('../services/ollama.service')
const { logger } = require('../services/logger')

exports.generateContent = async (req, res) => {
  const { prompt, model, maxTokens, temperature } = req.body
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  const startTime = Date.now()
  const result = await aiService.generateContent({ prompt, model, maxTokens, temperature })
  const duration = Date.now() - startTime

  res.json({ ...result, duration })
}

exports.generateSection = async (req, res) => {
  const { sectionType, prompt, tone, targetAudience } = req.body
  if (!sectionType || !prompt) {
    return res.status(400).json({ error: 'sectionType and prompt are required' })
  }

  const startTime = Date.now()
  const section = await aiService.generateSection({ sectionType, prompt, tone, targetAudience })
  const duration = Date.now() - startTime

  res.json({ section, duration })
}

exports.suggestCopy = async (req, res) => {
  const { field, currentValue, context } = req.body
  if (!field || !context) {
    return res.status(400).json({ error: 'field and context are required' })
  }

  const startTime = Date.now()
  const suggestions = await aiService.suggestCopy({ field, currentValue, context })
  const duration = Date.now() - startTime

  res.json({ suggestions, duration })
}

exports.generateSEOMeta = async (req, res) => {
  const { pageTitle, description, keywords, industry, targetAudience } = req.body
  if (!pageTitle) {
    return res.status(400).json({ error: 'pageTitle is required' })
  }

  const startTime = Date.now()
  const seo = await aiService.generateSEOMeta({ pageTitle, description, keywords, industry, targetAudience })
  const duration = Date.now() - startTime

  res.json({ seo, duration })
}

exports.recommendTemplates = async (req, res) => {
  const { industry, businessType, features } = req.body
  if (!industry) {
    return res.status(400).json({ error: 'industry is required' })
  }

  const startTime = Date.now()
  const templates = await aiService.recommendTemplates({ industry, businessType, features })
  const duration = Date.now() - startTime

  res.json({ templates, duration })
}

exports.healthCheck = async (req, res) => {
  const health = await aiService.checkOllamaHealth()
  res.json({
    status: health ? 'available' : 'unavailable',
    model: aiService.OLLAMA_MODEL,
    url: process.env.OLLAMA_URL || 'http://localhost:11434',
    timestamp: new Date().toISOString(),
  })
}

exports.statusCheck = async (req, res) => {
  const health = await aiService.checkOllamaHealth()
  res.json({
    available: health,
    serverAvailable: health,
    usesServerProxy: true,
    model: aiService.OLLAMA_MODEL,
  })
}
