const invoiceService = require('../../services/invoiceService');
const prisma = require('../../config/prisma');

exports.createInvoice = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { subscriptionId, paymentId, amount, tax, currency, dueDate, lineItems, notes, metadata } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
    }

    const invoice = await invoiceService.createInvoice({
      userId,
      subscriptionId,
      paymentId,
      amount,
      tax: tax || 0,
      currency: currency || 'INR',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      lineItems,
      notes,
      metadata,
    });

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice,
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { invoiceId } = req.params;

    const invoice = await invoiceService.getInvoice(userId, invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, page = 1, limit = 20, orderBy = 'createdAt', orderDir = 'desc' } = req.query;

    const result = await invoiceService.getInvoicesByUser(userId, {
      status,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      orderBy,
      orderDir,
    });

    res.status(200).json({
      success: true,
      data: result.invoices,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { invoiceId } = req.params;
    const bodyData = req.body;

    const invoice = await invoiceService.updateInvoice(userId, invoiceId, bodyData);

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice,
    });
  } catch (error) {
    if (error.message === 'Invoice not found') {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }
    console.error('Update invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.markPaid = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { invoiceId } = req.params;
    const { paymentId } = req.body;

    const invoice = await invoiceService.markInvoicePaid(userId, invoiceId, paymentId);

    res.status(200).json({
      success: true,
      message: 'Invoice marked as paid',
      data: invoice,
    });
  } catch (error) {
    if (error.message === 'Invoice not found') {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }
    if (error.message === 'Invoice is already paid') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    console.error('Mark invoice paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.cancelInvoice = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { invoiceId } = req.params;

    const invoice = await invoiceService.cancelInvoice(userId, invoiceId);

    res.status(200).json({
      success: true,
      message: 'Invoice cancelled successfully',
      data: invoice,
    });
  } catch (error) {
    if (error.message === 'Invoice not found') {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }
    if (error.message === 'Cannot cancel a paid invoice') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    console.error('Cancel invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.getStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const stats = await invoiceService.getInvoiceStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get invoice stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
