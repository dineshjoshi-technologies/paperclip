const express = require('express')
const router = express.Router()
const publicController = require('../controllers/public.controller')

router.get('/sites/:siteSlug/nav', publicController.getPublishedSiteNav)
router.get('/sites/:siteSlug/*', publicController.getPublishedSite)
router.get('/sites/:siteSlug', publicController.getPublishedSite)

module.exports = router
