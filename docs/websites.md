# Website API

Create and manage websites.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/websites` | List all websites |
| POST | `/v1/websites` | Create new website |
| GET | `/v1/websites/:id` | Get website by ID |
| PATCH | `/v1/websites/:id` | Update website |
| DELETE | `/v1/websites/:id` | Delete website |
| POST | `/v1/websites/:id/publish` | Publish website |
| POST | `/v1/websites/:id/archive` | Archive website |
| GET | `/v1/websites/:id/pages` | List website pages |
| POST | `/v1/websites/:id/pages` | Create page in website |

## List Websites

Get all websites for the authenticated user.

**Endpoint:** `GET /v1/websites`

**Auth Required:** Yes

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | 20 | Max results |
| offset | integer | 0 | Pagination offset |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "My Website",
      "slug": "my-website",
      "status": "DRAFT",
      "config": {},
      "template": {
        "id": "uuid",
        "name": "Business Pro"
      },
      "pages": [],
      "_count": {
        "pages": 5
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

## Create Website

Create a new website.

**Endpoint:** `POST /v1/websites`

**Auth Required:** Yes

### Request

```json
{
  "name": "My Website",
  "slug": "my-website",
  "templateId": "uuid (optional)",
  "config": {}
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Website name (max 255 chars) |
| slug | string | Yes | URL-friendly identifier (unique) |
| templateId | uuid | No | ID of template to use |
| config | object | No | Custom configuration |

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My Website",
    "slug": "my-website",
    "status": "DRAFT",
    "userId": "user-uuid",
    "templateId": "template-uuid",
    "config": {},
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Errors

- `400`: Missing name or slug
- `409`: Slug already exists

---

## Get Website

Get a specific website by ID.

**Endpoint:** `GET /v1/websites/:id`

**Auth Required:** Yes

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My Website",
    "slug": "my-website",
    "status": "DRAFT",
    "template": { ... },
    "pages": [
      {
        "id": "uuid",
        "name": "Home",
        "slug": "home",
        "position": 0,
        "components": []
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

### Errors

- `404`: Website not found or not owned by user

---

## Update Website

Update website properties.

**Endpoint:** `PATCH /v1/websites/:id`

**Auth Required:** Yes

### Request

```json
{
  "name": "Updated Name",
  "templateId": "new-template-uuid",
  "config": {
    "theme": "dark"
  },
  "status": "DRAFT"
}
```

| Field | Type | Description |
|-------|------|-------------|
| name | string | New website name |
| templateId | uuid | Change template |
| config | object | Update configuration |
| status | string | Manual status override |

### Response (200 OK)

```json
{
  "success": true,
  "data": { ... }
}
```

---

## Delete Website

Delete a website and all its pages.

**Endpoint:** `DELETE /v1/websites/:id`

**Auth Required:** Yes

### Response (200 OK)

```json
{
  "success": true,
  "message": "Website deleted"
}
```

> **Warning:** This action cannot be undone. All pages and components will be permanently deleted.

---

## Publish Website

Publish a website to make it publicly accessible.

**Endpoint:** `POST /v1/websites/:id/publish`

**Auth Required:** Yes

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "PUBLISHED"
  }
}
```

---

## Archive Website

Archive a published website.

**Endpoint:** `POST /v1/websites/:id/archive`

**Auth Required:** Yes

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "ARCHIVED"
  }
}
```

---

## Website Status Values

| Status | Description |
|--------|-------------|
| `DRAFT` | Work in progress |
| `PUBLISHED` | Live and publicly accessible |
| `ARCHIVED` | Unpublished and archived |

---

## Get Website Pages

List all pages in a website.

**Endpoint:** `GET /v1/websites/:id/pages`

**Auth Required:** Yes

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Home",
      "slug": "home",
      "position": 0,
      "content": {},
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## Create Page

Add a new page to a website.

**Endpoint:** `POST /v1/websites/:id/pages`

**Auth Required:** Yes

### Request

```json
{
  "name": "About Us",
  "slug": "about",
  "content": {
    "title": "About Us",
    "body": "Welcome to our company..."
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Page name |
| slug | string | Yes | URL slug (unique per website) |
| content | object | No | Page content JSON |

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "About Us",
    "slug": "about",
    "content": { ... },
    "websiteId": "website-uuid",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Errors

- `400`: Missing name or slug
- `409`: Page with slug already exists