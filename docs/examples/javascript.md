# JavaScript Examples

Code examples for the Website SaaS API in JavaScript.

## Setup

```javascript
const API_BASE = 'https://api.yourdomain.com/v1';

class WebsiteAPI {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.apiKey = null;
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  async request(method, endpoint, data = null) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    } else if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const options = { method, headers };
    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
      throw new APIError(result.message, result.error?.code, response.status);
    }

    return result;
  }
}

class APIError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}
```

## Authentication

### Register

```javascript
const api = new WebsiteAPI();

const result = await api.request('POST', '/auth/register', {
  email: 'user@example.com',
  password: 'SecurePass123!',
  name: 'John Doe'
});

console.log(result.data.accessToken);
api.accessToken = result.data.accessToken;
```

### Login

```javascript
const api = new WebsiteAPI();

const result = await api.request('POST', '/auth/login', {
  email: 'user@example.com',
  password: 'SecurePass123!'
});

api.accessToken = result.data.accessToken;
console.log('Logged in:', result.data.user);
```

### Refresh Token

```javascript
const result = await api.request('POST', '/auth/refresh', {
  refreshToken: currentRefreshToken
});

api.accessToken = result.data.accessToken;
```

## Websites

### List Websites

```javascript
const result = await api.request('GET', '/websites');
console.log(result.data);
```

### Create Website

```javascript
const result = await api.request('POST', '/websites', {
  name: 'My Website',
  slug: 'my-website',
  templateId: 'optional-template-id'
});
console.log('Created:', result.data);
```

### Get Website

```javascript
const result = await api.request('GET', '/websites/website-id');
console.log(result.data);
```

### Update Website

```javascript
const result = await api.request('PATCH', '/websites/website-id', {
  name: 'New Name',
  config: { theme: 'dark' }
});
```

### Publish Website

```javascript
const result = await api.request('POST', '/websites/website-id/publish');
console.log('Published:', result.data.status);
```

### Delete Website

```javascript
await api.request('DELETE', '/websites/website-id');
console.log('Deleted');
```

## Pages

### Create Page

```javascript
const result = await api.request('POST', '/websites/website-id/pages', {
  name: 'About',
  slug: 'about',
  content: { title: 'About Us' }
});
```

### Update Page

```javascript
const result = await api.request('PATCH', '/v1/pages/page-id', {
  name: 'Updated Name',
  content: { title: 'New Title' }
});
```

### Delete Page

```javascript
await api.request('DELETE', '/v1/pages/page-id');
```

## Templates

### List Templates

```javascript
const result = await api.request('GET', '/templates?category=business');
console.log(result.data);
```

### Get Template

```javascript
const result = await api.request('GET', '/templates/template-id');
console.log(result.data);
```

## API Keys

### Create API Key

```javascript
const result = await api.request('POST', '/auth/api-keys', {
  name: 'My API Key',
  expiresAt: '2025-12-31T23:59:59Z'
});

const apiKey = result.data.key; // Save this - only shown once!
console.log('API Key:', apiKey);
```

### Use API Key

```javascript
const api = new WebsiteAPI();
api.setApiKey('dj_live_abc123...');

const result = await api.request('GET', '/websites');
```

## Error Handling

```javascript
try {
  const result = await api.request('GET', '/websites');
} catch (error) {
  if (error.status === 401) {
    // Token expired - refresh
    console.log('Token expired, refreshing...');
  } else if (error.status === 429) {
    // Rate limited - wait
    console.log('Rate limited, retry later');
  } else if (error.status === 404) {
    console.log('Resource not found');
  } else {
    console.error('Error:', error.message);
  }
}
```

## Complete Example: Create Website with Pages

```javascript
async function createFullWebsite() {
  try {
    // 1. Login
    const loginResult = await api.request('POST', '/auth/login', {
      email: 'user@example.com',
      password: 'SecurePass123!'
    });
    api.accessToken = loginResult.data.accessToken;

    // 2. List templates
    const templates = await api.request('GET', '/templates');
    const template = templates.data[0];

    // 3. Create website
    const website = await api.request('POST', '/websites', {
      name: 'My Business Site',
      slug: 'my-business',
      templateId: template.id
    });

    // 4. Create pages
    await api.request('POST', `/websites/${website.data.id}/pages`, {
      name: 'Home',
      slug: 'home',
      content: { hero: { heading: 'Welcome' } }
    });

    await api.request('POST', `/websites/${website.data.id}/pages`, {
      name: 'About',
      slug: 'about',
      content: { title: 'About Us' }
    });

    // 5. Publish
    const published = await api.request('POST', `/websites/${website.data.id}/publish`);
    console.log('Website published:', published.data.status);

  } catch (error) {
    console.error('Error:', error.message);
  }
}
```