# Authentication API

Complete authentication flow documentation for the Website SaaS platform.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/auth/register` | Register new user |
| POST | `/v1/auth/login` | Login user |
| POST | `/v1/auth/refresh` | Refresh access token |
| POST | `/v1/auth/logout` | Logout and revoke tokens |
| POST | `/v1/auth/reset` | Request password reset |
| POST | `/v1/auth/reset/confirm` | Confirm password reset |
| GET | `/v1/auth/profile` | Get current user profile |
| PATCH | `/v1/auth/profile` | Update user profile |
| POST | `/v1/auth/verify-email` | Verify email address |
| POST | `/v1/auth/resend-verification` | Resend verification email |

## Registration

Register a new user account.

**Endpoint:** `POST /v1/auth/register`

**Rate Limit:** 5 requests per minute

### Request

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

### Response (201 Created)

```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "onboardingStep": 1,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJl..."
  }
}
```

### Validation Rules

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| email | string | Yes | Valid email, unique |
| password | string | Yes | Min 8 characters |
| name | string | No | Max 255 characters |

### Errors

- `400`: Missing email or password
- `409`: User with email already exists

---

## Login

Authenticate a user and receive tokens.

**Endpoint:** `POST /v1/auth/login`

**Rate Limit:** 10 requests per minute

### Request

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "emailVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJl..."
  }
}
```

### Errors

- `401`: Invalid credentials
- `403`: Email not verified (new verification email sent)

---

## Refresh Token

Exchange a refresh token for new access and refresh tokens.

**Endpoint:** `POST /v1/auth/refresh`

### Request

```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJl..."
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "accessToken": "newAccessToken...",
    "refreshToken": "newRefreshToken..."
  }
}
```

### Errors

- `401`: Invalid or expired refresh token

---

## Logout

Revoke the current refresh token and all user tokens.

**Endpoint:** `POST /v1/auth/logout`

**Auth Required:** Yes

### Request

```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJl..."
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Password Reset

### Request Reset

Request a password reset email.

**Endpoint:** `POST /v1/auth/reset`

**Rate Limit:** 3 requests per hour

### Request

```json
{
  "email": "user@example.com"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "If the email exists, you will receive a reset link"
}
```

> **Note:** This endpoint always returns success to prevent email enumeration.

### Confirm Reset

Confirm password reset with token.

**Endpoint:** `POST /v1/auth/reset/confirm`

### Request

```json
{
  "token": "resetTokenFromEmail",
  "password": "NewSecurePass123!"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

### Validation

- Token: Valid, not expired, not used
- Password: Min 8 characters

---

## Get Profile

Get the currently authenticated user's profile.

**Endpoint:** `GET /v1/auth/profile`

**Auth Required:** Yes

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## Update Profile

Update user profile information.

**Endpoint:** `PATCH /v1/auth/profile`

**Auth Required:** Yes

### Request

```json
{
  "name": "John Updated",
  "firstName": "John",
  "lastName": "Updated"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Updated",
    "firstName": "John",
    "lastName": "Updated"
  }
}
```

---

## Email Verification

### Verify Email

Verify email address with token from email.

**Endpoint:** `POST /v1/auth/verify-email`

### Request

```json
{
  "token": "verificationTokenFromEmail"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Resend Verification

Resend verification email.

**Endpoint:** `POST /v1/auth/resend-verification`

### Request

```json
{
  "email": "user@example.com"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Verification email sent"
}
```

---

## API Keys

Manage API keys for programmatic access.

### Create API Key

**Endpoint:** `POST /v1/auth/api-keys`

**Auth Required:** Yes

### Request

```json
{
  "name": "My API Key",
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

### Response (201 Created)

```json
{
  "success": true,
  "message": "API key created successfully",
  "data": {
    "id": "uuid",
    "name": "My API Key",
    "key": "dj_live_abc123...",
    "expiresAt": "2025-12-31T23:59:59Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

> **Important:** The `key` is only shown once. Store it securely.

### List API Keys

**Endpoint:** `GET /v1/auth/api-keys`

**Auth Required:** Yes

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "My API Key",
      "expiresAt": "2025-12-31T23:59:59Z",
      "lastUsedAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Revoke API Key

**Endpoint:** `DELETE /v1/auth/api-keys/:id`

**Auth Required:** Yes

### Response (200 OK)

```json
{
  "success": true,
  "message": "API key revoked successfully"
}
```

---

## Using Authentication

### Using Access Tokens

Include the access token in the Authorization header:

```bash
curl -X GET https://api.example.com/v1/websites \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### Using API Keys

Include the API key in the X-API-Key header:

```bash
curl -X GET https://api.example.com/v1/websites \
  -H "X-API-Key: dj_live_abc123..."
```

### Token Expiration

- Access Token: 15 minutes
- Refresh Token: 7 days

Refresh tokens rotate on use - a new refresh token is returned with each refresh.