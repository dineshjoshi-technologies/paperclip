# Pages API

Create and manage individual pages within websites.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/pages/:id` | Get page by ID |
| PATCH | `/v1/pages/:id` | Update page |
| DELETE | `/v1/pages/:id` | Delete page |
| GET | `/v1/pages/:id/components` | List page components |
| POST | `/v1/pages/:id/components` | Add component to page |
| PATCH | `/v1/pages/:id/components/:componentId` | Update component |
| DELETE | `/v1/pages/:id/components/:componentId` | Delete component |

---

## Get Page

Get a specific page by ID.

**Endpoint:** `GET /v1/pages/:id`

**Auth Required:** Yes

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Home",
    "slug": "home",
    "content": {
      "title": "Welcome",
      "hero": {
        "heading": "Welcome to Our Site",
        "subheading": "We build amazing things"
      }
    },
    "position": 0,
    "websiteId": "website-uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

### Errors

- `404`: Page not found

---

## Update Page

Update page properties.

**Endpoint:** `PATCH /v1/pages/:id`

**Auth Required:** Yes

### Request

```json
{
  "name": "New Name",
  "slug": "new-slug",
  "content": {
    "title": "Updated Title",
    "hero": {
      "heading": "New Heading"
    }
  },
  "position": 2
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": { ... }
}
```

---

## Delete Page

Delete a page from a website.

**Endpoint:** `DELETE /v1/pages/:id`

**Auth Required:** Yes

### Response (200 OK)

```json
{
  "success": true,
  "message": "Page deleted"
}
```

---

## List Components

Get all components on a page.

**Endpoint:** `GET /v1/pages/:id/components`

**Auth Required:** Yes

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "hero",
      "props": {
        "heading": "Welcome",
        "backgroundImage": "https://..."
      },
      "position": 0,
      "pageId": "page-uuid"
    }
  ]
}
```

---

## Create Component

Add a component to a page.

**Endpoint:** `POST /v1/pages/:id/components`

**Auth Required:** Yes

### Request

```json
{
  "type": "hero",
  "props": {
    "heading": "Welcome",
    "subheading": "We build amazing things"
  },
  "position": 0
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | Component type (hero, text, image, etc.) |
| props | object | Yes | Component properties |
| position | integer | No | Position in page |

### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "hero",
    "props": { ... },
    "position": 0,
    "pageId": "page-uuid"
  }
}
```

---

## Update Component

Update component properties.

**Endpoint:** `PATCH /v1/pages/:id/components/:componentId`

**Auth Required:** Yes

### Request

```json
{
  "props": {
    "heading": "Updated Heading"
  },
  "position": 1
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": { ... }
}
```

---

## Delete Component

Remove a component from a page.

**Endpoint:** `DELETE /v1/pages/:id/components/:componentId`

**Auth Required:** Yes

### Response (200 OK)

```json
{
  "success": true,
  "message": "Component deleted"
}
```

---

## Component Types

| Type | Description |
|------|-------------|
| `hero` | Full-width hero section |
| `text` | Text/paragraph block |
| `image` | Single image |
| `button` | CTA button |
| `navigation` | Navigation menu |
| `footer` | Footer section |
| `form` | Contact/form section |
| `gallery` | Image gallery |
| `video` | Video embed |
| `spacer` | Empty spacing |