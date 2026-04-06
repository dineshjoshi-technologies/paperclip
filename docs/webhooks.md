# Webhooks

Configure webhooks to receive real-time notifications about events in your account.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/webhooks` | List webhooks |
| POST | `/v1/webhooks` | Create webhook |
| GET | `/v1/webhooks/:id` | Get webhook |
| PATCH | `/v1/webhooks/:id` | Update webhook |
| DELETE | `/v1/webhooks/:id` | Delete webhook |
| POST | `/v1/webhooks/:id/test` | Send test event |

---

## Webhook Events

### User Events

| Event | Description |
|-------|-------------|
| `user.created` | New user registered |
| `user.email_verified` | User verified email |
| `user.password_reset` | Password was reset |

### Website Events

| Event | Description |
|-------|-------------|
| `website.created` | New website created |
| `website.updated` | Website updated |
| `website.deleted` | Website deleted |
| `website.published` | Website published |
| `website.archived` | Website archived |

### Page Events

| Event | Description |
|-------|-------------|
| `page.created` | New page created |
| `page.updated` | Page updated |
| `page.deleted` | Page deleted |

---

## Webhook Payload

All webhook payloads follow this format:

```json
{
  "id": "evt_123abc",
  "type": "website.published",
  "createdAt": "2024-01-15T10:30:00Z",
  "data": {
    "websiteId": "uuid",
    "userId": "uuid",
    "slug": "my-website",
    "status": "PUBLISHED"
  }
}
```

### Payload Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique event ID |
| type | string | Event type |
| createdAt | datetime | Event timestamp |
| data | object | Event-specific data |

---

## Create Webhook

**Endpoint:** `POST /v1/webhooks`

**Auth Required:** Yes

### Request

```json
{
  "url": "https://your-server.com/webhooks",
  "events": ["website.published", "website.deleted"],
  "secret": "your_webhook_secret"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| url | string | Yes | HTTPS endpoint to receive events |
| events | array | Yes | Array of event types to subscribe |
| secret | string | No | Secret for signature verification |

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://your-server.com/webhooks",
    "events": ["website.published", "website.deleted"],
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Verifying Signatures

All webhook requests include a `X-Webhook-Signature` header. Verify it using HMAC SHA-256:

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// In your webhook handler
const signature = req.headers['x-webhook-signature'];
const payload = JSON.stringify(req.body);

if (!verifySignature(payload, signature, webhookSecret)) {
  return res.status(401).send('Invalid signature');
}
```

---

## Retry Policy

Failed webhook deliveries are retried with exponential backoff:

| Attempt | Delay |
|---------|-------|
| 1 | Immediate |
| 2 | 1 minute |
| 3 | 5 minutes |
| 4 | 30 minutes |
| 5 | 2 hours |

After 5 failed attempts, the webhook is marked as failed and no further retries are made.

---

## Test Webhook

Send a test event to verify your webhook endpoint.

**Endpoint:** `POST /v1/webhooks/:id/test`

### Response (200 OK)

```json
{
  "success": true,
  "message": "Test event sent"
}
```