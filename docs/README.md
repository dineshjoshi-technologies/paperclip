# Website SaaS Platform - Developer Documentation

Welcome to the DJ Technologies Website SaaS platform developer documentation.

## Quick Start

```bash
# Base URL
export BASE_URL="https://api.yourdomain.com"

# Register a new user
curl -X POST $BASE_URL/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "dev@example.com", "password": "SecurePass123!", "name": "Developer"}'
```

## API Sections

| Section | Description |
|---------|-------------|
| [Authentication](./authentication.md) | Register, login, refresh tokens, API keys |
| [Websites](./websites.md) | Create, read, update, delete websites |
| [Pages](./pages.md) | Manage website pages |
| [Templates](./templates.md) | Browse and use templates |
| [Webhooks](./webhooks.md) | Event types and payloads |
| [Errors](./errors.md) | Error codes and handling |
| [Rate Limits](./rate-limits.md) | API rate limiting |

## API Versioning

The API uses URL versioning: `/v1/`

## Authentication

All authenticated endpoints require either:
- JWT Access Token in `Authorization: Bearer <token>` header
- API Key in `X-API-Key: <key>` header

## Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

## Code Examples

- [JavaScript](./examples/javascript.md)
- [Python](./examples/python.md)
- [cURL](./examples/curl.md)

## Postman Collection

Import `postman/collection.json` into Postman for quick testing.