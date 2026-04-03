const express = require('express')
const router = express.Router()
const websiteController = require('../controllers/website.controller')
const { authenticate } = require('../middleware/auth')

router.use(authenticate)

router.get('/', websiteController.getAll)
router.post('/', websiteController.create)
router.get('/:slug', websiteController.getBySlug)
router.put('/:id', websiteController.update)
router.delete('/:id', websiteController.delete)
router.post('/:id/publish', websiteController.publish)

module.exports = router