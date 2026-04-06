# Error Codes

API error responses include standardized error codes and messages.

## Response Format

```json
{
  "success": false,
  "message": "Human-readable message",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

## HTTP Status Codes

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing auth |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Error Codes

### Authentication (AUTH_)

| Code | Status | Description |
|------|--------|-------------|
| `AUTH_INVALID_CREDENTIALS` | 401 | Email or password incorrect |
| `AUTH_TOKEN_EXPIRED` | 401 | Access token has expired |
| `AUTH_TOKEN_INVALID` | 401 | Access token is invalid |
| `AUTH_REFRESH_TOKEN_EXPIRED` | 401 | Refresh token has expired |
| `AUTH_REFRESH_TOKEN_INVALID` | 401 | Refresh token is invalid |
| `AUTH_EMAIL_NOT_VERIFIED` | 403 | Email not verified |
| `AUTH_ACCOUNT_LOCKED` | 403 | Account locked |
| `AUTH_API_KEY_INVALID` | 401 | API key is invalid |
| `AUTH_API_KEY_EXPIRED` | 401 | API key has expired |

### User (USER_)

| Code | Status | Description |
|------|--------|-------------|
| `USER_NOT_FOUND` | 404 | User not found |
| `USER_EMAIL_EXISTS` | 409 | Email already registered |
| `USER_INVALID_INPUT` | 400 | Invalid user input |

### Website (WEBSITE_)

| Code | Status | Description |
|------|--------|-------------|
| `WEBSITE_NOT_FOUND` | 404 | Website not found |
| `WEBSITE_SLUG_EXISTS` | 409 | Website slug already exists |
| `WEBSITE_LIMIT_REACHED` | 422 | Maximum websites limit reached |
| `WEBSITE_ACCESS_DENIED` | 403 | Not owner of website |

### Page (PAGE_)

| Code | Status | Description |
|------|--------|-------------|
| `PAGE_NOT_FOUND` | 404 | Page not found |
| `PAGE_SLUG_EXISTS` | 409 | Page slug already exists in website |
| `PAGE_LIMIT_REACHED` | 422 | Maximum pages limit reached |

### Template (TEMPLATE_)

| Code | Status | Description |
|------|--------|-------------|
| `TEMPLATE_NOT_FOUND` | 404 | Template not found |
| `TEMPLATE_UNAVAILABLE` | 422 | Template not available |

### Webhook (WEBHOOK_)

| Code | Status | Description |
|------|--------|-------------|
| `WEBHOOK_NOT_FOUND` | 404 | Webhook not found |
| `WEBHOOK_URL_INVALID` | 400 | Webhook URL is invalid |
| `WEBHOOK_DELIVERY_FAILED` | 500 | Webhook delivery failed |

### Rate Limiting (RATE_)

| Code | Status | Description |
|------|--------|-------------|
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

### Validation (VALIDATION_)

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_FAILED` | 422 | Input validation failed |
| `VALIDATION_INVALID_EMAIL` | 400 | Invalid email format |
| `VALIDATION_INVALID_PASSWORD` | 400 | Password too weak |

---

## Error Handling Examples

### JavaScript

```javascript
try {
  const response = await fetch('/api/v1/websites', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    const error = await response.json();
    
    switch (error.error?.code) {
      case 'AUTH_TOKEN_EXPIRED':
        // Refresh token and retry
        await refreshAccessToken();
        break;
      case 'WEBSITE_NOT_FOUND':
        // Handle missing website
        break;
      default:
        console.error('API Error:', error.message);
    }
  }
} catch (err) {
  console.error('Network error:', err);
}
```

### Python

```python
import requests

try:
    response = requests.get(
        "https://api.example.com/v1/websites",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 429:
        # Handle rate limiting
        retry_after = int(response.headers.get("Retry-After", 60))
        time.sleep(retry_after)
    elif response.status_code == 401:
        # Refresh token
        refresh_token()
    elif not response.ok:
        error = response.json()
        print(f"API Error: {error['message']}")
except requests.RequestException as e:
    print(f"Network error: {e}")
```

---

## Rate Limit Headers

When rate limited, response includes headers:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Max requests per window |
| `X-RateLimit-Remaining` | Remaining requests |
| `X-RateLimit-Reset` | Unix timestamp when limit resets |
| `Retry-After` | Seconds to wait (429 only) |