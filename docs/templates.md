# Templates API

Browse and use templates for websites.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/templates` | List all templates |
| GET | `/v1/templates/:id` | Get template details |

---

## List Templates

Get all available templates.

**Endpoint:** `GET /v1/templates`

**Auth Required:** No

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| category | string | - | Filter by category |
| limit | integer | 20 | Max results |
| offset | integer | 0 | Pagination offset |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Business Pro",
      "description": "Professional business template",
      "category": "business",
      "thumbnail": "https://...",
      "config": {
        "colors": {
          "primary": "#2563eb"
        },
        "fonts": {
          "heading": "Inter",
          "body": "Open Sans"
        }
      },
      "isPremium": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## Get Template

Get detailed template information.

**Endpoint:** `GET /v1/templates/:id`

**Auth Required:** No

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Business Pro",
    "description": "Professional business template with modern design",
    "category": "business",
    "thumbnail": "https://...",
    "preview": "https://...",
    "config": {
      "colors": {
        "primary": "#2563eb",
        "secondary": "#1e40af"
      },
      "fonts": {
        "heading": "Inter",
        "body": "Open Sans"
      },
      "layout": "full-width",
      "sections": [
        "hero",
        "features",
        "about",
        "testimonials",
        "contact",
        "footer"
      ]
    },
    "defaultPages": [
      {
        "name": "Home",
        "slug": "home",
        "content": { ... }
      },
      {
        "name": "About",
        "slug": "about",
        "content": { ... }
      }
    ],
    "isPremium": false,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## Template Categories

| Category | Description |
|----------|-------------|
| `business` | Business & corporate |
| `portfolio` | Personal portfolios |
| `ecommerce` | Online stores |
| `blog` | Blogs & content sites |
| `landing` | Landing pages |
| `education` | Schools & courses |
| `restaurant` | Restaurants & food |
| `personal` | Personal sites |

---

## Using Templates

### Create Website with Template

```bash
curl -X POST https://api.example.com/v1/websites \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Business Site",
    "slug": "my-business",
    "templateId": "TEMPLATE_ID"
  }'
```

### Switch Template

```bash
curl -X PATCH https://api.example.com/v1/websites/WEBSITE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "NEW_TEMPLATE_ID"
  }'
```