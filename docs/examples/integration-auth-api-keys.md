# Integration Tutorial: Authentication & API Key Management

This tutorial walks you through authenticating with the DJ Technologies API and managing API keys for programmatic access.

## Overview

The platform supports two authentication methods:

1. **JWT Tokens** — For user sessions (login/logout flows)
2. **API Keys** — For server-to-server integration and automation

### Token Lifecycle

```
┌──────────────┐     Login      ┌────────────────┐
│   User       │───────────────►│  Access Token  │
│   Credentials│                │  (15 min TTL)   │
└──────────────┘                └────────┬───────┘
                                         │
                              Token expires?
                               ┌─────┴─────┐
                              Yes          No
                               │           │
                    ┌──────────▼──┐    Use token
                    │ Refresh Token│    for API calls
                    │ (7 day TTL) │
                    └──────┬──────┘
                           │
                    Expired?
                   ┌───┴───┐
                  Yes      No
                   │       │
              Re-login   Refresh
              required   token
```

## Tutorial 1: User Authentication Flow

### Step 1: Register a New Account

```javascript
const response = await fetch('http://localhost:4000/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Developer',
    email: 'john@example.com',
    password: 'SecureP@ss123',
  }),
});

const data = await response.json();
console.log(data);
// {
//   success: true,
//   data: {
//     user: { id: '...', email: 'john@example.com', name: 'John Developer' },
//     accessToken: 'eyJhbGci...',
//     refreshToken: 'eyJhbGci...'
//   },
//   message: 'User registered successfully'
// }
```

**cURL equivalent:**

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Developer",
    "email": "john@example.com",
    "password": "SecureP@ss123"
  }'
```

**Validation rules:**

| Field | Type | Constraints |
|-------|------|-------------|
| name | string | 1-100 characters |
| email | string | Valid email format, must be unique |
| password | string | Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number |

### Step 2: Login and Get Tokens

```javascript
const loginResponse = await fetch('http://localhost:4000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecureP@ss123',
  }),
});

const { data } = await loginResponse.json();
const { accessToken, refreshToken } = data;

// Store tokens securely
localStorage.setItem('dj_access_token', accessToken);
localStorage.setItem('dj_refresh_token', refreshToken);
```

### Step 3: Use Access Token for API Calls

```javascript
const websitesResponse = await fetch('http://localhost:4000/api/v1/websites', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const { data } = await websitesResponse.json();
console.log('Your websites:', data.websites);
```

### Step 4: Refresh an Expired Token

```javascript
async function refreshAccessToken(refreshToken) {
  const response = await fetch('http://localhost:4000/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const { data } = await response.json();
  return data.accessToken; // New access token
}

// Usage
const newToken = await refreshAccessToken(refreshToken);
localStorage.setItem('dj_access_token', newToken);
```

### Step 5: Logout

```javascript
await fetch('http://localhost:4000/api/v1/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ refreshToken }),
});

// Clear stored tokens
localStorage.removeItem('dj_access_token');
localStorage.removeItem('dj_refresh_token');
```

## Tutorial 2: API Key Management

API keys are ideal for server-to-server integration, CI/CD pipelines, and automation scripts.

### Step 1: Create an API Key

First, authenticate to get an access token, then:

```javascript
const response = await fetch('http://localhost:4000/api/v1/auth/api-keys', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Production Integration',
    // Optional: restrict permissions
    permissions: ['websites:read', 'websites:write', 'pages:read'],
  }),
});

const { data } = await response.json();
console.log('API Key:', data.key); // Save this - it won't be shown again!
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "key_abc123",
    "name": "Production Integration",
    "key": "dj_live_7f8a9b0c1d2e3f4g5h6i7j8k",
    "permissions": ["websites:read", "websites:write", "pages:read"],
    "createdAt": "2026-04-07T10:00:00.000Z"
  },
  "message": "API key created successfully"
}
```

**Important:** Store the `key` value securely. It will only be shown once during creation.

### Step 2: List API Keys

```javascript
const response = await fetch('http://localhost:4000/api/v1/auth/api-keys', {
  headers: { 'Authorization': `Bearer ${accessToken}` },
});

const { data } = await response.json();
console.log('Your API keys:', data.keys);
```

**Response:**

```json
{
  "success": true,
  "data": {
    "keys": [
      {
        "id": "key_abc123",
        "name": "Production Integration",
        "keyPreview": "dj_live_7f8a...7j8k",
        "permissions": ["websites:read", "websites:write", "pages:read"],
        "lastUsedAt": "2026-04-07T12:00:00.000Z",
        "createdAt": "2026-04-07T10:00:00.000Z"
      }
    ]
  }
}
```

### Step 3: Use API Key for Authentication

API keys can be used instead of JWT tokens for API access:

```javascript
const response = await fetch('http://localhost:4000/api/v1/websites', {
  headers: {
    'Authorization': `Bearer dj_live_7f8a9b0c1d2e3f4g5h6i7j8k`,
  },
});
```

### Step 4: Revoke an API Key

```javascript
const response = await fetch('http://localhost:4000/api/v1/auth/api-keys/key_abc123', {
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${accessToken}` },
});

console.log('API key revoked');
```

**Best Practices for API Keys:**

- Store API keys in environment variables, never in code repositories
- Use the principle of least privilege — only grant necessary permissions
- Rotate API keys regularly (every 90 days recommended)
- Monitor API key usage via the `lastUsedAt` field
- Revoke compromised or unused keys immediately

## Tutorial 3: Password Reset Flow

### Step 1: Request Password Reset

```javascript
await fetch('http://localhost:4000/api/v1/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
  }),
});
```

The user will receive an email with a reset token.

### Step 2: Reset Password with Token

```javascript
await fetch('http://localhost:4000/api/v1/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'reset-token-from-email',
    password: 'NewSecureP@ss456',
  }),
});
```

## Complete Authentication Client

Here's a reusable authentication client class:

```javascript
class DJAuthClient {
  constructor(baseUrl = 'http://localhost:4000/api/v1') {
    this.baseUrl = baseUrl;
    this.accessToken = null;
    this.refreshToken = null;
  }

  async register(userData) {
    const response = await this._request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this._storeTokens(response.data);
    return response;
  }

  async login(credentials) {
    const response = await this._request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this._storeTokens(response.data);
    return response;
  }

  async logout() {
    if (this.refreshToken) {
      await this._request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
    }
    this._clearTokens();
  }

  async createApiKey(name, permissions = []) {
    const response = await this._request('/auth/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name, permissions }),
    });
    return response.data;
  }

  async listApiKeys() {
    const response = await this._request('/auth/api-keys');
    return response.data.keys;
  }

  async revokeApiKey(keyId) {
    await this._request(`/auth/api-keys/${keyId}`, { method: 'DELETE' });
  }

  async _request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new DJAuthError(data.message, data.code, response.status);
    }

    return data;
  }

  _storeTokens(data) {
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
  }

  _clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
  }
}

class DJAuthError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'DJAuthError';
    this.code = code;
    this.status = status;
  }
}

// Usage
const auth = new DJAuthClient();

await auth.register({
  name: 'John',
  email: 'john@example.com',
  password: 'SecureP@ss123',
});

const key = await auth.createApiKey('My Integration');
console.log('Created API key:', key.key);
```

## Error Handling

Common authentication errors:

| Error Code | HTTP Status | Description | Solution |
|-----------|-------------|-------------|----------|
| AUTH_INVALID_CREDENTIALS | 401 | Wrong email or password | Verify credentials |
| AUTH_TOKEN_EXPIRED | 401 | Access token expired | Use refresh token |
| AUTH_TOKEN_INVALID | 401 | Token is malformed or revoked | Re-authenticate |
| AUTH_INSUFFICIENT_PERMISSIONS | 403 | API key lacks required permissions | Create key with broader permissions |
| AUTH_API_KEY_REVOKED | 401 | API key has been revoked | Create new API key |
| AUTH_RATE_LIMIT | 429 | Too many authentication attempts | Wait and retry |

## Next Steps

- Read the [API Reference](openapi.yaml) for all available endpoints
- Follow the [Build Website Programmatically](examples/javascript.md) tutorial
- Set up [Webhook Integration](webhooks.md) for real-time events
- Review [Error Handling Guide](errors.md) for complete error reference

## Security Best Practices

1. **Never commit tokens or API keys to source control**
2. **Use HTTPS in production** — never send tokens over unencrypted connections
3. **Store refresh tokens securely** — httpOnly cookies preferred for web apps
4. **Implement token rotation** — refresh tokens are single-use
5. **Validate tokens server-side** — always verify token authenticity
6. **Use short-lived access tokens** — 15 minutes is the default for a reason
7. **Implement rate limiting** — protect against brute force attacks
