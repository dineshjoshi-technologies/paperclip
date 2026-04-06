const welcomeEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #333;">Welcome to {{appName}}!</h1>
  <p>Hi {{name}},</p>
  <p>Thank you for joining us! We're excited to have you on board.</p>
  <p>With your account, you can:</p>
  <ul>
    <li>Create beautiful websites with our drag-and-drop builder</li>
    <li>Choose from professional templates</li>
    <li>Publish your site with a custom domain</li>
    <li>And much more!</li>
  </ul>
  <p><a href="{{activationUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Get Started</a></p>
  <p>If you didn't create this account, please ignore this email.</p>
  <hr>
  <p style="color: #666; font-size: 12px;">&copy; {{year}} {{appName}}. All rights reserved.</p>
</body>
</html>
`

const welcomeEmailText = `
Welcome to {{appName}}!

Hi {{name}},

Thank you for joining us! We're excited to have you on board.

With your account, you can:
- Create beautiful websites with our drag-and-drop builder
- Choose from professional templates
- Publish your site with a custom domain
- And much more!

Visit {{activationUrl}} to get started.

If you didn't create this account, please ignore this email.

&copy; {{year}} {{appName}}. All rights reserved.
`

const passwordResetEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #333;">Reset Your Password</h1>
  <p>Hi {{name}},</p>
  <p>We received a request to reset your password. Click the button below to create a new password:</p>
  <p><a href="{{resetUrl}}" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
  <p>This link will expire in {{expiryHours}} hours.</p>
  <p>If you didn't request a password reset, please ignore this email.</p>
  <hr>
  <p style="color: #666; font-size: 12px;">&copy; {{year}} {{appName}}. All rights reserved.</p>
</body>
</html>
`

const passwordResetEmailText = `
Reset Your Password

Hi {{name}},

We received a request to reset your password. Click the link below to create a new password:

{{resetUrl}}

This link will expire in {{expiryHours}} hours.

If you didn't request a password reset, please ignore this email.

&copy; {{year}} {{appName}}. All rights reserved.
`

const emailVerificationEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #333;">Verify Your Email</h1>
  <p>Hi {{name}},</p>
  <p>Please verify your email address by clicking the button below:</p>
  <p><a href="{{verifyUrl}}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify Email</a></p>
  <p>This link will expire in {{expiryHours}} hours.</p>
  <hr>
  <p style="color: #666; font-size: 12px;">&copy; {{year}} {{appName}}. All rights reserved.</p>
</body>
</html>
`

const websitePublishedEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #333;">Your Website is Live!</h1>
  <p>Hi {{name}},</p>
  <p>Great news! Your website <strong>{{websiteName}}</strong> is now published and live.</p>
  <p><a href="{{websiteUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View Your Website</a></p>
  <p>Share it with the world!</p>
  <hr>
  <p style="color: #666; font-size: 12px;">&copy; {{year}} {{appName}}. All rights reserved.</p>
</body>
</html>
`

const paymentConfirmationEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #333;">Payment Confirmed</h1>
  <p>Hi {{name}},</p>
  <p>Thank you for your payment! Your subscription is now active.</p>
  <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
    <p><strong>Amount:</strong> {{amount}}</p>
    <p><strong>Plan:</strong> {{planName}}</p>
    <p><strong>Transaction ID:</strong> {{transactionId}}</p>
  </div>
  <p><a href="{{dashboardUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Go to Dashboard</a></p>
  <hr>
  <p style="color: #666; font-size: 12px;">&copy; {{year}} {{appName}}. All rights reserved.</p>
</body>
</html>
`

const paymentFailedEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #333;">Payment Failed</h1>
  <p>Hi {{name}},</p>
  <p>We were unable to process your payment for your {{planName}} subscription.</p>
  <p><strong>Amount:</strong> {{amount}}</p>
  <p>Please update your payment method to avoid service interruption.</p>
  <p><a href="{{billingUrl}}" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Update Payment</a></p>
  <hr>
  <p style="color: #666; font-size: 12px;">&copy; {{year}} {{appName}}. All rights reserved.</p>
</body>
</html>
`

const subscriptionExpiredEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #333;">Subscription Expired</h1>
  <p>Hi {{name}},</p>
  <p>Your {{planName}} subscription has expired.</p>
  <p>To continue using our services, please renew your subscription.</p>
  <p><a href="{{renewUrl}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Renew Now</a></p>
  <hr>
  <p style="color: #666; font-size: 12px;">&copy; {{year}} {{appName}}. All rights reserved.</p>
</body>
</html>
`

const adminNewUserAlert = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #333;">New User Registration</h1>
  <p>A new user has registered on the platform.</p>
  <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
    <p><strong>Email:</strong> {{email}}</p>
    <p><strong>Name:</strong> {{name}}</p>
    <p><strong>Date:</strong> {{createdAt}}</p>
  </div>
  <hr>
  <p style="color: #666; font-size: 12px;">{{appName}} Admin Alert</p>
</body>
</html>
`

module.exports = {
  welcome: { subject: 'Welcome to {{appName}}!', html: welcomeEmail, text: welcomeEmailText },
  'password-reset': { subject: 'Reset Your Password', html: passwordResetEmail, text: passwordResetEmailText },
  'email-verification': { subject: 'Verify Your Email', html: emailVerificationEmail, text: null },
  'website-published': { subject: 'Your Website is Live!', html: websitePublishedEmail, text: null },
  'payment-confirmation': { subject: 'Payment Confirmed', html: paymentConfirmationEmail, text: null },
  'payment-failed': { subject: 'Payment Failed', html: paymentFailedEmail, text: null },
  'subscription-expired': { subject: 'Subscription Expired', html: subscriptionExpiredEmail, text: null },
  'admin-new-user': { subject: 'New User Registration', html: adminNewUserAlert, text: null }
}
