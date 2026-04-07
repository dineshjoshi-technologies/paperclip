const express = require('express');
const router = express.Router();
const invoiceController = require('../../controllers/invoice/invoiceController');
const { authenticate, authorize } = require('../../middleware/authMiddleware');

router.use(authenticate);

router.get('/stats', invoiceController.getStats);
router.get('/:invoiceId', invoiceController.getInvoice);
router.get('/', invoiceController.getInvoices);
router.post('/', invoiceController.createInvoice);
router.put('/:invoiceId', invoiceController.updateInvoice);
router.post('/:invoiceId/mark-paid', invoiceController.markPaid);
router.post('/:invoiceId/cancel', invoiceController.cancelInvoice);

module.exports = router;
