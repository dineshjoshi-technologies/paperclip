# Python Examples

Code examples for the Website SaaS API in Python.

## Setup

```python
import requests
import time
from typing import Optional, Dict, Any

class WebsiteAPI:
    BASE_URL = "https://api.yourdomain.com/v1"
    
    def __init__(self, access_token: Optional[str] = None, api_key: Optional[str] = None):
        self.access_token = access_token
        self.api_key = api_key
        self.session = requests.Session()
    
    def _get_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        elif self.api_key:
            headers["X-API-Key"] = self.api_key
        return headers
    
    def request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict:
        url = f"{self.BASE_URL}{endpoint}"
        headers = self._get_headers()
        
        response = self.session.request(
            method, url, json=data, headers=headers
        )
        
        result = response.json()
        
        if not response.ok:
            raise APIError(
                result.get("message", "Unknown error"),
                result.get("error", {}).get("code"),
                response.status_code
            )
        
        return result

class APIError(Exception):
    def __init__(self, message: str, code: Optional[str], status: int):
        super().__init__(message)
        self.code = code
        self.status = status
```

## Authentication

### Register

```python
api = WebsiteAPI()

result = api.request("POST", "/auth/register", {
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
})

api.access_token = result["data"]["accessToken"]
print(f"Access token: {result['data']['accessToken']}")
```

### Login

```python
api = WebsiteAPI()

result = api.request("POST", "/auth/login", {
    "email": "user@example.com",
    "password": "SecurePass123!"
})

api.access_token = result["data"]["accessToken"]
print(f"Logged in as: {result['data']['user']['email']}")
```

### Refresh Token

```python
result = api.request("POST", "/auth/refresh", {
    "refreshToken": current_refresh_token
})

api.access_token = result["data"]["accessToken"]
```

## Websites

### List Websites

```python
result = api.request("GET", "/websites")
for website in result["data"]:
    print(f"{website['name']} - {website['status']}")
```

### Create Website

```python
result = api.request("POST", "/websites", {
    "name": "My Website",
    "slug": "my-website",
    "templateId": "optional-template-id"
})

website = result["data"]
print(f"Created website: {website['id']}")
```

### Get Website

```python
result = api.request("GET", "/websites/website-id")
print(result["data"])
```

### Update Website

```python
result = api.request("PATCH", "/websites/website-id", {
    "name": "New Name",
    "config": {"theme": "dark"}
})
```

### Publish Website

```python
result = api.request("POST", "/websites/website-id/publish")
print(f"Status: {result['data']['status']}")
```

### Delete Website

```python
api.request("DELETE", "/websites/website-id")
print("Website deleted")
```

## Pages

### Create Page

```python
result = api.request("POST", "/websites/website-id/pages", {
    "name": "About",
    "slug": "about",
    "content": {"title": "About Us"}
})

page = result["data"]
print(f"Created page: {page['id']}")
```

### Update Page

```python
result = api.request("PATCH", "/v1/pages/page-id", {
    "name": "Updated Name",
    "content": {"title": "New Title"}
})
```

### Delete Page

```python
api.request("DELETE", "/v1/pages/page-id")
```

## Templates

### List Templates

```python
result = api.request("GET", "/templates?category=business")
for template in result["data"]:
    print(f"{template['name']} - {template['category']}")
```

### Get Template

```python
result = api.request("GET", "/templates/template-id")
print(result["data"])
```

## API Keys

### Create API Key

```python
result = api.request("POST", "/auth/api-keys", {
    "name": "My API Key",
    "expiresAt": "2025-12-31T23:59:59Z"
})

api_key = result["data"]["key"]  # Save this - only shown once!
print(f"API Key: {api_key}")
```

### Use API Key

```python
api = WebsiteAPI(api_key="dj_live_abc123...")
result = api.request("GET", "/websites")
```

## Error Handling

```python
try:
    result = api.request("GET", "/websites")
except APIError as e:
    if e.status == 401:
        # Token expired - refresh
        print("Token expired, refreshing...")
    elif e.status == 429:
        # Rate limited - wait
        print("Rate limited, retry later")
    elif e.status == 404:
        print("Resource not found")
    else:
        print(f"Error: {e}")
```

### Retry with Backoff

```python
def request_with_retry(api, method, endpoint, data=None, max_retries=3):
    for attempt in range(max_retries):
        try:
            return api.request(method, endpoint, data)
        except APIError as e:
            if e.status == 429 and attempt < max_retries - 1:
                # Wait and retry
                wait_time = 2 ** attempt * 10  # 10, 20, 40 seconds
                print(f"Rate limited. Waiting {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise
```

## Complete Example

```python
async def create_full_website():
    api = WebsiteAPI()
    
    try:
        # 1. Login
        login_result = api.request("POST", "/auth/login", {
            "email": "user@example.com",
            "password": "SecurePass123!"
        })
        api.access_token = login_result["data"]["accessToken"]
        
        # 2. List templates
        templates = api.request("GET", "/templates")
        template = templates["data"][0]
        
        # 3. Create website
        website = api.request("POST", "/websites", {
            "name": "My Business Site",
            "slug": "my-business",
            "templateId": template["id"]
        })
        
        # 4. Create pages
        api.request("POST", f"/websites/{website['data']['id']}/pages", {
            "name": "Home",
            "slug": "home",
            "content": {"hero": {"heading": "Welcome"}}
        })
        
        api.request("POST", f"/websites/{website['data']['id']}/pages", {
            "name": "About",
            "slug": "about",
            "content": {"title": "About Us"}
        })
        
        # 5. Publish
        published = api.request("POST", f"/websites/{website['data']['id']}/publish")
        print(f"Website published: {published['data']['status']}")
        
    except APIError as e:
        print(f"Error: {e}")
```