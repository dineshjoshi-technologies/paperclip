const nodemailer = require('nodemailer')
const Handlebars = require('handlebars')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

let transporter = null

const createTransporter = () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  }
  
  if (process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: 'resend.smtp.com',
      port: 587,
      secure: false,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY
      }
    })
  }
  
  return null
}

const getTemplate = async (name) => {
  const template = await prisma.emailTemplate.findUnique({ where: { name } })
  if (!template || !template.isActive) {
    return null
  }
  return template
}

const compileTemplate = (bodyHtml, variables) => {
  try {
    const template = Handlebars.compile(bodyHtml)
    return template(variables || {})
  } catch (error) {
    console.error('Template compilation error:', error)
    return bodyHtml
  }
}

const compileTextTemplate = (bodyText, variables) => {
  if (!bodyText) return null
  try {
    const template = Handlebars.compile(bodyText)
    return template(variables || {})
  } catch (error) {
    return bodyText
  }
}

const shouldSendEmail = async (userId, emailType) => {
  if (!userId) return true
  
  const preference = await prisma.emailPreference.findUnique({
    where: { userId_emailType: { userId, emailType } }
  })
  
  return preference ? preference.isEnabled : true
}

const sendEmail = async ({ to, templateName, subject, variables, userId, htmlBody, textBody }) => {
  const emailLog = await prisma.emailLog.create({
    data: {
      userId,
      email: to,
      templateName,
      subject,
      status: 'PENDING'
    }
  })

  if (!transporter) {
    console.log(`[EMAIL] Test mode - would send email to ${to}`)
    console.log(`[EMAIL] Subject: ${subject}`)
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { status: 'FAILED', errorMessage: 'No email transporter configured', sentAt: new Date() }
    })
    return { success: false, logId: emailLog.id }
  }

  if (userId && !(await shouldSendEmail(userId, templateName))) {
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { status: 'FAILED', errorMessage: 'User unsubscribed from this email type', sentAt: new Date() }
    })
    return { success: false, logId: emailLog.id, reason: 'unsubscribed' }
  }

  try {
    let html = htmlBody
    let text = textBody

    if (!html && templateName) {
      const template = await getTemplate(templateName)
      if (template) {
        html = compileTemplate(template.bodyHtml, variables)
        text = compileTextTemplate(template.bodyText, variables)
      }
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      to,
      subject,
      html,
      text
    }

    await transporter.sendMail(mailOptions)

    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { status: 'SENT', sentAt: new Date() }
    })

    return { success: true, logId: emailLog.id }
  } catch (error) {
    console.error('[EMAIL] Send failed:', error.message)
    
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { status: 'FAILED', errorMessage: error.message, retryCount: { increment: 1 } }
    })

    return { success: false, logId: emailLog.id, error: error.message }
  }
}

const retryFailedEmails = async () => {
  const failedLogs = await prisma.emailLog.findMany({
    where: {
      status: 'FAILED',
      retryCount: { lt: 3 },
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }
  })

  for (const log of failedLogs) {
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: 'RETRYING' }
    })

    const success = await sendEmail({
      to: log.email,
      templateName: log.templateName,
      subject: log.subject,
      userId: log.userId
    })

    if (!success.success) {
      await prisma.emailLog.update({
        where: { id: log.id },
        data: { status: 'FAILED', retryCount: { increment: 1 } }
      })
    }
  }
}

const initEmailService = () => {
  transporter = createTransporter()
  
  if (transporter) {
    console.log('[EMAIL] Service initialized with transporter')
  } else {
    console.log('[EMAIL] Running in test mode (no SMTP configured)')
  }

  setInterval(retryFailedEmails, 5 * 60 * 1000)
}

module.exports = {
  sendEmail,
  initEmailService,
  retryFailedEmails,
  shouldSendEmail
}
