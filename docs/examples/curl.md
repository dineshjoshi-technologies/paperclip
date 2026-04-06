# cURL Examples

Command-line examples using cURL.

## Setup

```bash
# Set your base URL
BASE_URL="https://api.yourdomain.com/v1"

# Set token (optional)
TOKEN="your_access_token_here"
```

## Authentication

### Register

```bash
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

### Login

```bash
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Refresh Token

```bash
curl -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your_refresh_token"
  }'
```

### Logout

```bash
curl -X POST "$BASE_URL/auth/logout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "refreshToken": "your_refresh_token"
  }'
```

### Get Profile

```bash
curl -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN"
```

## Websites

### List Websites

```bash
curl -X GET "$BASE_URL/websites" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Website

```bash
curl -X POST "$BASE_URL/websites" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "My Website",
    "slug": "my-website",
    "templateId": "optional-template-id"
  }'
```

### Get Website

```bash
curl -X GET "$BASE_URL/websites/website-id" \
  -H "Authorization: Bearer $TOKEN"
```

### Update Website

```bash
curl -X PATCH "$BASE_URL/websites/website-id" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "New Name",
    "config": {"theme": "dark"}
  }'
```

### Publish Website

```bash
curl -X POST "$BASE_URL/websites/website-id/publish" \
  -H "Authorization: Bearer $TOKEN"
```

### Delete Website

```bash
curl -X DELETE "$BASE_URL/websites/website-id" \
  -H "Authorization: Bearer $TOKEN"
```

## Pages

### Create Page

```bash
curl -X POST "$BASE_URL/websites/website-id/pages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "About",
    "slug": "about",
    "content": {"title": "About Us"}
  }'
```

### Update Page

```bash
curl -X PATCH "$BASE_URL/v1/pages/page-id" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Updated Name",
    "content": {"title": "New Title"}
  }'
```

### Delete Page

```bash
curl -X DELETE "$BASE_URL/v1/pages/page-id" \
  -H "Authorization: Bearer $TOKEN"
```

## Templates

### List Templates

```bash
curl -X GET "$BASE_URL/templates"
```

### Get Template

```bash
curl -X GET "$BASE_URL/templates/template-id"
```

## API Keys

### Create API Key

```bash
curl -X POST "$BASE_URL/auth/api-keys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "My API Key",
    "expiresAt": "2025-12-31T23:59:59Z"
  }'
```

### List API Keys

```bash
curl -X GET "$BASE_URL/auth/api-keys" \
  -H "Authorization: Bearer $TOKEN"
```

### Revoke API Key

```bash
curl -X DELETE "$BASE_URL/auth/api-keys/key-id" \
  -H "Authorization: Bearer $TOKEN"
```

## Using API Keys

```bash
# Instead of Bearer token, use X-API-Key header
curl -X GET "$BASE_URL/websites" \
  -H "X-API-Key: dj_live_abc123..."
```

## Complete Workflow Example

```bash
#!/bin/bash
set -e

BASE_URL="https://api.yourdomain.com/v1"

# 1. Register/Login to get token
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')
echo "Got token: ${TOKEN:0:20}..."

# 2. List templates
echo "Getting templates..."
TEMPLATES=$(curl -s -X GET "$BASE_URL/templates")
TEMPLATE_ID=$(echo $TEMPLATES | jq -r '.data[0].id')

# 3. Create website
echo "Creating website..."
WEBSITE_RESPONSE=$(curl -s -X POST "$BASE_URL/websites" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"My Business Site\",
    \"slug\": \"my-business-$(date +%s)\",
    \"templateId\": \"$TEMPLATE_ID\"
  }")

WEBSITE_ID=$(echo $WEBSITE_RESPONSE | jq -r '.data.id')
echo "Created website: $WEBSITE_ID"

# 4. Create home page
echo "Creating home page..."
curl -s -X POST "$BASE_URL/websites/$WEBSITE_ID/pages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Home",
    "slug": "home",
    "content": {"hero": {"heading": "Welcome"}}
  }'

# 5. Publish website
echo "Publishing website..."
curl -s -X POST "$BASE_URL/websites/$WEBSITE_ID/publish" \
  -H "Authorization: Bearer $TOKEN"

echo "Done! Website is now published."
```

## Save Credentials

Store your token securely:

```bash
# Save to file (keep permissions secure!)
echo "your_token_here" > ~/.website-api-token
chmod 600 ~/.website-api-token

# Use in scripts
TOKEN=$(cat ~/.website-api-token)
```