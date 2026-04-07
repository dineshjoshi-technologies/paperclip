# DJ Technologies — Developer Documentation

Welcome to the DJ Technologies Website SaaS platform developer documentation. This comprehensive guide covers everything you need to integrate with, build on, and contribute to the platform.

## Platform Overview

DJ Technologies is an AI-powered no-code website building platform that enables anyone to create, manage, and scale professional websites using prompts, AI assistance, and intuitive drag-and-drop tools.

**API Status:** Active (v1)  
**Base URL:** `http://localhost:4000/api` (development)  
**API Style:** REST with JSON request/response bodies

---

## Getting Started

New to the platform? Start here:

| Guide | Description |
|-------|-------------|
| [Developer Getting Started](GETTING-STARTED.md) | Setup, first API call, project structure |
| [Environment Setup](ENVIRONMENT-SETUP.md) | Prerequisites, configuration, troubleshooting |
| [Contributing Guide](../CONTRIBUTING.md) | How to contribute code and documentation |

---

## API Reference

Complete API documentation organized by domain:

| Domain | Documentation | Endpoints | Auth |
|--------|--------------|-----------|------|
| **Health** | Built-in | 2 | No |
| **Authentication** | [authentication.md](authentication.md) | 15 | Mixed |
| **Websites** | [websites.md](websites.md) | 10 | Yes |
| **Pages** | [pages.md](pages.md) | 7 | Yes |
| **Templates** | [templates.md](templates.md) | 5 | Mixed |
| **Users** | Internal API | 6 | Yes (Admin) |
| **Subscriptions** | Internal API | 7 | Yes |
| **Payments** | Internal API | 9 | Mixed |
| **Invoices** | Internal API | 7 | Yes |
| **Webhooks** | [webhooks.md](webhooks.md) | 6 | Yes |

**Total:** 68 endpoints across 10 domains

### OpenAPI Specification

- [OpenAPI 3.0 Spec](openapi.yaml) — Machine-readable API definition
- **Note:** This spec is partially complete. Some endpoints (webhooks, payments, invoices) may be missing.

---

## Integration Tutorials

Step-by-step guides for building with the platform:

| Tutorial | Description |
|----------|-------------|
| [Authentication & API Keys](examples/integration-auth-api-keys.md) | Complete auth flow and API key management |
| [Build Website Programmatically](examples/integration-build-website.md) | Create and publish websites via API |
| [Webhook Integration](examples/integration-webhooks.md) | Set up real-time event notifications |

### Language-Specific Examples

| Language | Documentation |
|----------|--------------|
| JavaScript/Node.js | [examples/javascript.md](examples/javascript.md) |
| Python | [examples/python.md](examples/python.md) |
| cURL | [examples/curl.md](examples/curl.md) |

---

## Platform Guides

| Guide | Description |
|-------|-------------|
| [Architecture Overview](ARCHITECTURE.md) | System design, components, and data flow |
| [Authentication](authentication.md) | Auth endpoints, JWT tokens, API keys |
| [Error Handling](errors.md) | Error codes, response format, best practices |
| [Rate Limits](rate-limits.md) | API rate limiting and retry strategies |
| [Webhooks](webhooks.md) | Event types, signatures, retry policy |
| [Deployment Runbook](DEPLOYMENT-RUNBOOK.md) | Production deployment procedures |

---

## Authentication

All authenticated endpoints require one of:

- **JWT Access Token** — `Authorization: Bearer <token>` header (15 minute TTL)
- **API Key** — `Authorization: Bearer <api-key>` header (long-lived)
- **API Key (legacy)** — `X-API-Key: <key>` header

See [Authentication Guide](authentication.md) for complete details.

---

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response payload
  },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descriptive error message",
    "details": [
      // Field-level validation errors (if applicable)
    ]
  }
}
```

---

## API Versioning

The API uses URL versioning: `/api/v1/`

Breaking changes will result in a new version. Non-breaking changes (new fields, new endpoints) may be added to the current version.

---

## Rate Limits

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| General API | 100 requests | 15 minutes |
| Authentication | 20 requests | 15 minutes |
| Password Reset | 5 requests | 15 minutes |

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1712500000
```

See [Rate Limits Guide](rate-limits.md) for retry strategies.

---

## Development & Operations

| Topic | Documentation |
|-------|--------------|
| Local Development | [Getting Started](GETTING-STARTED.md#quick-start) |
| Infrastructure | [INFRASTRUCTURE.md](../INFRASTRUCTURE.md) |
| Deployment | [DEPLOYMENT-RUNBOOK.md](DEPLOYMENT-RUNBOOK.md) |
| Monitoring | Deployment Runbook (Monitoring section) |
| Troubleshooting | [Getting Started](GETTING-STARTED.md#troubleshooting) |

---

## Internal Documents

These documents are for internal use only:

- [QA Report 2026-04-06](QA-REPORT-2026-04-06.md) — QA audit results
- [QA Follow-Up 2026-04-06](QA-FOLLOW-UP-2026-04-06.md) — Follow-up audit status

---

## Help & Support

- **Bug Reports:** Open an issue on GitHub
- **Questions:** See the [Error Handling Guide](errors.md) for common issues
- **Known Issues:** Check the [QA Follow-Up](QA-FOLLOW-UP-2026-04-06.md) document

---

**Last Updated:** April 7, 2026  
**API Version:** v1  
**Documentation Version:** 2.0
