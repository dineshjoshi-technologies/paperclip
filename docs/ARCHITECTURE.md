# Platform Architecture Overview

This document describes the architecture, design decisions, and system components of the DJ Technologies platform.

## System Architecture

```
                            ┌─────────────────────────────────────────┐
                            │              Users / Clients             │
                            └──────────────────┬──────────────────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │   Nginx Reverse      │
                                    │   Proxy (80/443)     │
                                    │  • SSL Termination   │
                                    │  • Load Balancing    │
                                    │  • Static Serving     │
                                    │  • Rate Limiting      │
                                    └──────────┬───────────┘
                                               │
                        ┌──────────────────────┴────────────────────┐
                        │                                           │
              ┌─────────▼─────────┐                    ┌────────────▼──────────┐
              │  Next.js Platform  │                    │   Published Websites   │
              │  (Port 3000)       │                    │   (Static/SSG)         │
              │                    │                    │                        │
              │  • Admin Dashboard │                    │  • Multi-tenant        │
              │  • Builder UI      │                    │  • CDN-cached          │
              │  • User Management │                    │  • Custom Domains      │
              │  • AI Editor       │                    │  • SSL Auto-provision  │
              └─────────┬─────────┘                    └────────────────────────┘
                        │
              ┌─────────▼─────────┐
              │  Express.js API    │
              │  (Port 4000)       │
              │                    │
              │  Auth Middleware   │
              │  Rate Limiter      │
              │  Validation Layer  │
              │  Error Handler     │
              └─────────┬─────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
┌────────▼────────┐          ┌────────▼────────┐
│  PostgreSQL      │          │  AI Engine       │
│  (Port 5432)     │          │  (Ollama/API)    │
│                  │          │                  │
│  • Users         │          │  • Prompt Engine  │
│  • Websites      │          │  • Layout Gen     │
│  • Pages         │          │  • Content Gen    │
│  • Templates     │          │  • Suggestions    │
│  • Subscriptions │          │  • Edit Engine    │
│  • Payments      │          └──────────────────┘
│  • API Keys      │
│  • Webhooks      │
└─────────────────┘

┌─────────────────────────────────────────────┐
│             Monitoring Stack                 │
│                                             │
│  Prometheus (9090) ◄─── Metrics ──── All    │
│       │                                     │
│       ▼                                     │
│  Grafana (3001) ◄─── Dashboards ──── Human   │
│       │                                     │
│       ▼                                     │
│  Alertmanager ◄─── Alerts ──── Email/Slack  │
└─────────────────────────────────────────────┘
```

## Component Layers

### 1. Presentation Layer

**Next.js Frontend Platform** — The admin dashboard and builder interface.

| Component | Purpose | Technology |
|-----------|---------|------------|
| Admin Dashboard | User account management, website listing | Next.js App Router |
| Website Builder | Drag-and-drop page editing | React + Component System |
| AI Editor | Natural language editing | Prompt API Integration |
| Template Gallery | Browse and select templates | Next.js Pages |
| User Settings | Profile, billing, API keys | Next.js Forms |

**Published Websites** — Generated static or SSR sites served to end visitors.

| Component | Purpose | Technology |
|-----------|---------|------------|
| Site Generator | Builds static sites from page data | Custom renderer |
| Template Engine | Renders component templates | JSON-to-HTML pipeline |
| CDN Distribution | Global content delivery | CDN + edge caching |

### 2. API Layer

**Express.js Backend** — RESTful API serving all platform data and business logic.

| Module | Purpose | Key Routes |
|--------|---------|-----------|
| Auth | User registration, login, API keys | `/api/auth/*` |
| Websites | CRUD, publish, archive | `/api/websites/*` |
| Pages | Page and component management | `/api/pages/*` |
| Templates | Template listing and management | `/api/templates/*` |
| Users | User profiles and admin operations | `/api/users/*` |
| Subscriptions | Plan management and lifecycle | `/api/subscriptions/*` |
| Payments | Razorpay/Stripe integration | `/api/payments/*` |
| Invoices | Invoice generation and tracking | `/api/invoices/*` |
| Webhooks | Event delivery system | `/api/webhooks/*` |

### 3. Middleware Stack

The Express.js API uses the following middleware chain:

```
Request ──► CORS ──► Rate Limit ──► JSON Parse ──► Auth ──► Validation ──► Handler
```

| Middleware | Purpose | Configuration |
|-----------|---------|---------------|
| CORS | Cross-origin request handling | Configurable origins |
| Rate Limiter | Prevent abuse | 100 req/15min (general), 20 req/15min (auth) |
| JSON Parser | Request body parsing | Standard JSON, raw for webhooks |
| Auth | JWT/API key verification | Bearer token or API key |
| Validation | Input sanitization | Schema-based validation |
| Error Handler | Centralized error responses | Consistent error format |

### 4. Data Layer

**PostgreSQL with Prisma ORM** — Relational data store with type-safe access.

#### Core Entities

```
User (1) ────── (N) Website (1) ────── (N) Page (1) ────── (N) Component
  │
  ├───── (N) API Key
  ├───── (N) Webhook
  ├───── (1) Subscription
  └───── (N) Invoice
```

**Schema Overview:**

- **User** — Authentication, profile, onboarding state
- **Website** — Site metadata, status (DRAFT/PUBLISHED/ARCHIVED), domain
- **Page** — Page content, components, routing (slug), SEO metadata
- **Component** — UI building blocks (hero, features, pricing, etc.) stored as JSON
- **Template** — Pre-built page layouts and designs
- **ApiKey** — Long-lived programmatic access credentials
- **Webhook** — Event subscription configuration
- **Subscription** — User plan and billing status
- **Payment** — Transaction records with gateway details
- **Invoice** — Billing documents and payment tracking

### 5. AI Layer

The AI integration powers intelligent website creation and editing.

| Capability | Description | Implementation |
|-----------|-------------|----------------|
| Prompt-to-Website | Generate complete sites from text prompts | LLM + template mapping |
| Smart Editing | Natural language content modifications | Context-aware prompts |
| Layout Suggestions | AI-recommended component arrangements | Pattern recognition |
| Content Generation | Auto-generated copy and descriptions | Text generation models |

**AI Integration Options:**

- **Local**: Ollama for offline/inference-local generation
- **API**: External LLM providers for higher-quality outputs
- **Hybrid**: Local for prototyping, API for production

## Request Flow

### Website Creation Flow

```
1. Client POST /api/websites
2. Auth middleware validates JWT/API key
3. Rate limiter checks request quota
4. Validation middleware checks request body
5. Controller creates website record in PostgreSQL
6. Initial page structure created (if template specified)
7. Response returned with website data
8. (Optional) Webhook event dispatched: website.created
```

### Website Publishing Flow

```
1. Client POST /api/websites/:id/publish
2. Auth & validation
3. Website data retrieved with all pages/components
4. Static site generator renders HTML/CSS/JS
5. Deployed to hosting infrastructure
6. SSL certificate provisioned (if custom domain)
7. CDN cache invalidated
8. Website status changed to PUBLISHED
9. Webhook event dispatched: website.published
10. Response returned with live URL
```

### Authentication Flow

```
1. Client POST /api/auth/login with credentials
2. Password hashed and compared (bcrypt)
3. Access token (JWT, 15 min TTL) generated
4. Refresh token (JWT, 7 day TTL) generated and stored
5. Tokens returned to client
6. Client includes access token in Authorization header
7. Auth middleware verifies token on each request
8. On expiry: POST /api/auth/refresh with refresh token
9. New access token returned, refresh token rotated
```

## Multi-Tenancy Model

The platform uses a row-level multi-tenancy approach:

- Each user owns websites
- All API queries are scoped to the authenticated user
- Published websites are isolated by domain/subdomain
- Data is logically separated, not physically isolated

### Tenant Isolation

| Layer | Isolation Method |
|-------|-----------------|
| API | User-scoped queries, JWT-based auth |
| Database | Foreign key constraints, row-level security |
| Websites | Subdomain or custom domain routing |
| Storage | User-prefixed asset paths |

## Security Architecture

### Authentication

- **JWT Bearer Tokens** — Short-lived access tokens (15 minutes)
- **Refresh Tokens** — Long-lived, single-use rotation tokens (7 days)
- **API Keys** — Long-lived credentials for server-to-server access
- **Password Hashing** — Bcrypt with salt rounds

### Authorization

- **Role-Based Access Control (RBAC)** — USER, ADMIN, SUPER_ADMIN roles
- **Resource Ownership** — Users can only access their own resources
- **API Key Permissions** — Granular permission scopes per key

### Network Security

- **HTTPS Everywhere** — SSL/TLS for all endpoints (Let's Encrypt)
- **Rate Limiting** — Per-IP and per-user rate limits
- **CORS** — Configurable cross-origin policy
- **Webhook Signatures** — HMAC-SHA256 verification

## Deployment Architecture

### Environments

| Environment | Purpose | URL Pattern |
|-------------|---------|------------|
| Development | Local testing | `localhost:3000` / `localhost:4000` |
| Staging | Pre-production validation | `staging.yourdomain.com` |
| Production | Live platform | `yourdomain.com` |

### Infrastructure

| Service | Technology | Purpose |
|---------|-----------|---------|
| Web Server | Nginx | Reverse proxy, SSL termination, static serving |
| App Server | Docker containers | Isolated service deployment |
| Database | PostgreSQL 15 | Primary data store |
| CI/CD | GitHub Actions | Automated testing and deployment |
| Monitoring | Prometheus + Grafana | Metrics and alerting |
| SSL | Let's Encrypt (Certbot) | Automated certificate management |
| CDN | Cloud provider CDN | Static asset distribution |

### Container Architecture

```
┌──────────────────────────────────────────────────┐
│              Docker Host (VPS)                    │
│                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
│  │  Frontend   │  │   Backend   │  │  Database   │  │
│  │  (Next.js)  │  │  (Express)  │  │ (PostgreSQL) │  │
│  │  :3000      │  │  :4000      │  │  :5432      │  │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  │
│        │               │               │          │
│  ┌─────▼───────────────▼───────────────▼───────┐  │
│  │              Docker Networks                 │  │
│  └─────────────────────┬───────────────────────┘  │
│                        │                          │
│  ┌─────────────────────▼───────────────────────┐  │
│  │              Nginx Proxy                     │  │
│  │              :80 / :443                      │  │
│  └─────────────────────────────────────────────┘  │
│                                                    │
│  ┌────────────┐  ┌──────────────────────────────┐  │
│  │ Certbot    │  │  Monitoring (optional)        │  │
│  │ (SSL)      │  │  Prometheus + Grafana         │  │
│  └────────────┘  └──────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

## Performance Considerations

### Frontend Performance

- **Next.js App Router** — Server components reduce client-side JavaScript
- **Static Generation** — Pre-render where possible for speed
- **Image Optimization** — Next.js Image component with lazy loading
- **Code Splitting** — Route-based and component-based splitting

### API Performance

- **Connection Pooling** — Prisma connection pool management
- **Query Optimization** — Selective field fetching, pagination
- **Caching** — Response caching for read-heavy endpoints (templates, plans)
- **Indexing** — Database indexes on foreign keys and search fields

### CDN and Caching

- **Published Sites** — Full static site caching at CDN edge
- **API Responses** — Cache-Control headers for cacheable endpoints
- **CDN Invalidation** — Triggered on website publish/update

## Scalability Plan

### Current (Single Server)

- Single VPS running all services in Docker containers
- Suitable for MVP and early customers

### Phase 2 (Horizontal Scaling)

| Component | Scaling Strategy |
|-----------|-----------------|
| Frontend | Multiple Next.js instances behind Nginx |
| Backend | Load-balanced Express instances |
| Database | Read replicas, connection pooling (PgBouncer) |
| CDN | Multi-region CDN distribution |
| Storage | Object storage (S3-compatible) for assets |

### Phase 3 (Microservices)

- Split monolith into domain-specific services
- Event-driven architecture with message queue
- Separate AI inference service
- Dedicated webhook delivery service

## Development Workflow

### Feature Development

1. Create feature branch from `main`
2. Implement changes with tests
3. Run linting and type checking
4. Open pull request
5. CI runs automated tests
6. Review and merge to `main`
7. Deploy to staging
8. Validate and deploy to production

### CI/CD Pipeline

```
Push to main ──► Lint & Type Check ──► Unit Tests ──► Build ──► Deploy
```

| Stage | Tool | Purpose |
|-------|------|---------|
| Quality | ESLint + TypeScript | Code style and type safety |
| Testing | Jest + Playwright | Unit and E2E tests |
| Build | Next.js + Docker | Production artifacts |
| Deploy | GitHub Actions | Automated deployment |
| SSL | Certbot | Certificate provisioning |

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js App Router | SSR/SSG flexibility, React ecosystem |
| API Style | REST (not GraphQL) | Simpler, better caching, easier to document |
| ORM | Prisma | Type safety, migrations, developer experience |
| Auth | JWT + API Keys | Stateless, supports server-to-server |
| Payments | Razorpay + Stripe | Regional + global coverage |
| Hosting | Self-managed VPS | Cost-effective, full control |
| AI | Ollama + API hybrid | Flexibility, cost control |

## Future Architecture Considerations

1. **Event Sourcing** — Track all website changes for versioning/undo
2. **Real-time Collaboration** — WebSocket support for live editing
3. **Plugin System** — Extensible component architecture
4. **API Versioning** — v2+ with backward compatibility
5. **Headless CMS Mode** — JSON API for custom frontend implementations
6. **Edge Computing** — Deploy AI generation closer to users
