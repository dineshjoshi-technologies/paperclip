const prisma = require('../config/prisma');

async function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  const count = await prisma.invoice.count();
  const sequence = String(count + 1).padStart(6, '0');
  
  return `INV-${year}${month}-${sequence}`;
}

async function createInvoice(data) {
  const {
    userId,
    subscriptionId,
    paymentId,
    amount,
    tax = 0,
    currency = 'INR',
    dueDate,
    lineItems,
    notes,
    metadata,
  } = data;

  const invoiceNumber = await generateInvoiceNumber();
  const total = amount + tax;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      userId,
      subscriptionId: subscriptionId || null,
      paymentId: paymentId || null,
      amount,
      tax,
      total,
      currency,
      status: 'DRAFT',
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      lineItems: lineItems || null,
      notes: notes || null,
      metadata: metadata || null,
    },
  });

  return invoice;
}

async function getInvoice(userId, invoiceId) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      userId,
    },
    include: {
      payment: true,
      subscription: true,
    },
  });

  return invoice;
}

async function getInvoicesByUser(userId, options = {}) {
  const {
    status,
    page = 1,
    limit = 20,
    orderBy = 'createdAt',
    orderDir = 'desc',
  } = options;

  const where = {
    userId,
    ...(status && { status }),
  };

  const skip = (page - 1) * limit;

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        payment: {
          select: {
            id: true,
            status: true,
            providerPaymentId: true,
          },
        },
        subscription: {
          select: {
            id: true,
            plan: true,
            status: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        [orderBy]: orderDir,
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  return {
    invoices,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function updateInvoice(userId, invoiceId, data) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      userId,
    },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  const allowedUpdates = ['status', 'dueDate', 'notes', 'lineItems', 'metadata'];
  const updateData = {};

  for (const key of allowedUpdates) {
    if (data[key] !== undefined) {
      updateData[key] = data[key];
    }
  }

  // If marking as paid, set paidAt
  if (updateData.status === 'PAID' && invoice.status !== 'PAID') {
    updateData.paidAt = new Date();
  }

  const updated = await prisma.invoice.update({
    where: { id: invoiceId },
    data: updateData,
  });

  return updated;
}

async function markInvoicePaid(userId, invoiceId, paymentId = null) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      userId,
    },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  if (invoice.status === 'PAID') {
    throw new Error('Invoice is already paid');
  }

  const updated = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      ...(paymentId && { paymentId }),
    },
  });

  return updated;
}

async function cancelInvoice(userId, invoiceId) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      userId,
    },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  if (invoice.status === 'PAID') {
    throw new Error('Cannot cancel a paid invoice');
  }

  const updated = await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: 'CANCELLED' },
  });

  return updated;
}

async function getInvoiceStats(userId) {
  const [total, paid, outstanding, overdue] = await Promise.all([
    prisma.invoice.count({ where: { userId } }),
    prisma.invoice.aggregate({
      where: { userId, status: 'PAID' },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: { userId, status: { in: ['ISSUED', 'DRAFT'] } },
      _sum: { total: true },
    }),
    prisma.invoice.count({
      where: {
        userId,
        dueDate: { lt: new Date() },
        status: { notIn: ['PAID', 'CANCELLED'] },
      },
    }),
  ]);

  return {
    totalInvoices: total,
    totalPaid: paid._sum.total || 0,
    totalOutstanding: outstanding._sum.total || 0,
    overdueCount: overdue,
  };
}

async function markOverdueInvoices() {
  const result = await prisma.invoice.updateMany({
    where: {
      status: 'ISSUED',
      dueDate: { lt: new Date() },
    },
    data: { status: 'OVERDUE' },
  });

  return result.count;
}

module.exports = {
  generateInvoiceNumber,
  createInvoice,
  getInvoice,
  getInvoicesByUser,
  updateInvoice,
  markInvoicePaid,
  cancelInvoice,
  getInvoiceStats,
  markOverdueInvoices,
};
