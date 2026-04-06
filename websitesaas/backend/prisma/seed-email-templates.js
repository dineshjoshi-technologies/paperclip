const { PrismaClient } = require('@prisma/client')
const emailTemplates = require('../templates/email-templates')

const prisma = new PrismaClient()

const seedEmailTemplates = async () => {
  const templates = [
    { name: 'welcome', subject: 'Welcome to {{appName}}!', bodyHtml: emailTemplates.welcome.html, bodyText: emailTemplates.welcome.text },
    { name: 'password-reset', subject: 'Reset Your Password', bodyHtml: emailTemplates['password-reset'].html, bodyText: emailTemplates['password-reset'].text },
    { name: 'email-verification', subject: 'Verify Your Email', bodyHtml: emailTemplates['email-verification'].html, bodyText: emailTemplates['email-verification'].text },
    { name: 'website-published', subject: 'Your Website is Live!', bodyHtml: emailTemplates['website-published'].html, bodyText: emailTemplates['website-published'].text },
    { name: 'payment-confirmation', subject: 'Payment Confirmed', bodyHtml: emailTemplates['payment-confirmation'].html, bodyText: emailTemplates['payment-confirmation'].text },
    { name: 'payment-failed', subject: 'Payment Failed', bodyHtml: emailTemplates['payment-failed'].html, bodyText: emailTemplates['payment-failed'].text },
    { name: 'subscription-expired', subject: 'Subscription Expired', bodyHtml: emailTemplates['subscription-expired'].html, bodyText: emailTemplates['subscription-expired'].text },
    { name: 'admin-new-user', subject: 'New User Registration', bodyHtml: emailTemplates['admin-new-user'].html, bodyText: emailTemplates['admin-new-user'].text }
  ]

  for (const template of templates) {
    await prisma.emailTemplate.upsert({
      where: { name: template.name },
      update: template,
      create: template
    })
  }

  console.log('Email templates seeded successfully')
}

seedEmailTemplates()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
