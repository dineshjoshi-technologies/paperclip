const express = require('express')
const router = express.Router()
const templateController = require('../controllers/template.controller')
const { authenticate } = require('../middleware/auth')

router.get('/', templateController.getAll)
router.get('/:id', templateController.getById)

// Admin routes
router.post('/', authenticate, templateController.create)
router.put('/:id', authenticate, templateController.update)
router.delete('/:id', authenticate, templateController.delete)

module.exports = router