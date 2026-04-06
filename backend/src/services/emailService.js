const nodemailer = require('nodemailer');
const prisma = require('../config/prisma');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.EMAIL_API_KEY && (process.env.EMAIL_PROVIDER === 'resend' || process.env.EMAIL_PROVIDER === 'sendgrid')) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_PROVIDER === 'resend' ? 'resend.smtp.com' : 'smtp.sendgrid.net',
      port: process.env.EMAIL_PROVIDER === 'resend' ? 587 : 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_PROVIDER === 'resend' ? 'resend' : 'apikey',
        pass: process.env.EMAIL_API_KEY,
      },
    });
  } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    console.warn('Email provider not configured. Emails will be logged to console.');
  }

  return transporter;
}

const FROM_ADDRESS = process.env.SMTP_FROM || '"DJ Technologies" <noreply@djtechnologies.com>';

async function logEmail(emailType, recipient, subject, userId = null) {
  try {
    return await prisma.emailLog.create({
      data: {
        emailType,
        recipient,
        subject,
        userId,
        status: 'PENDING',
      },
    });
  } catch (error) {
    console.error('Failed to log email:', error);
    return null;
  }
}

async function updateEmailStatus(logId, status, errorMessage = null) {
  try {
    await prisma.emailLog.update({
      where: { id: logId },
      data: {
        status,
        errorMessage,
        ...(status === 'SENT' && { sentAt: new Date() }),
      },
    });
  } catch (error) {
    console.error('Failed to update email status:', error);
  }
}

async function sendEmail(options) {
  const { to, subject, html, text, emailType, userId } = options;
  const transporter = getTransporter();

  const log = await logEmail(emailType, to, subject, userId);
  const logId = log?.id;

  const mailOptions = {
    from: FROM_ADDRESS,
    to,
    subject,
    html,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    await updateEmailStatus(logId, 'SENT');

    if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST && !process.env.EMAIL_API_KEY) {
      console.log(`[DEV EMAIL] ${emailType}:`, { to: to, subject: subject });
    }

    return { success: true };
  } catch (error) {
    console.error(`Failed to send ${emailType} email:`, error);
    await updateEmailStatus(logId, 'FAILED', error.message);
    return { success: false, error: error.message };
  }
}

async function sendWelcomeEmail(email, name, verificationToken) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verificationUrl = `${frontendUrl}/auth/verify?token=${verificationToken}`;

  return sendEmail({
    to: email,
    subject: 'Welcome to DJ Technologies - Verify Your Email',
    emailType: 'WELCOME',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e293b;">Welcome${name ? `, ${name}` : ''}!</h2>
        <p style="color: #475569; font-size: 16px;">Your account has been created successfully.</p>
        <p style="color: #475569;">Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">Verify Email</a>
        <p style="color: #64748b; font-size: 14px;">Or copy this link: ${verificationUrl}</p>
        <p style="color: #64748b; font-size: 14px;">This link expires in 24 hours.</p>
        <p style="color: #475569;">Get started by building your first website after verification.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="color: #94a3b8; font-size: 12px;">DJ Technologies - Building the future of web creation</p>
      </body>
      </html>
    `,
    text: `Welcome${name ? `, ${name}` : ''}!\n\nYour account has been created successfully.\n\nVerify your email by visiting:\n${verificationUrl}\n\nThis link expires in 24 hours.\n\nGet started by building your first website after verification.`,
  });
}

async function sendPasswordResetEmail(email, name, resetToken) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password',
    emailType: 'PASSWORD_RESET',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e293b;">Reset Your Password</h2>
        <p style="color: #475569; font-size: 16px;">Hello ${name || 'there'},</p>
        <p style="color: #475569;">You requested a password reset. Click the button below to set a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">Reset Password</a>
        <p style="color: #64748b; font-size: 14px;">Or copy this link: ${resetUrl}</p>
        <p style="color: #dc2626; font-size: 14px;">This link expires in 1 hour.</p>
        <p style="color: #475569;">If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="color: #94a3b8; font-size: 12px;">DJ Technologies - Building the future of web creation</p>
      </body>
      </html>
    `,
    text: `Hello ${name || 'there'},\n\nYou requested a password reset. Visit the following link to set a new password:\n\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you did not request this, please ignore this email.`,
  });
}

async function sendWebsitePublishedEmail(email, name, websiteName, websiteUrl) {
  return sendEmail({
    to: email,
    subject: `Your website "${websiteName}" is now live!`,
    emailType: 'WEBSITE_PUBLISHED',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e293b;">Congratulations${name ? `, ${name}` : ''}!</h2>
        <p style="color: #475569; font-size: 16px;">Your website <strong>"${websiteName}"</strong> is now live!</p>
        <a href="${websiteUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">View Your Website</a>
        <p style="color: #475569;">Your website is now accessible to the world. Share it with your audience!</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="color: #94a3b8; font-size: 12px;">DJ Technologies - Building the future of web creation</p>
      </body>
      </html>
    `,
    text: `Congratulations${name ? `, ${name}` : ''}!\n\nYour website "${websiteName}" is now live!\n\nView it at: ${websiteUrl}\n\nYour website is now accessible to the world.`,
  });
}

async function sendPaymentConfirmationEmail(email, name, amount, plan, transactionId) {
  return sendEmail({
    to: email,
    subject: `Payment Confirmed - ${plan} Plan`,
    emailType: 'PAYMENT_CONFIRMATION',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e293b;">Payment Confirmed!</h2>
        <p style="color: #475569; font-size: 16px;">Hello ${name || 'there'},</p>
        <p style="color: #475569;">Your payment has been successfully processed.</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; color: #475569;"><strong>Amount:</strong> ${amount}</p>
          <p style="margin: 8px 0 0 0; color: #475569;"><strong>Plan:</strong> ${plan}</p>
          <p style="margin: 8px 0 0 0; color: #475569;"><strong>Transaction ID:</strong> ${transactionId}</p>
        </div>
        <p style="color: #475569;">Thank you for your subscription!</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="color: #94a3b8; font-size: 12px;">DJ Technologies - Building the future of web creation</p>
      </body>
      </html>
    `,
    text: `Payment Confirmed!\n\nHello ${name || 'there'},\n\nYour payment has been successfully processed.\n\nAmount: ${amount}\nPlan: ${plan}\nTransaction ID: ${transactionId}\n\nThank you for your subscription!`,
  });
}

async function sendPaymentFailedEmail(email, name, amount, plan) {
  return sendEmail({
    to: email,
    subject: `Payment Failed - Action Required`,
    emailType: 'PAYMENT_FAILED',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Payment Failed</h2>
        <p style="color: #475569; font-size: 16px;">Hello ${name || 'there'},</p>
        <p style="color: #475569;">We were unable to process your payment of <strong>${amount}</strong> for the <strong>${plan}</strong> plan.</p>
        <p style="color: #475569;">Please update your payment method to avoid service interruption.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/billing" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">Update Payment Method</a>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="color: #94a3b8; font-size: 12px;">DJ Technologies - Building the future of web creation</p>
      </body>
      </html>
    `,
    text: `Payment Failed\n\nHello ${name || 'there'},\n\nWe were unable to process your payment of ${amount} for the ${plan} plan.\n\nPlease update your payment method.\n\nVisit ${process.env.FRONTEND_URL || 'http://localhost:3000'}/billing`,
  });
}

async function sendSubscriptionExpiredEmail(email, name, plan) {
  return sendEmail({
    to: email,
    subject: `Your Subscription Has Expired`,
    emailType: 'SUBSCRIPTION_EXPIRED',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e293b;">Subscription Expired</h2>
        <p style="color: #475569; font-size: 16px;">Hello ${name || 'there'},</p>
        <p style="color: #475569;">Your <strong>${plan}</strong> subscription has expired.</p>
        <p style="color: #475569;">Renew now to continue accessing premium features.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/billing" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0;">Renew Subscription</a>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="color: #94a3b8; font-size: 12px;">DJ Technologies - Building the future of web creation</p>
      </body>
      </html>
    `,
    text: `Subscription Expired\n\nHello ${name || 'there'},\n\nYour ${plan} subscription has expired.\n\nRenew at ${process.env.FRONTEND_URL || 'http://localhost:3000'}/billing`,
  });
}

async function sendAdminAlertEmail(type, data) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@djtechnologies.com';

  const subjects = {
    ADMIN_NEW_USER: 'New User Registration',
    ADMIN_ABUSE_REPORT: 'Abuse Report Received',
    ADMIN_SUPPORT_TICKET: 'New Support Ticket',
  };

  return sendEmail({
    to: adminEmail,
    subject: `Admin Alert: ${subjects[type]}`,
    emailType: type,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">Admin Alert: ${subjects[type]}</h2>
        <pre style="background: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto;">${JSON.stringify(data, null, 2)}</pre>
      </body>
      </html>
    `,
    text: `Admin Alert: ${subjects[type]}\n\n${JSON.stringify(data, null, 2)}`,
  });
}

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendWebsitePublishedEmail,
  sendPaymentConfirmationEmail,
  sendPaymentFailedEmail,
  sendSubscriptionExpiredEmail,
  sendAdminAlertEmail,
  getTransporter,
};
