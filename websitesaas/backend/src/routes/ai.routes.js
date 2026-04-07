const express = require('express')
const { logger } = require('../services/logger')
const { checkOllamaHealth } = require('../services/ollama.service')

const router = express.Router()

const generateController = require('../controllers/ai.controller')

router.post('/generate', generateController.generateContent)
router.post('/generate-section', generateController.generateSection)
router.post('/suggest-copy', generateController.suggestCopy)
router.post('/generate-seo', generateController.generateSEOMeta)
router.post('/recommend-templates', generateController.recommendTemplates)
router.get('/health', generateController.healthCheck)
router.post('/status', generateController.statusCheck)

router.use((err, req, res, next) => {
  if (err.message === 'OLLAMA_UNAVAILABLE') {
    res.status(503).json({
      error: 'AI service is temporarily unavailable',
      message: 'Ollama service is not reachable. Please ensure Ollama is running.',
      fallback: true,
    })
  } else if (err.message === 'INVALID_REQUEST') {
    res.status(400).json({
      error: 'Invalid request',
      message: 'Could not generate a valid prompt from the request data',
    })
  } else {
    logger.error({ error: err.message, operation: req.path }, 'AI request failed')
    res.status(502).json({
      error: 'AI generation failed',
      message: err.message || 'Unknown error during content generation',
      fallback: true,
    })
  }
})

module.exports = router
