# Rate Limits

API rate limiting to ensure fair usage and platform stability.

## Default Limits

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| Authentication (register) | 5 | 1 minute |
| Authentication (login) | 10 | 1 minute |
| Authentication (password reset) | 3 | 1 hour |
| General API requests | 100 | 1 minute |
| Website creation | 20 | 1 hour |
| Page creation | 50 | 1 minute |

## Rate Limit Headers

Every response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312800
```

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed in window |
| `X-RateLimit-Remaining` | Remaining requests in current window |
| `X-RateLimit-Reset` | Unix timestamp when limit resets |

## Handling Rate Limits

When exceeded, you'll receive a 429 response:

```json
{
  "success": false,
  "message": "Too many requests",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

### Retry Strategy

```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      const retryAfter = parseInt(
        response.headers.get('Retry-After') || '60'
      );
      console.log(`Rate limited. Retrying in ${retryAfter}s...`);
      await sleep(retryAfter * 1000);
      continue;
    }
    
    return response;
  }
  throw new Error('Max retries exceeded');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

## Best Practices

1. **Cache responses** - Reduce unnecessary API calls
2. **Use webhooks** - Instead of polling for changes
3. **Batch requests** - Combine multiple operations
4. **Implement backoff** - Exponential backoff on 429s
5. **Monitor headers** - Track remaining requests

## Request Prioritization

For high-volume applications, consider implementing:
- Request queuing
- Priority levels for critical operations
- Client-side rate limiting before API calls

## Contact

If you need higher limits, contact support with:
- Use case description
- Expected request volume
- Required limits