# Integration Tutorial: Webhook Integration Setup

This tutorial shows you how to set up, test, and manage webhooks for real-time event notifications.

## Overview

Webhooks allow your application to receive real-time notifications when events occur in the DJ Technologies platform. Instead of polling the API for changes, your server receives HTTP POST requests with event data.

## Tutorial 1: Setting Up Your First Webhook

### Step 1: Create a Webhook Endpoint

First, create an endpoint on your server to receive webhook events:

**Express.js Example:**

```javascript
const express = require('express');
const crypto = require('crypto');
const app = express();

// Important: Use raw body for signature verification
app.post('/webhooks/dj', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = req.body;

  // Verify signature (see Tutorial 2)
  if (!verifyWebhookSignature(payload, signature, process.env.DJ_WEBHOOK_SECRET)) {
    console.error('Invalid webhook signature');
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(payload);
  console.log('Received webhook:', event.type);

  // Handle different event types
  switch (event.type) {
    case 'website.published':
      handleWebsitePublished(event);
      break;
    case 'website.created':
      handleWebsiteCreated(event);
      break;
    case 'page.created':
      handlePageCreated(event);
      break;
    default:
      console.log('Unhandled event type:', event.type);
  }

  // Acknowledge receipt
  res.status(200).json({ received: true });
});

function verifyWebhookSignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

function handleWebsitePublished(event) {
  console.log(`Website ${event.data.websiteId} published!`);
  // Update your database, notify users, etc.
}

app.listen(3001, () => {
  console.log('Webhook server running on port 3001');
});
```

### Step 2: Register the Webhook

```javascript
const response = await fetch('http://localhost:4000/api/v1/webhooks', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://your-server.com/webhooks/dj',
    events: ['website.published', 'website.deleted', 'page.created'],
    secret: process.env.DJ_WEBHOOK_SECRET, // Generate a secure random string
  }),
});

const { data } = await response.json();
console.log('Webhook registered:', data.id);
```

**Important:** Generate a secure webhook secret:

```bash
# Generate a random secret
openssl rand -hex 32
# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Test Your Webhook

```javascript
const response = await fetch(
  'http://localhost:4000/api/v1/webhooks/{webhookId}/test',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  }
);

const result = await response.json();
console.log(result.message); // "Test event sent"
```

Check your server logs to confirm the test event was received and processed correctly.

## Tutorial 2: Handling Webhook Events

### Complete Event Handler

Here's a production-ready webhook handler:

```javascript
const crypto = require('crypto');

class DJWebhookHandler {
  constructor(secret) {
    this.secret = secret;
    this.handlers = new Map();
  }

  // Register event handlers
  on(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType).push(handler);
  }

  // Verify webhook signature
  verifySignature(payload, signature) {
    if (!signature || !this.secret) {
      return false;
    }

    const expected = crypto
      .createHmac('sha256', this.secret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  }

  // Process incoming webhook
  async processWebhook(payload, signature) {
    // 1. Verify signature
    if (!this.verifySignature(payload, signature)) {
      throw new Error('Invalid webhook signature');
    }

    // 2. Parse event
    const event = JSON.parse(payload);

    // 3. Validate event structure
    if (!event.type || !event.id || !event.createdAt) {
      throw new Error('Invalid webhook payload');
    }

    // 4. Process event (with idempotency check)
    if (await this.isDuplicateEvent(event.id)) {
      console.log('Duplicate event received:', event.id);
      return { duplicate: true };
    }

    // 5. Call registered handlers
    const handlers = this.handlers.get(event.type) || [];
    for (const handler of handlers) {
      await handler(event);
    }

    // 6. Mark event as processed
    await this.markEventProcessed(event.id);

    return { processed: true, eventType: event.type };
  }

  async isDuplicateEvent(eventId) {
    // Implement duplicate check using your database or cache
    // This is critical for handling retries
    const processed = await redis.get(`dj:webhook:${eventId}`);
    return processed !== null;
  }

  async markEventProcessed(eventId) {
    // Store event ID with TTL (24 hours)
    await redis.set(`dj:webhook:${eventId}`, '1', 'EX', 86400);
  }
}

// Usage
const webhookHandler = new DJWebhookHandler(process.env.DJ_WEBHOOK_SECRET);

// Register handlers
webhookHandler.on('website.published', async (event) => {
  console.log(`Website published: ${event.data.websiteId}`);
  await updateWebsiteStatus(event.data.websiteId, 'PUBLISHED');
  await notifyUser(event.data.userId, 'Your website is live!');
});

webhookHandler.on('website.deleted', async (event) => {
  console.log(`Website deleted: ${event.data.websiteId}`);
  await cleanupWebsite(event.data.websiteId);
});

webhookHandler.on('page.created', async (event) => {
  console.log(`Page created: ${event.data.pageId}`);
  await syncPageIndex(event.data.pageId);
});
```

### Using with Express

```javascript
app.post('/webhooks/dj', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const result = await webhookHandler.processWebhook(
      req.body,
      req.headers['x-webhook-signature']
    );

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(400).json({ error: error.message });
  }
});
```

## Tutorial 3: Python Webhook Integration

### Flask Example

```python
import hmac
import hashlib
import json
from flask import Flask, request, jsonify

app = Flask(__name__)
WEBHOOK_SECRET = os.environ.get('DJ_WEBHOOK_SECRET')

def verify_signature(payload, signature, secret):
    expected = hmac.new(
        secret.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)

@app.route('/webhooks/dj', methods=['POST'])
def handle_webhook():
    # Get raw payload
    payload = request.get_data()
    signature = request.headers.get('X-Webhook-Signature')
    
    # Verify signature
    if not verify_signature(payload, signature, WEBHOOK_SECRET):
        return jsonify({'error': 'Invalid signature'}), 401
    
    # Parse event
    event = json.loads(payload)
    event_type = event.get('type')
    
    print(f"Received webhook: {event_type}")
    
    # Handle different events
    if event_type == 'website.published':
        handle_website_published(event)
    elif event_type == 'website.deleted':
        handle_website_deleted(event)
    elif event_type == 'page.created':
        handle_page_created(event)
    else:
        print(f"Unhandled event type: {event_type}")
    
    return jsonify({'received': True}), 200

def handle_website_published(event):
    website_id = event['data']['websiteId']
    print(f"Website {website_id} is now live!")
    # Update your database, send notifications, etc.

def handle_website_deleted(event):
    website_id = event['data']['websiteId']
    print(f"Website {website_id} has been deleted")
    # Clean up related data

if __name__ == '__main__':
    app.run(port=3001)
```

## Tutorial 4: Managing Multiple Webhooks

### List Webhooks

```javascript
const response = await fetch('http://localhost:4000/api/v1/webhooks', {
  headers: { 'Authorization': `Bearer ${accessToken}` },
});

const { data } = await response.json();
console.log('Registered webhooks:', data.webhooks);
// [
//   {
//     id: 'whk_abc123',
//     url: 'https://your-server.com/webhooks/dj',
//     events: ['website.published', 'website.deleted'],
//     isActive: true,
//     lastDeliveryAt: '2026-04-07T12:00:00Z',
//     failures: 0,
//     createdAt: '2026-04-07T10:00:00Z'
//   }
// ]
```

### Update Webhook

```javascript
await fetch('http://localhost:4000/api/v1/webhooks/whk_abc123', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    events: ['website.published', 'website.deleted', 'page.created', 'page.deleted'],
    isActive: true,
  }),
});
```

### Monitor Webhook Health

```javascript
const response = await fetch(
  'http://localhost:4000/api/v1/webhooks/whk_abc123',
  {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  }
);

const { data } = await response.json();
console.log('Webhook health:', {
  lastDelivery: data.lastDeliveryAt,
  failures: data.failures,
  status: data.isActive ? 'active' : 'inactive',
});
```

### Disable/Enable Webhook

```javascript
// Disable
await fetch('http://localhost:4000/api/v1/webhooks/whk_abc123', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ isActive: false }),
});

// Enable
await fetch('http://localhost:4000/api/v1/webhooks/whk_abc123', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ isActive: true }),
});
```

### Delete Webhook

```javascript
await fetch('http://localhost:4000/api/v1/webhooks/whk_abc123', {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${accessToken}` },
});

console.log('Webhook deleted');
```

## Event Reference

Complete list of available webhook events:

### User Events

| Event | Payload Data | When Triggered |
|-------|-------------|----------------|
| `user.created` | userId, email, name | New user registers |
| `user.email_verified` | userId, email | User verifies email |
| `user.password_reset` | userId | User resets password |

### Website Events

| Event | Payload Data | When Triggered |
|-------|-------------|----------------|
| `website.created` | websiteId, userId, name | New website created |
| `website.updated` | websiteId, userId, changes | Website settings updated |
| `website.deleted` | websiteId, userId | Website deleted |
| `website.published` | websiteId, userId, url, status | Website published |
| `website.archived` | websiteId, userId | Website archived |

### Page Events

| Event | Payload Data | When Triggered |
|-------|-------------|----------------|
| `page.created` | pageId, websiteId, title | New page added |
| `page.updated` | pageId, websiteId, changes | Page content modified |
| `page.deleted` | pageId, websiteId | Page deleted |

### Example: Website Published Payload

```json
{
  "id": "evt_xyz789",
  "type": "website.published",
  "createdAt": "2026-04-07T15:30:00.000Z",
  "data": {
    "websiteId": "web_abc123",
    "userId": "user_def456",
    "url": "https://myawesomesite.djtechnologies.net",
    "status": "PUBLISHED",
    "publishedAt": "2026-04-07T15:30:00.000Z"
  }
}
```

## Best Practices

### 1. Always Verify Signatures

Never process webhook payloads without verifying the signature. This prevents attackers from spoofing events.

### 2. Implement Idempotency

Webhooks may be delivered multiple times due to retries. Use event IDs to detect duplicates:

```javascript
const processedEvents = new Set();

async function processWebhook(event) {
  if (processedEvents.has(event.id)) {
    return; // Skip duplicate
  }
  
  // Process event...
  processedEvents.add(event.id);
}
```

### 3. Respond Quickly

Acknowledge receipt with a 200 status immediately, then process asynchronously:

```javascript
app.post('/webhooks/dj', async (req, res) => {
  // Respond immediately
  res.status(200).json({ received: true });
  
  // Process in background
  processWebhookAsync(req.body, req.headers['x-webhook-signature']).catch(console.error);
});
```

### 4. Handle Retries Gracefully

The platform retries failed deliveries with exponential backoff. Your endpoint should:

- Return 2xx for successful processing
- Return 4xx for invalid events (stops retries)
- Return 5xx or timeout to trigger retries

### 5. Monitor Webhook Health

Set up alerts for:
- High failure rates (> 10%)
- Webhooks marked as failed after 5 attempts
- Missing events (compare with API polling)

### 6. Use HTTPS Only

Never use HTTP URLs for webhook endpoints in production. Always use HTTPS with valid SSL certificates.

## Troubleshooting

### Webhook Not Receiving Events

1. Verify the webhook URL is accessible from the internet
2. Check your server logs for incoming requests
3. Test with the `/test` endpoint
4. Verify the webhook is `isActive: true`

### Invalid Signature Errors

1. Confirm you're using the same secret when creating the webhook
2. Use raw body for signature verification (not parsed JSON)
3. Check the signature header name: `X-Webhook-Signature`

### Duplicate Events

1. Implement idempotency checking using event IDs
2. Store processed event IDs with a TTL
3. Return 200 for duplicate events to mark them as received

### Timeout Issues

1. Keep webhook response under 30 seconds
2. Process events asynchronously
3. Check your server's timeout configuration

## Next Steps

- Learn about [Rate Limits](../rate-limits.md) for API requests
- Set up [Error Handling](../errors.md) for robust integrations
- See the full [API Reference](../openapi.yaml)
