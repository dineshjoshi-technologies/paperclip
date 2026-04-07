# Phase 3 Architecture Plan: Multi-Tenant SaaS Platform

> **Platform:** No-Code AI Website Builder  
> **Date:** April 7, 2026  
> **Version:** 1.0  
> **Status:** Draft for Review

---

## Executive Summary

This document presents three implementation approaches for scaling the platform to a true multi-tenant SaaS capable of supporting 1000+ sites per instance, with custom domain management, a template marketplace, advanced analytics, and an API marketplace for third-party integrations.

**Recommendation:** Adopt the **Balanced Approach** — it resolves critical technical debt (schema divergence, missing tenant model, no event system) while delivering Phase 3 requirements incrementally over 16 weeks with manageable risk.

---

## Table of Contents

1. [Current State Assessment](#1-current-state-assessment)
2. [Three Implementation Approaches](#2-three-implementation-approaches)
3. [Architecture Overview](#3-architecture-overview)
4. [Database Schema Changes](#4-database-schema-changes)
5. [API Contract Changes](#5-api-contract-changes)
6. [Implementation Roadmap](#6-implementation-roadmap)
7. [Scalability Targets](#7-scalability-targets)
8. [Risk Assessment Matrix](#8-risk-assessment-matrix)
9. [Recommendation & Justification](#9-recommendation--justification)

---

## 1. Current State Assessment

### 1.1 Infrastructure Topology (As-Is)

```
┌─────────────────────────────────────────────────────┐
│                    Production Server                 │
│                                                      │
│  ┌──────────┐    ┌──────────┐    ┌───────────────┐  │
│  │  Nginx   │───▶│ Next.js  │    │   Express.js  │  │
│  │ (static  │    │  (SSR)   │    │   (API)       │  │
│  │  + SSL)  │    └──────────┘    └───────┬───────┘  │
│  └──────────┘                            │           │
│  ┌──────────┐                            │           │
│  │ Certbot  │                    ┌───────▼───────┐  │
│  │ (manual  │                    │ PostgreSQL 16 │  │
│  │  config) │                    │ (single node) │  │
│  └──────────┘                    └───────────────┘  │
│                                                      │
│  Docker Compose: 5 services                          │
└─────────────────────────────────────────────────────┘
```

### 1.2 Critical Deficits

| # | Deficit | Severity | Phase 3 Impact |
|---|---------|----------|----------------|
| 1 | No Tenant/Organization model | Critical | Blocks multi-tenancy entirely |
| 2 | Prisma schema divergence (13 vs 17 models) | Critical | Blocks any schema migration |
| 3 | No event-driven architecture | High | Blocks analytics, webhooks, integrations |
| 4 | Static nginx routing | High | Blocks custom domain support |
| 5 | JSON-only content storage | Medium | Limits template marketplace |
| 6 | No deployment pipeline | Medium | Blocks professional publishing |
| 7 | No rate limiting per tenant | Medium | Multi-tenant fairness at scale |

---

## 2. Three Implementation Approaches

### Approach A: Conservative

**Philosophy:** Minimal changes, extend existing patterns, lowest risk.

```
┌────────────────────────────────────────────────┐
│              Conservative Approach              │
│                                                 │
│ Multi-tenancy: Schema-only tenant_id on        │
│   existing tables, no new service boundary     │
│                                                 │
│ Custom Domains: Nginx map file generated       │
│   from DB table, reload via cron               │
│                                                 │
│ Template Marketplace: JSON templates stored    │
│   in existing DB table with tags/metadata      │
│                                                 │
│ Analytics: SQL materialized views +            │
│   scheduled aggregation jobs                   │
│                                                 │
│ Integrations: HTTP callback URLs stored in DB, │
│   triggered synchronously                      │
│                                                 │
│ Timeline: 8 weeks                              │
│ Risk: Low                                      │
│ Ceiling: ~2,000 tenants before redesign        │
└────────────────────────────────────────────────┘
```

**Pros:**
- Fastest time to market for Phase 3 features
- No new infrastructure services to manage
- Minimal codebase disruption
- Team can deliver within tight timelines

**Cons:**
- Technical debt compounds; schema patches on existing tables
- Synchronous integrations block at scale
- Nginx reload-based domain routing doesn't scale beyond hundreds
- Materialized views lag for real-time analytics
- Will require re-architecture at ~2,000 tenants
- No foundation for event-driven future features

**Estimate:** 8 weeks, ~320 engineering hours

---

### Approach B: Balanced ⭐ RECOMMENDED

**Philosophy:** Moderate complexity, best ROI, resolves critical debt while delivering Phase 3.

```
┌────────────────────────────────────────────────┐
│               Balanced Approach                 │
│                                                 │
│ Multi-tenancy: First-class Tenant entity,       │
│   TenantMembership junction table, RLS          │
│   (Row-Level Security) policies                 │
│                                                 │
│ Custom Domains: Dynamic nginx config via        │
│   API-driven config generator, automated        │
│   SSL via wildcard + per-domain challenge       │
│                                                 │
│ Template Marketplace: Versioned template        │
│   models with review workflow, preview          │
│   rendering sandbox                             │
│                                                 │
│ Analytics: Write-ahead event log table +        │
│   hourly aggregation pipeline (cron) +          │
│   materialized summary views                    │
│                                                 │
│ Integrations: Lightweight webhook dispatcher    │
│   with retry queue (DB-backed), signature       │
│   verification, event filtering                 │
│                                                 │
│ Infrastructure: Add Redis for caching +         │
│   job queue (no Kafka/complexity)               │
│                                                 │
│ Timeline: 16 weeks                              │
│ Risk: Medium                                    │
│ Ceiling: ~10,000 tenants before redesign        │
└────────────────────────────────────────────────┘
```

**Pros:**
- Resolves critical technical debt (schema unification, tenant model)
- Event log + Redis queue provides foundation for future async patterns
- RLS policies provide strong multi-tenant isolation
- 10,000 tenant ceiling handles next 12-18 months of growth
- Single Redis addition is manageable operational complexity
- Incremental: each phase delivers independently usable value

**Cons:**
- Requires Redis infrastructure addition
- 16-week timeline is longer than conservative
- RLS policies require careful migration testing
- Team needs to learn RLS patterns

**Estimate:** 16 weeks, ~640 engineering hours

---

### Approach C: Ambitious

**Philosophy:** Full rebuild/innovation, highest long-term reward.

```
┌────────────────────────────────────────────────┐
│              Ambitious Approach                 │
│                                                 │
│ Multi-tenancy: Database-per-tenant for          │
│   enterprise + schema-per-tenant for SMB,       │
│   tenant routing service                        │
│                                                 │
│ Custom Domains: Dedicated edge proxy            │
│   (Envoy/Traefik) with ACME automanager,       │
│   CDN integration (CloudFront/Fastly)          │
│                                                 │
│ Template Marketplace: Microservice with         │
│   own DB, versioning, preview sandbox,          │
│   AI-powered template generation               │
│                                                 │
│ Analytics: Dedicated analytics pipeline:        │
│   ClickHouse/TimescaleDB for time-series,       │
│   Kafka event bus, real-time dashboards         │
│                                                 │
│ Integrations: Full API marketplace with OAuth2  │
│   flows, API key management, usage billing,     │
│   SDK generation, developer portal              │
│                                                 │
│ Infrastructure: Kubernetes, service mesh,       │
│   separate DB instances, Redis cluster,         │
│   Kafka, Object Storage (S3)                    │
│                                                 │
│ Timeline: 28 weeks                              │
│ Risk: High                                      │
│ Ceiling: Unlimited (horizontal scale)           │
└────────────────────────────────────────────────┘
```

**Pros:**
- Enterprise-grade from day one
- Unlimited horizontal scalability
- Best-in-class analytics (real-time ClickHouse)
- Professional developer ecosystem (API marketplace)
- Attracts enterprise customers with isolation guarantees

**Cons:**
- 28-week timeline to feature parity
- Massive operational complexity (K8s, service mesh, Kafka)
- Requires DevOps/SRE hire or significant learning curve
- High infrastructure costs from day one
- Team size increase required (estimated 4-6 additional engineers)
- Over-engineered for current scale (1,000 tenant target)

**Estimate:** 28 weeks, ~1,400 engineering hours + infra investment

---

### Approach Comparison Matrix

| Dimension | Conservative | Balanced ⭐ | Ambitious |
|-----------|-------------|-------------|-----------|
| Timeline | 8 weeks | 16 weeks | 28 weeks |
| Engineering Hours | ~320 | ~640 | ~1,400 |
| New Services | 0 | 1 (Redis) | 6+ (K8s, Kafka, ClickHouse, S3, ...) |
| Max Tenants | ~2,000 | ~10,000 | Unlimited |
| Technical Risk | Low | Medium | High |
| Business Risk | High (redo soon) | Low | High (over-investment) |
| Resolves Tech Debt | Partially (patches) | Yes (properly) | Yes (from scratch) |
| Team Readiness | Ready now | Needs 1-2 week ramp | Needs hiring/training |
| Infrastructure Cost | +$0 | ~+$50/mo | ~+$500-2000/mo |

---

## 3. Architecture Overview

### 3.1 Target Architecture (Balanced Approach)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PRODUCTION ENVIRONMENT                          │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                          Edge Layer                               │   │
│  │                                                                   │   │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐    │   │
│  │  │   Certbot     │───▶│    Nginx      │───▶│ Domain Router    │    │   │
│  │  │  (Automated   │    │  (Reverse     │    │ (Dynamic vhost   │    │   │
│  │  │   ACME/SSL)   │    │   Proxy)      │    │  from DB)        │    │   │
│  │  └──────────────┘    └──────┬───────┘    └────────┬─────────┘    │   │
│  │                             │                      │              │   │
│  │              ┌──────────────┘                      │              │   │
│  │              ▼                                     ▼              │   │
│  │  ┌──────────────────┐              ┌──────────────────────┐      │   │
│  │  │  Next.js App     │              │  Published Static     │      │   │
│  │  │  (Builder UI +   │              │  Sites (SSG output)   │      │   │
│  │  │  SSR Dashboards) │              │  served via Nginx     │      │   │
│  │  └────────┬─────────┘              └──────────────────────┘      │   │
│  │           │                                                       │   │
│  └───────────┼───────────────────────────────────────────────────────┘   │
│              │                                                           │
│  ┌───────────▼──────────────────────────────────────────────────────┐   │
│  │                        Application Layer                          │   │
│  │                                                                   │   │
│  │  ┌──────────────────────────────────────────────────────────┐    │   │
│  │  │              Express.js API Server                        │    │   │
│  │  │                                                           │    │   │
│  │  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────┐  │    │   │
│  │  │  │ Tenant  │ │ Website │ │Template  │ │  Analytics   │  │    │   │
│  │  │  │  Mgmt   │ │   Mgmt  │ │Marketplace│ │  Engine      │  │    │   │
│  │  │  └────┬────┘ └────┬────┘ └────┬─────┘ └──────┬───────┘  │    │   │
│  │  │       │           │           │               │          │    │   │
│  │  │  ┌────▼───────────▼───────────▼───────────────▼───────┐  │    │   │
│  │  │  │              Event Dispatcher                       │  │    │   │
│  │  │  │  (Webhook delivery, retry queue, event filtering)  │  │    │   │
│  │  │  └─────────────────────┬──────────────────────────────┘  │    │   │
│  │  │                        │                                  │    │   │
│  │  │  ┌─────────────────────▼───────────────────────────────┐  │    │   │
│  │  │  │           Integration Gateway                        │  │    │   │
│  │  │  │  (OAuth2, API keys, rate limiting, usage tracking)  │  │    │   │
│  │  │  └─────────────────────────────────────────────────────┘  │    │   │
│  │  └──────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        Data Layer                                 │   │
│  │                                                                   │   │
│  │  ┌──────────────────┐   ┌──────────────────┐                     │   │
│  │  │   PostgreSQL 16  │   │    Redis 7       │                     │   │
│  │  │  (Primary DB +   │   │  (Cache + Job    │                     │   │
│  │  │   RLS Policies)  │   │   Queue +        │                     │   │
│  │  │                  │   │   Sessions)      │                     │   │
│  │  │  ┌────────────┐  │   │                  │                     │   │
│  │  │  │ Tenant A   │  │   │  ┌─────────────┐ │                     │   │
│  │  │  │ Tenant B   │  │   │  │ Webhook     │ │                     │   │
│  │  │  │ Tenant C   │  │   │  │ Retry Queue │ │                     │   │
│  │  │  │ ...(RLS)   │  │   │  └─────────────┘ │                     │   │
│  │  │  └────────────┘  │   │  ┌─────────────┐ │                     │   │
│  │  └──────────────────┘   │  │ Rate Limit   │ │                     │   │
│  │                         │  │ Counters     │ │                     │   │
│  │                         │  └─────────────┘ │                     │   │
│  │                         └──────────────────┘                     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Component Relationship Diagram

```
┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────┐
│   User   │────▶│  Tenant  │────▶│   Website    │────▶│  Domain  │
│          │     │          │     │              │     │          │
│  (1)     │     │  (1)     │     │   (M)        │     │  (M)     │
└──────────┘     └──────────┘     └──────────────┘     └──────────┘
                      │                    │
                      │                    │
                ┌─────▼─────┐       ┌─────▼─────┐
                │ Membership │       │  Content   │
                │   (M)      │       │  (JSON)    │
                └────────────┘       └────────────┘

┌──────────────┐     ┌──────────┐     ┌──────────────┐
│  Template    │────▶│ Template │────▶│   Review     │
│   Version    │     │          │     │              │
│   (M)        │     │   (1)    │     │   (M)        │
└──────────────┘     └──────────┘     └──────────────┘

┌──────────────┐     ┌──────────┐     ┌──────────────┐
│   EventLog   │────▶│ Webhook  │────▶│  Webhook     │
│   (M)        │     │          │     │  Delivery    │
│              │     │  (1)     │     │  Log (M)     │
└──────────────┘     └──────────┘     └──────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Integration  │────▶│    API Key   │────▶│  Connection   │
│   (1)        │     │   (M)        │     │  Log (M)      │
└──────────────┘     └──────────────┘     └──────────────┘

┌──────────────┐     ┌──────────────┐
│  Analytics   │────▶│   Summary    │
│   Event (M)  │     │  Tables (S)  │
└──────────────┘     └──────────────┘
```

### 3.3 Request Flow Diagrams

#### 3.3.1 Tenant-Aware API Request Flow

```
Client Request
     │
     ▼
┌─────────┐
│  Nginx   │── Extract X-Tenant-ID header or subdomain
└────┬─────┘
     │
     ▼
┌──────────────┐
│ Express.js   │── JWT Authentication
│ Middleware   │── Tenant resolution (header / subdomain / domain)
│ Stack        │── TenantMembership check (does user belong to tenant?)
│              │── RLS policy activation (SET LOCAL tenant.id)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Prisma     │── All queries scoped by tenant.id
│  Queries     │── Row-Level Security enforces isolation
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ PostgreSQL   │── RLS rejects any cross-tenant access
│  with RLS    │── tenant_id indexed on all major tables
└──────────────┘
       │
       ▼
    Response
```

#### 3.3.2 Custom Domain Request Flow

```
Browser requests https://www.customer-site.com
     │
     ▼
┌─────────────────┐
│      DNS        │── A record → platform IP
│  (customer's    │── CNAME → platform domain
│   registrar)    │── (managed via domain setup wizard)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Nginx       │── Receives request with Host header
│  (dynamic       │── Looks up domain in custom_domains table
│   upstream      │── Verifies SSL cert exists
│   mapping)      │── Routes to published site content
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Static Site    │── Pre-generated HTML/CSS/JS
│  Published      │── Served directly (no app server hit)
│  Output         │── Cached at Nginx level
└─────────────────┘
```

#### 3.3.3 Event-Driven Analytics Flow

```
User Action (page view, click, form submit)
     │
     ▼
┌────────────────────┐
│  Analytics Capture │── Client-side snippet or SSR hook
│  (Next.js)         │── Batch events (reduce round-trips)
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  POST /api/events   │── Validates with Zod schema
│  (Express.js)       │── Writes to event_log (append-only)
│                     │── Returns 202 Accepted immediately
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│  event_log table    │── Append-only, partitioned by month
│  (PostgreSQL)       │── Low-latency insert, no joins
└─────────┬──────────┘
          │
          ▼ (Hourly cron)
┌────────────────────┐
│  Aggregation Job    │── Groups events by tenant, page, event_type
│  (Express cron)     │── Computes: PVs, UVs, bounce rate, etc.
│                     │── Materializes to analytics_summary tables
└────────────────────┘
          │
          ▼
┌────────────────────┐
│  Dashboard UI       │── Reads from summary tables
│  (Next.js)          │── Real-time: last-hour from event_log
│                     │── Historical: from summary tables
└────────────────────┘
```

#### 3.3.4 Webhook Delivery Flow

```
System Event Occurs
     │
     ▼
┌──────────────────────┐
│  Event Dispatcher    │── Creates EventLog entry
│  (Express.js)        │── Finds matching webhook subscriptions
│                      │── Filters by event_type
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Webhook Delivery    │── Signs payload with HMAC-SHA256
│  Worker (Redis Job)  │── POST to subscriber URL
│                      │── Captures response status
└──────────┬───────────┘
           │
    ┌──────┴──────┐
    │             │
 Success?      Failed
    │             │
    ▼             ▼
┌────────┐  ┌──────────────┐
│ Mark   │  │ Schedule      │
│ Delivered││ Retry (exp    │
└────────┘  │  backoff,    │
            │  max 5)      │
            └──────┬───────┘
                   │
                   ▼ (after 5 failures = true
            ┌──────────────┐
            │ Mark Disabled│
            │ Notify Owner │
            └──────────────┘
```

### 3.4 Multi-Tenant Isolation Model

```
┌─────────────────────────────────────────────────┐
│              Tenant Isolation Strategy           │
│                                                 │
│  Level: Row-Level Security (RLS) in PostgreSQL  │
│                                                 │
│  ┌────────────────────────────────────────────┐ │
│  │  PostgreSQL 16                             │ │
│  │                                            │ │
│  │  ALTER TABLE websites ENABLE ROW LEVEL     │ │
│  │  SECURITY;                                 │ │
│  │                                            │ │
│  │  CREATE POLICY tenant_isolation ON websites│ │
│  │    USING (tenant_id = current_setting(     │ │
│  │      'app.current_tenant_id')::uuid);      │ │
│  │                                            │ │
│  │  → Every query automatically scoped        │ │
│  │  → No application-level漏 tenant_id漏漏    │ │
│  │  → DB enforces at query execution time     │ │
│  └────────────────────────────────────────────┘ │
│                                                 │
│  Benefits:                                      │
│  • Impossible to query another tenant's data    │
│    even with application bugs                    │
│  • Single database = simple ops, backups,       │
│    migrations                                    │
│  • Cost-effective at 1,000-10,000 tenants       │
│  • Can upgrade to db-per-tenant later for       │
│    enterprise customers                          │
└─────────────────────────────────────────────────┘
```

---

## 4. Database Schema Changes

### 4.1 Prisma Schema: New Models

```prisma
// ============================================================
// PHASE 3: Multi-Tenant SaaS Schema Additions
// ============================================================

// ─── TENANT & ORGANIZATION ───────────────────────────────────

enum TenantRole {
  OWNER
  ADMIN
  EDITOR
  VIEWER
  DEVELOPER
  BILLING
}

model Tenant {
  id            String    @id @default(uuid()) @db.Uuid
  slug          String    @unique                // subdomain: mycompany.platform.com
  name          String                           // display name
  plan          String    @default("free")       // free, starter, pro, enterprise
  billingStatus String    @default("active")     // active, past_due, cancelled, trial
  settings      Json      @default("{}")         // tenant-level config

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  members       TenantMembership[]
  websites      Website[]
  domains       CustomDomain[]
  templates     TemplateVersion[]
  webhooks      Webhook[]
  integrations  IntegrationConnection[]
  events        EventLog[]
  analytics     AnalyticsEvent[]

  @@index([plan])
  @@index([billingStatus])
  @@map("tenants")
}

model TenantMembership {
  id        String   @id @default(uuid()) @db.Uuid
  tenantId  String   @db.Uuid
  userId    String   @db.Uuid
  role      TenantRole @default(VIEWER)
  invitedBy String?  @db.Uuid             // User who sent invitation
  invitedAt DateTime @default(now())
  joinedAt  DateTime?

  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([tenantId, userId])
  @@index([userId])
  @@map("tenant_memberships")
}

// ─── CUSTOM DOMAINS ──────────────────────────────────────────

model CustomDomain {
  id            String   @id @default(uuid()) @db.Uuid
  domain        String   @unique                // e.g., "www.customer-site.com"
  tenantId      String   @db.Uuid
  websiteId     String   @db.Uuid
  status        String   @default("pending")    // pending, verifying, active, failed, expired
  sslStatus     String   @default("none")       // none, provisioning, active, expiring_soon, expired
  sslExpiryAt   DateTime?
  verificationToken String? @unique              // DNS TXT record value
  dnsRecords    Json     @default("{}")          // instructions for user
  verifiedAt    DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  tenant        Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  website       Website  @relation(fields: [websiteId], references: [id], onDelete: Cascade)

  @@index([status])
  @@index([tenantId])
  @@map("custom_domains")
}

// ─── WORKFLOWS (AI Automation Pipelines) ────────────────────

enum WorkflowTriggerType {
  WEBHOOK
  SCHEDULE
  FORM_SUBMIT
  USER_ACTION
  API_CALL
}

enum WorkflowStatus {
  DRAFT
  ACTIVE
  PAUSED
  FAILED
}

model Workflow {
  id            String             @id @default(uuid()) @db.Uuid
  tenantId      String             @db.Uuid
  name          String
  description   String?
  trigger       WorkflowTriggerType
  triggerConfig Json               @default("{}")       // schedule cron, webhook path, etc.
  steps         Json               @default("[]")       // ordered action steps
  status        WorkflowStatus     @default(DRAFT)
  lastRunAt     DateTime?
  lastRunStatus String?            // success, failed, timeout
  errorLog      String?
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt

  tenant        Tenant             @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@index([status])
  @@map("workflows")
}

// ─── INTEGRATION CONNECTIONS ─────────────────────────────────

enum IntegrationStatus {
  CONNECTED
  DISCONNECTED
  ERROR
  REQUIRES_REAUTH
}

model IntegrationConnection {
  id            String           @id @default(uuid()) @db.Uuid
  tenantId      String           @db.Uuid
  provider      String             // 'razorpay', 'stripe', 'mailchimp', 'hubspot', etc.
  status        IntegrationStatus @default(DISCONNECTED)
  credentials   Json             @default("{}")       // encrypted tokens, API keys
  scopes        String[]         // OAuth scopes granted
  connectedAt   DateTime?
  lastSyncAt    DateTime?
  errorLog      String?
  settings      Json             @default("{}")
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  tenant        Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, provider])
  @@index([tenantId])
  @@index([status])
  @@map("integration_connections")
}

// ─── WEBHOOKS ────────────────────────────────────────────────

model Webhook {
  id            String          @id @default(uuid()) @db.Uuid
  tenantId      String          @db.Uuid
  url           String
  secret        String          @default(nanoid(32)) // HMAC signing key
  events        String[]        // ['site.published', 'domain.verified', ...]
  active        Boolean         @default(true)
  lastTriggered DateTime?
  failureCount  Int             @default(0)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  deliveries    WebhookDelivery[]

  tenant        Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@index([active])
  @@map("webhooks")
}

model WebhookDelivery {
  id          String    @id @default(uuid()) @db.Uuid
  webhookId   String    @db.Uuid
  eventType   String
  payload     Json
  statusCode  Int?
  response    String?
  attempt     Int       @default(1)
  maxAttempts Int       @default(5)
  status      String    @default("pending")   // pending, delivered, failed, retrying
  deliveredAt DateTime?
  nextRetryAt DateTime?
  createdAt   DateTime  @default(now())

  webhook     Webhook   @relation(fields: [webhookId], references: [id], onDelete: Cascade)

  @@index([webhookId])
  @@index([status])
  @@index([nextRetryAt])
  @@map("webhook_deliveries")
}

// ─── EVENT LOG ───────────────────────────────────────────────

model EventLog {
  id          String   @id @default(uuid()) @db.Uuid
  tenantId    String   @db.Uuid
  userId      String?  @db.Uuid
  entityType  String   // 'website', 'domain', 'template', 'user', 'payment', ...
  entityId    String?  @db.Uuid
  eventType   String   // 'site.published', 'domain.added', 'user.invited', ...
  metadata    Json     @default("{}")
  severity    String   @default("info")     // info, warning, error, critical
  createdAt   DateTime @default(now()) @db.Timestamp(3)

  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, createdAt(sort: Desc)])
  @@index([entityType, entityId])
  @@index([eventType])
  @@map("event_logs")
}

// ─── ANALYTICS EVENTS ───────────────────────────────────────

model AnalyticsEvent {
  id          String   @id @default(uuid()) @db.Uuid
  tenantId    String   @db.Uuid
  websiteId   String?  @db.Uuid
  sessionId   String?  @db.Uuid             // group events into user sessions
  userId      String?  @db.Uuid             // if authenticated
  eventType   String   // 'page_view', 'click', 'form_submit', 'scroll_depth', ...
  pageUrl     String?
  referrer    String?
  userAgent   String?
  ipAddress   String?  // hashed for privacy
  metadata    Json     @default("{}")       // click coordinates, form field names, etc.
  createdAt   DateTime @default(now()) @db.Timestamp(3)

  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  website     Website? @relation(fields: [websiteId], references: [id], onDelete: SetNull)

  @@index([tenantId, websiteId, createdAt(sort: Desc)])
  @@index([eventType, createdAt(sort: Desc)])
  @@index([sessionId])
  @@map("analytics_events")
}

// ─── TEMPLATE MARKETPLACE ───────────────────────────────────

enum TemplateCategory {
  LANDING_PAGE
  PORTFOLIO
  ECOMMERCE
  BLOG
  BUSINESS
  RESTAURANT
  REAL_ESTATE
  SAAS
  EDUCATION
  EVENT
}

enum TemplateVisibility {
  PRIVATE
  PUBLIC
  FEATURED
}

enum TemplateReviewStatus {
  PENDING
  UNDER_REVIEW
  APPROVED
  REJECTED
}

model TemplateVersion {
  id            String             @id @default(uuid()) @db.Uuid
  slug          String             @unique               // url-friendly name
  displayName   String
  description   String?
  category      TemplateCategory
  visibility    TemplateVisibility @default(PRIVATE)
  tenantId      String             @db.Uuid
  version       Int                @default(1)
  parentVersion String?            @db.Uuid              // link to previous version
  components    Json                // validated component tree
  styles        Json               @default("{}")
  previewUrl    String?            // live preview link
  previewImage  String?            // screenshot URL
  price         Decimal?           @default(0) @db.Decimal(10, 2)
  downloads     Int                @default(0)
  rating        Float?             @db.Real
  reviewStatus  TemplateReviewStatus @default(PENDING)
  reviewNotes   String?
  reviewedBy    String?            @db.Uuid              // User who reviewed
  reviewedAt    DateTime?
  publishedAt   DateTime?
  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt

  tenant        Tenant             @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  reviews       TemplateReview[]

  @@unique([slug, version])
  @@index([category])
  @@index([visibility])
  @@index([reviewStatus])
  @@index([tenantId])
  @@index([publishedAt(sort: Desc)])
  @@map("template_versions")
}

model TemplateReview {
  id              String   @id @default(uuid()) @db.Uuid
  templateVersion String   @db.Uuid
  userId          String   @db.Uuid
  rating          Int      // 1-5 stars
  comment         String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  templateVersion TemplateVersion @relation(fields: [templateVersion], references: [id], onDelete: Cascade)
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([templateVersion, userId])
  @@index([templateVersion])
  @@map("template_reviews")
}

// ─── INTEGRATION API KEYS ────────────────────────────────────

model IntegrationApiKey {
  id            String   @id @default(uuid()) @db.Uuid
  tenantId      String   @db.Uuid
  name          String
  keyPrefix     String   // first 8 chars for display (sk_live_abc12345...)
  keyHash       String   @unique               // bcrypt hash of full key
  scopes        String[] // e.g., ['analytics:read', 'websites:write']
  lastUsedAt    DateTime?
  expiresAt     DateTime?
  revoked       Boolean  @default(false)
  revokedBy     String?  @db.Uuid
  revokedAt     DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([tenantId])
  @@index([keyPrefix])
  @@index([revoked])
  @@map("integration_api_keys")
}
```

### 4.2 Prisma Schema: Modified Existing Models

#### Website Model Additions

```prisma
model Website {
  // ... existing fields ...

  // NEW FIELDS
  tenantId      String?  @db.Uuid
  publishedUrl  String?   // generated URL for published site
  publishOutput Json?     @default("{}")  // SSG build metadata, file paths
  publishLog    String?   // last publish build log
  analytics     AnalyticsEvent[]

  // NEW RELATIONS
  tenant        Tenant?  @relation(fields: [tenantId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  domains       CustomDomain[]

  @@index([tenantId])
}
```

#### User Model Additions

```prisma
model User {
  // ... existing fields ...

  // NEW FIELDS
  lastLoginAt   DateTime?
  preferences   Json     @default("{}")  // UI prefs, dashboard settings

  // NEW RELATIONS
  memberships   TenantMembership[]
  reviewedTemplates TemplateVersion[] @relation("TemplateReviewer")
  templateReviews TemplateReview[]

  @@index([lastLoginAt])
}
```

#### Role Enum Expansion

```prisma
// Existing global role (platform-level access)
enum Role {
  SUPER_ADMIN
  ADMIN
  EDITOR
  VIEWER
  BILLING
  API_CONSUMER
  INTEGRATION_BOT
  // ... any existing roles preserved
}

// NEW: Tenant-level role (workspace-level access)
enum TenantRole {
  OWNER      // full control + billing + delete tenant
  ADMIN      // manage members, websites, settings
  DEVELOPER  // workflows, integrations, API keys, webhooks
  EDITOR     // create/edit/publish websites
  VIEWER     // read-only access to websites and analytics
  BILLING    // manage subscription and invoices only
}
```

### 4.3 Schema Migration Ordering

```
Migration Order (CRITICAL - must execute in sequence):

Step 1: Unify schemas
  → Diff backend vs frontend Prisma schemas
  → Merge to single source of truth
  → Run prisma migrate to ensure parity

Step 2: Add Role enum values
  → ALTER TYPE "Role" ADD VALUE 'API_CONSUMER'
  → ALTER TYPE "Role" ADD VALUE 'INTEGRATION_BOT'

Step 3: Create Tenant table
  → CREATE TABLE tenants (...)

Step 4: Create TenantMembership table
  → CREATE TABLE tenant_memberships (...)
  → Backfill: create default tenant per existing user
  → Backfill: create OWNER membership for each user

Step 5: Add tenant_id to Website table
  → ALTER TABLE websites ADD COLUMN tenant_id UUID
  → Backfill: set tenant_id = user's default tenant
  → ALTER TABLE websites ALTER tenant_id SET NOT NULL

Step 6: Add all remaining new tables
  → custom_domains, workflows, integration_connections,
    webhooks, webhook_deliveries, event_logs,
    analytics_events, template_versions, template_reviews,
    integration_api_keys

Step 7: Add RLS policies
  → Enable RLS on tenant-scoped tables
  → Create policies referencing app.current_tenant_id

Step 8: Add indexes
  → Add composite indexes for common query patterns
```

---

## 5. API Contract Changes

### 5.1 New Endpoints

#### Tenant Management

```
POST   /api/v2/tenants                    Create tenant
GET    /api/v2/tenants                    List user's tenants
GET    /api/v2/tenants/:id                Get tenant details
PATCH  /api/v2/tenants/:id                Update tenant
DELETE /api/v2/tenants/:id                Delete tenant (OWNER only)

POST   /api/v2/tenants/:id/members        Invite member
GET    /api/v2/tenants/:id/members        List members
PATCH  /api/v2/tenants/:id/members/:uid   Update member role
DELETE /api/v2/tenants/:id/members/:uid   Remove member
POST   /api/v2/tenants/:id/members/:uid   Accept invitation

POST   /api/v2/tenants/:id/switch         Switch active tenant context
GET    /api/v2/tenants/:id/billing         Get billing info
POST   /api/v2/tenants/:id/billing/checkout Create checkout session
POST   /api/v2/tenants/:id/billing/webhook Payment provider webhook
```

#### Custom Domains

```
POST   /api/v2/domains                    Add custom domain
GET    /api/v2/domains                    List tenant's domains
GET    /api/v2/domains/:id                Get domain status
GET    /api/v2/domains/:id/verify         Check DNS verification
POST   /api/v2/domains/:id/verify         Trigger verification
POST   /api/v2/domains/:id/provision-ssl  Request SSL certificate
DELETE /api/v2/domains/:id                Remove domain
GET    /api/v2/domains/:id/dns-records     Get DNS config instructions
```

#### Workflows

```
POST   /api/v2/workflows                  Create workflow
GET    /api/v2/workflows                  List workflows
GET    /api/v2/workflows/:id              Get workflow
PATCH  /api/v2/workflows/:id              Update workflow
DELETE /api/v2/workflows/:id              Delete workflow
POST   /api/v2/workflows/:id/activate     Activate workflow
POST   /api/v2/workflows/:id/pause        Pause workflow
POST   /api/v2/workflows/:id/test         Dry-run workflow
POST   /api/v2/workflows/:id/run          Manually trigger
GET    /api/v2/workflows/:id/executions   List execution history
GET    /api/v2/workflows/:id/executions/:eid Execution details
```

#### Webhooks

```
POST   /api/v2/webhooks                   Create webhook subscription
GET    /api/v2/webhooks                   List webhooks
GET    /api/v2/webhooks/:id              Get webhook details
PATCH  /api/v2/webhooks/:id              Update webhook (URL, events)
DELETE /api/v2/webhooks/:id              Delete webhook
POST   /api/v2/webhooks/:id/ping         Send test webhook
GET    /api/v2/webhooks/:id/deliveries   List delivery attempts
POST   /api/v2/webhooks/:id/deliveries/:id/retry Retry failed delivery
PUT    /api/v2/webhooks/:id/secret       Rotate webhook secret
GET    /api/v2/events                    List event log
```

#### Integrations

```
GET    /api/v2/integrations               List available providers
GET    /api/v2/integrations/:provider     Get provider details
POST   /api/v2/integrations/:provider/connect Initiate OAuth flow
GET    /api/v2/integrations/:provider/callback OAuth callback
DELETE /api/v2/integrations/:provider    Disconnect integration
GET    /api/v2/integrations/connections   List active connections
GET    /api/v2/integrations/connections/:id Get connection status
POST   /api/v2/integrations/connections/:id/sync Trigger manual sync
GET    /api/v2/integrations/connections/:id/logs List sync logs

POST   /api/v2/integrations/api-keys      Generate API key
GET    /api/v2/integrations/api-keys      List API keys
DELETE /api/v2/integrations/api-keys/:id Revoke API key
POST   /api/v2/integrations/api-keys/:id/rotate Rotate API key
```

#### Analytics

```
GET    /api/v2/analytics/:websiteId/overview  Dashboard overview
GET    /api/v2/analytics/:websiteId/pageviews Page view timeline
GET    /api/v2/analytics/:websiteId/top-pages Top pages by PV
GET    /api/v2/analytics/:websiteId/referrers Top referrers
GET    /api/v2/analytics/:websiteId/devices   Device breakdown
GET    /api/v2/analytics/:websiteId/geo       Geographic data
GET    /api/v2/analytics/:websiteId/sessions  Session analysis
GET    /api/v2/analytics/:websiteId/events    Custom events
POST   /api/v2/analytics/events          Ingest analytics event (batch)
GET    /api/v2/analytics/:websiteId/export Export data (CSV)
GET    /api/v2/analytics/:websiteId/realtime Real-time active users
```

#### Template Marketplace

```
GET    /api/v2/templates                  List public templates (marketplace)
GET    /api/v2/templates/:slug            Get template details
GET    /api/v2/templates/:slug/preview    Get preview URL
POST   /api/v2/templates                  Create template (from website)
GET    /api/v2/templates/my-templates     List user's templates
PATCH  /api/v2/templates/:id              Update template metadata
POST   /api/v2/templates/:id/submit       Submit for review
POST   /api/v2/templates/:id/publish      Publish (after approval)
POST   /api/v2/templates/:id/use          Create website from template
GET    /api/v2/templates/:id/reviews      Get template reviews
POST   /api/v2/templates/:id/reviews      Add review
GET    /api/v2/templates/categories       List categories
GET    /api/v2/templates/featured         Get featured templates

// Admin-only
PATCH  /api/v2/admin/templates/:id/review Review template submission
GET    /api/v2/admin/templates/pending    List pending reviews
```

### 5.2 Modified Existing Endpoints

```
# All tenant-scoped resources now require X-Tenant-ID header
# or tenant resolution from subdomain

PATCH  /api/v1/websites/:id
  → Now scoped to tenant
  → Request must include tenant context
  → Response includes tenant information

GET    /api/v1/websites
  → Returns websites for active tenant only
  → Add query params: ?page=&limit=&status=

DELETE /api/v1/websites/:id
  → Now scoped to tenant
  → Triggers site unpublished event
  → Custom domain associations preserved or cleaned per config

POST   /api/v1/auth/login
  → Response now includes: { accessToken, refreshToken, tenants[], activeTenantId }
  → Users with multiple tenants can switch context

POST   /api/v1/auth/register
  → Optionally accepts: { tenantName, tenantSlug }
  → Creates default tenant and OWNER membership
```

### 5.3 Request/Response Examples

#### Create Tenant

```json
// POST /api/v2/tenants
// Headers: Authorization: Bearer <jwt>

// Request:
{
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "plan": "starter"
}

// Response 201:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "plan": "starter",
  "billingStatus": "active",
  "settings": {},
  "memberCount": 1,
  "createdAt": "2026-04-07T10:00:00.000Z"
}
```

#### Add Custom Domain

```json
// POST /api/v2/domains
// Headers: X-Tenant-ID: <tenant-id>, Authorization: Bearer <jwt>

// Request:
{
  "domain": "www.mywebsite.com",
  "websiteId": "123e4567-e89b-12d3-a456-426614174000"
}

// Response 201:
{
  "id": "abc-def-ghi",
  "domain": "www.mywebsite.com",
  "status": "pending",
  "sslStatus": "none",
  "verificationToken": "platform-verify=abc123def456",
  "dnsRecords": {
    "txt": {
      "name": "_platform-verify",
      "value": "abc123def456",
      "type": "TXT"
    },
    "cname": {
      "name": "www",
      "value": "cname.platform.app",
      "type": "CNAME"
    },
    "a": {
      "name": "@",
      "value": "1.2.3.4",
      "type": "A"
    }
  },
  "createdAt": "2026-04-07T10:00:00.000Z"
}
```

#### Create Webhook

```json
// POST /api/v2/webhooks
// Headers: X-Tenant-ID: <tenant-id>, Authorization: Bearer <jwt>

// Request:
{
  "url": "https://myapp.example.com/webhooks/platform",
  "events": ["site.published", "domain.verified", "payment.completed"]
}

// Response 201:
{
  "id": "webhook_abc123",
  "url": "https://myapp.example.com/webhooks/platform",
  "secret": "whsec_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "events": ["site.published", "domain.verified", "payment.completed"],
  "active": true,
  "createdAt": "2026-04-07T10:00:00.000Z"
}

// Webhook delivery payload (POST to subscriber):
{
  "id": "evt_abc123",
  "type": "site.published",
  "timestamp": "2026-04-07T10:05:00.000Z",
  "tenantId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "websiteId": "123e4567-e89b-12d3-a456-426614174000",
    "url": "https://www.mysite.com"
  }
}
// Headers:
// X-Webhook-Signature: sha256=<hmac>
// X-Webhook-Id: evt_abc123
// X-Webhook-Delivery-Id: del_xyz789
```

#### Analytics Overview

```json
// GET /api/v2/analytics/:websiteId/overview?period=7d
// Headers: X-Tenant-ID: <tenant-id>

// Response 200:
{
  "period": { "start": "2026-03-31", "end": "2026-04-07" },
  "summary": {
    "pageViews": 15243,
    "uniqueVisitors": 8421,
    "bounceRate": 0.34,
    "avgSessionDuration": 142,
    "topPage": "/pricing",
    "topReferrer": "google.com"
  },
  "timeline": [
    { "date": "2026-04-01", "pageViews": 2140, "uniqueVisitors": 1200 },
    { "date": "2026-04-02", "pageViews": 2350, "uniqueVisitors": 1350 }
  ],
  "byDevice": { "desktop": 0.58, "mobile": 0.35, "tablet": 0.07 },
  "byCountry": [
    { "country": "IN", "visitors": 3200, "label": "India" },
    { "country": "US", "visitors": 2100, "label": "United States" }
  ]
}
```

#### Template List (Marketplace)

```json
// GET /api/v2/templates?category=SAAS&sort=downloads&limit=20

// Response 200:
{
  "templates": [
    {
      "id": "tmpl-abc123",
      "slug": "modern-saas-dashboard",
      "displayName": "Modern SaaS Dashboard",
      "category": "SAAS",
      "description": "Clean dashboard template with sidebar navigation",
      "previewImage": "https://cdn.platform.com/previews/modern-saas.png",
      "downloads": 1423,
      "rating": 4.7,
      "price": 0,
      "latestVersion": 3,
      "publishedAt": "2026-03-15T08:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 156, "hasMore": true },
  "categories": ["LANDING_PAGE", "PORTFOLIO", "SAAS", "ECOMMERCE", "..."]
}
```

---

## 6. Implementation Roadmap

### 6.1 Phase-by-Phase Breakdown (16 Weeks - Balanced Approach)

```
┌────────────────────────────────────────────────────────────────────────┐
│                    PHASE 3 IMPLEMENTATION TIMELINE                      │
│                                                                       │
│  Phase 1: Foundation (Weeks 1-4)                                      │
│  Phase 2: Custom Domains + Domains (Weeks 5-7)                        │
│  Phase 3: Events + Webhooks + Analytics (Weeks 8-11)  │
│  Phase 4: Template Marketplace (Weeks 12-14)                          │
│  Phase 5: Integration Platform (Weeks 15-16)                          │
│                                                                       │
└────────────────────────────────────────────────────────────────────────┘

Week:  1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16
       ├─────────┤    ├─────────┤    ├─────────┤    ├─────────┤    ├─────────┤
       │ Phase 1  │    │ Phase 2  │    │ Phase 3  │    │ Phase 4  │    │ Phase 5  │
       │Foundation │    │ Domains  │    │ Events+  │    │ Templates│    │ Integrat.│
       │           │    │          │    │Analytics │    │          │    │          │
       └─────┬─────┘    └─────┬─────┘    └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
             │                 │                 │                 │                 │
             ▼                 ▼                 ▼                 ▼                 ▼
       ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
       │ Schema    │    │ Domain    │    │ Event     │    │ Template  │    │ OAuth     │
       │ Unification│   │ Resolution│    │ Log + RLS │    │ Models    │    │ Flows     │
       │ Tenant    │    │ SSL Mgmt  │    │ Analytics │    │ Review    │    │ API Keys  │
       │ Model     │    │ Nginx     │    │ Ingestion │    │ Workflow  │    │ Rate      │
       │ Membership│    │ Dynamic   │    │ Dashboard │    │ Marketplace│   │ Limiting  │
       │ Migration │    │ Config    │    │ Pipeline  │    │ UI        │    │ Rate      │
       └───────────┘    └───────────┘    └───────────┘    └───────────┘    └───────────┘
             │                 │                 │                 │                 │
             └─────────────────┴─────────────────┴─────────────────┴──┐              │
                                                                      │              │
                                                    Dependencies: ────┘              │
                                                                      │              │
                                                    P1 ──▶ P2 ──▶ P3 ─┘              │
                                                    P1 ──▶ P4 ────────┘              │
                                                    P1 ──▶ P5 ──────────────────────┘
                                                    P2 ──▶ P3 (domain events)        │
                                                    P3 ──▶ P4 (template events)      │
                                                    P3 ──▶ P5 (integration events)   │
```

### Phase 1: Foundation (Weeks 1-4)

**Goal:** Unified schema, Tenant model, membership system, migration pipeline.

| Week | Tasks | Deliverables | Dependencies |
|------|-------|-------------|-------------|
| **W1** | Schema unification (backend ↔ frontend Prisma diffs) | Unified Prisma schema file | None |
| | Tenant + TenantMembership models in Prisma | Migration file | Schema unification |
| | Tenant context middleware (Express + Next.js) | Middleware code, tests | Tenant model exists |
| **W2** | Role enum expansion (global + tenant roles) | Updated auth middleware | None |
| | Tenant membership resolution middleware | Middleware code, tests | Tenant model exists |
| | Tenant-aware RBAC (platform role + tenant role) | RBAC logic, tests | Both role enums |
| **W3** | Default tenant migration for existing users | Migration script + seed data | All models exist |
| | Existing user → OWNER membership backfill | Verification script | Tenant migration |
| | Website → tenant_id backfill | Verification script | Tenant migration |
| **W4** | RLS policy implementation (PostgreSQL) | RLS SQL scripts, tests | All tenant_id fields |
| | Tenant context injection (SET LOCAL per request) | DB middleware | RLS policies |
| | Cross-tenant access prevention tests | Integration tests | RLS enabled |
| **Milestone 1:** Multi-tenant foundation complete. All data isolated by tenant. Existing users migrated seamlessly.

### Phase 2: Custom Domains (Weeks 5-7)

**Goal:** Custom domain management, automated SSL, dynamic Nginx routing.

| Week | Tasks | Deliverables | Dependencies |
|------|-------|-------------|-------------|
| **W5** | CustomDomain model + API | CRUD endpoints, Zod validation | Phase 1 complete |
| | Domain verification system (DNS TXT) | Verification endpoint | CustomDomain model |
| | Domain setup wizard (Next.js UI) | Frontend UI component | Verification system |
| **W6** | Nginx dynamic config generator | Config regeneration script | CustomDomain model |
| | Wildcard SSL certificate setup | Certbot automation | Nginx config |
| | Per-domain ACME challenge endpoint | Challenge route in Express.js | Nginx config |
| **W7** | SSL provisioning + renewal automation | Scheduled renewal job | ACME challenge |
| | Domain status polling + health checks | Health check + monitoring | SSL provisioning |
| | Fallback routing for expired certificates | Error page + alerting | All domain features |
| **Milestone 2:** Custom domains fully operational. Users can connect domains with guided UI. SSL automated.

### Phase 3: Events + Webhooks + Analytics (Weeks 8-11)

**Goal:** Event-driven architecture, webhook delivery, analytics engine, real-time dashboard.

| Week | Tasks | Deliverables | Dependencies |
|------|-------|-------------|-------------|
| **W8** | EventLog model + append-only API | Event ingestion endpoint, Zod | Phase 1 complete |
| | Event dispatcher service | Dispatcher logic, retry queue | EventLog exists |
| | Webhook model + CRUD API | Webhook subscription management | Event dispatcher |
| **W9** | HMAC webhook signing + verification | Signing middleware, docs | Webhook model exists |
| | Webhook delivery worker | Background worker, retry logic | Redis installation |
| | Delivery status tracking UI | Dashboard + retry controls | Delivery worker |
| **W10** | AnalyticsEvent model + ingestion API | Batch event endpoint, privacy controls | Phase 1 complete |
| | Client-side analytics snippet | JS snippet, SSR capture hook | Analytics model exists |
| | Aggregation pipeline (hourly cron) | Aggregation script, cron config | Event data flowing |
| **W11** | Analytics dashboard (Next.js) | Charts, tables, filters | Summary views exist |
| | Real-time active users widget | Live counter, WebSocket/SSE | Analytics pipeline |
| | Export functionality (CSV) | Export endpoint, file generation | Aggregation complete |
| **Milestone 3:** Full event-driven system operational. Webhooks deliver reliably. Analytics dashboard provides actionable insights.

### Phase 4: Template Marketplace (Weeks 12-14)

**Goal:** Versioned template system, review workflow, public marketplace, preview sandbox.

| Week | Tasks | Deliverables | Dependencies |
|------|-------|-------------|-------------|
| **W12** | TemplateVersion + TemplateReview models | Prisma schema, migrations | Phase 1 complete |
| | Template CRUD + versioning API | Create/update/slug generation | Models complete |
| | Review workflow (submit → review → approve) | Status machine, admin endpoints | Review model exists |
| **W13** | Template preview sandbox | Isolated preview rendering | Phase 2 domains |
| | Marketplace listing API (public) | Search, filter, paginate, sort | Public visibility field |
| | Template use → create website flow | "Use template" wizard | Website creation |
| **W14** | Review + rating system UI | Star ratings, review modal | Review model exists |
| | Marketplace UI (Next.js) | Grid, categories, detail pages | All APIs complete |
| | Featured template curation tool | Admin curation panel | Admin endpoints exist |
| **Milestone 4:** Template marketplace live. Users can create, submit, review, and use templates.

### Phase 5: Integration Platform (Weeks 15-16)

**Goal:** OAuth2 flows, API key management, rate limiting, developer infrastructure.

| Week | Tasks | Deliverables | Dependencies |
|------|-------|-------------|-------------|
| **W15** | IntegrationApiKey model + key generation | Hash + prefix system, revoke API | Phase 1 complete |
| | OAuth2 provider connector framework | Base connector, Stripe/Razorpay impl | Models complete |
| | API key authentication middleware | Key validation, scope checking | API key model exists |
| | Rate limiting (Redis, per-tenant, per-key) | Redis-based rate limiter | Redis installed |
| **W16** | Integration catalog UI | Provider marketplace, connect flows | OAuth connectors |
| | Connection status dashboard | Status, last sync, error display | Connection model |
| | Developer documentation portal | Getting started, API reference, SDKs | All integration features |
| **Milestone 5:** Integration platform operational. Third parties can connect via OAuth or API keys. Rate limiting protects system.

### 6.2 Dependencies Graph

```
┌─────────────┐
│ Phase 1:    │ (Schema, Tenant, Migration, RLS)
│ Foundation  │
└──────┬──────┘
       │
       ├──────────────┐                  ┌──────────────┐                  ┌──────────────┐
       ▼              ▼                  ▼              ▼                  ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Phase 2:    │ │ Phase 3:    │ │ Phase 4:    │ │ Phase 5:    │
│ Domains     │ │ Events+     │ │ Templates   │ │ Integrat.   │
│             │ │ Webhooks    │ │             │ │             │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │              │                  │              │
       │              │                  │              │
       ▼              ▼                  ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Custom     │ │  Webhook    │ │  Template   │ │  API Key    │
│  Domain     │ │  Delivery   │ │  Sandbox    │ │  Auth       │
│  Active     │ │  Reliable   │ │  Working    │ │  Rate       │
│  + SSL      │ │  + Retries  │ │  + Reviews  │ │  Limited    │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

### 6.3 Milestones & Deliverables

| Milestone | Week | Deliverable | Acceptance Criteria |
|-----------|------|-------------|---------------------|
| **M1: Foundation Stable** | 4 | Unified schema + tenant isolation | RLS prevents cross-tenant data access; all existing users migrated; zero downtime migration verified |
| **M2: Domains Go Live** | 7 | Custom domain with SSL | User can connect domain in <10 min; SSL auto-provisions; Nginx routes correctly |
| **M3: Events Engine** | 11 | Webhooks + Analytics | Event logged within 100ms; webhook delivered within 5s; dashboard shows data from last 24h |
| **M4: Marketplace Open** | 14 | Template marketplace public | Templates searchable; preview works; "Use template" creates website; review workflow functional |
| **M5: API Platform** | 16 | Full integration ecosystem | OAuth connect works; API keys authenticate; rate limit enforced at configured threshold |

---

## 7. Scalability Targets

### 7.1 Target Metrics (Per Instance)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Tenants per instance | 1,000 initial, 10,000 ceiling | Unique tenant count |
| Websites per tenant | 50 average, 500 max | Count per tenant_id |
| API requests/second | 5,000 sustained, 20,000 peak | API gateway throughput |
| Custom domains active | 5,000 | Unique custom_domains with status=active |
| Events ingested/second | 2,000 | AnalyticsEvent inserts |
| Webhook deliveries/hour | 50,000 | WebhookDelivery success count |
| Template marketplace items | 500 public | TemplateVersion with visibility=PUBLIC |
| Concurrent builders | 200 | Active Next.js sessions |
| Database size | 500 GB ceiling | PostgreSQL total size |
| Response time (p95) | <300ms | API latency |
| Page load (p95) | <2s | Next.js initial render |

### 7.2 Database Scaling Plan

```
Current: Single PostgreSQL 16 node

At 1,000 tenants (~50 GB):
  → Current single node sufficient
  → Add read replicas for analytics queries

At 5,000 tenants (~150 GB):
  → Primary + 2 read replicas
  → Partition event_logs and analytics_events by month
  → PgBouncer connection pooling (50 → 200 connections)

At 10,000 tenants (~500 GB):
  → Primary + 3 read replicas
  → Connection pooling essential
  → Archive analytics_events > 90 days cold storage
  → Evaluate Citus (PostgreSQL extension) for distributed tables
  → Consider splitting: write-primary + analytics-cluster
```

### 7.3 Redis Configuration

```
Purpose: Cache + Job Queue + Rate Limiting + Sessions

Configuration:
  - Redis 7 standalone (no cluster needed until 10k+ tenants)
  - 2 GB RAM (sufficient for queue + cache at target scale)
  - AOF persistence enabled
  - Max memory policy: allkeys-lru

Memory allocation (estimated at 10k tenants):
  - Job queue: ~200 MB (pending webhook deliveries)
  - Rate limit counters: ~100 MB
  - Cached sessions: ~300 MB
  - API response cache: ~500 MB
  - Misc/overhead: ~900 MB
  Total: ~2 GB
```

---

## 8. Risk Assessment Matrix

### 8.1 Technical Risks

| Risk | Likelihood | Impact | Severity | Mitigation |
|------|-----------|--------|----------|------------|
| RLS policy misconfiguration allows cross-tenant data leak | Low | Critical | **HIGH** | Comprehensive integration tests for every RLS policy; automated test that attempts cross-tenant queries; peer review of all RLS changes; staging environment with RLS enabled before production |
| Migration script fails mid-migration | Medium | High | **HIGH** | Transactional migration (all-or-nothing); pre-migration backup; run migration on staging first; dry-run mode; progress checkpointing; rollback script prepared in advance |
| Prisma schema unification breaks existing queries | Medium | High | **HIGH** | Audit every existing query against unified schema; regression test suite; gradual rollout with feature flags; backward-compatible migration (old queries still work during transition) |
| Nginx dynamic config fails to reload | Low | Medium | **MEDIUM** | Config generation tested before reload; keep last working config as fallback; atomic reload only if config validation passes; monitoring alert on reload failure |
| Redis single point of failure | Low | Medium | **MEDIUM** | Redis is cache layer only; app degrades gracefully without Redis (slower but functional); add Redis replica for HA at >5k tenants; Redis data can be rebuilt from persistent DB |
| Schema migration takes too long on production | Medium | Medium | **MEDIUM** | Test migration on production-size data copy; measure exact time; use CONCURRENTLY for index creation; schedule during low-traffic window; communicate maintenance window to users |

### 8.2 Migration Risks

| Risk | Likelihood | Impact | Severity | Mitigation |
|------|-----------|--------|----------|------------|
| Schema divergence causes migration conflicts | High | High | **HIGH** | Resolve divergence BEFORE Phase 3 starts; run `prisma diff` tool; manual reconciliation of differences; document every change |
| Users lose access to their websites post-migration | Low | Critical | **HIGH** | Pre-migration audit: every website must be linked to a tenant after backfill; post-migration verification: query count matches; user acceptance testing with beta users |
| Billing/subscription data lost during tenant creation | Low | Critical | **HIGH** | Payment data not modified during Phase 1; existing subscriptions linked to users only; migration maps user-level subscriptions to tenant-level after foundation is stable |
| Custom domain DNS propagation delays | High | Low | **LOW** | Communicate to users that DNS changes may take up to 48 hours; provide real-time status checks during verification; no data at risk |

### 8.3 Data Loss Risks

| Risk | Likelihood | Impact | Severity | Mitigation |
|------|-----------|--------|----------|------------|
| PostgreSQL crash during high-throughput event ingestion | Low | Medium | **MEDIUM** | Append-only event_log is lightweight; WAL archiving enabled; point-in-time recovery configured; batch ingestion reduces write pressure |
| Redis queue loss on crash (webhook deliveries not retried) | Medium | Low | **LOW** | Webhook delivery logged to PostgreSQL before Redis enqueue; crash recovery scans unacknowledged deliveries; Redis persistence (AOF) enabled |
| Template component JSON becomes invalid | Low | Medium | **MEDIUM** | Zod schema validation on all template saves; version history allows rollback; preview before publish |

### 8.4 Scalability Risks

| Risk | Likelihood | Impact | Severity | Mitigation |
|------|-----------|--------|----------|------------|
| Event_log table grows too large, slowing inserts | Medium | Medium | **MEDIUM** | Monthly partitioning on created_at; index maintenance automation; archive rows > 1 year to cold storage; monitor table size and insert latency |
| Analytics aggregation queries block production DB | Medium | Medium | **MEDIUM** | Aggregations run on read replica; materialized views updated incrementally (not full refresh); schedule during low-traffic periods |
| Nginx worker connections exhausted at custom domain scale | Low | High | **MEDIUM** | Nginx configured with adequate worker_connections (4096+); monitor connection count; scale to multiple Nginx instances behind load balancer when needed |
| Single PostgreSQL node becomes I/O bottleneck | Low | High | **MEDIUM** | Monitor IOPS; add SSD if not already; partition large tables; plan read replica addition before reaching 5k tenants |

### 8.5 Risk Summary

```
Severity Distribution:
  HIGH:   ████ (3 risks - all actively mitigated)
  MEDIUM: ███████ (6 risks - designed-in resilience)
  LOW:    ██ (2 risks - acceptable)

Overall Risk Level: MODERATE
Assessment: Risks are well-understood with concrete mitigation strategies.
The highest risks (RLS misconfiguration, migration failures) have
multiple layers of protection. The balanced approach avoids the
high-risk unknowns of the ambitious approach while being more robust
than the conservative approach's "patch and defer" strategy.
```

---

## 9. Recommendation & Justification

### 9.1 Recommendation: Balanced Approach (Approach B)

The balanced approach is recommended for Phase 3 implementation based on the following analysis:

**Why not Conservative?**
- The conservative approach patches over existing technical debt rather than resolving it
- Schema divergence (13 vs 17 models) would remain unaddressed
- Synchronous webhook delivery would become a bottleneck within months at 1,000+ tenants
- Nginx map-file rotation doesn't scale; would require re-architecture within 6-12 months
- No event-driven foundation means every future feature requires the same architectural fight

**Why not Ambitious?**
- 28-week timeline is too long; market moves fast in the no-code space
- Kubernetes + Kafka architecture is 10x more complex than needed for 1,000 tenants
- Team size/cost increase would be premature
- Enterprise db-per-tenant isolation is not needed until there are enterprise customers
- Can evolve toward ambitious architecture incrementally as scale demands it

**Why Balanced?**
- ✅ Resolves critical technical debt (schema unification, tenant model) as part of Phase 3, not as separate debt-paydown work
- ✅ 16-week timeline delivers incrementally: each phase's output is usable independently
- ✅ Single Redis addition is manageable — same operational profile as existing PostgreSQL
- ✅ RLS provides strong multi-tenant isolation at low infrastructure cost
- ✅ Event log + Redis queue provides foundation for async patterns without Kafka complexity
- ✅ 10,000 tenant ceiling provides 12-18 months of runway
- ✅ Architecture can evolve toward ambitious approach when metrics demand it
- ✅ Team of current size can execute with moderate process adjustments

### 9.2 Evolution Path

```
Current State          Balanced (Phase 3)          Future: Ambitious
─────────────────      ──────────────────────────  ──────────────────
Single PostgreSQL  →   Single PostgreSQL + RLS  →  Citus / Shard
No tenant model    →   First-class tenant isolation  →  DB-per-tenant (enterprise)
Synchronous        →   Redis queue for webhooks  →  Kafka event bus
Static Nginx       →   Dynamic config generator  →  Envoy / Edge proxy
No analytics       →   PostgreSQL aggregation   →  ClickHouse
JSON templates     →   Versioned + reviewed     →  AI-generated templates
```

The balanced approach is designed to be the **right** architecture for 1,000-10,000 tenants. When the platform exceeds 10,000 tenants or gains enterprise customers requiring database-level isolation, the migration path to the ambitious architecture is clear and incremental — no rewrite needed.

### 9.3 Immediate Next Steps

1. **Week 0 (Pre-Phase 3): Schema audit**
   - Run `prisma diff` between backend and frontend schemas
   - Document every difference
   - Get team alignment on unified schema
   - Set up dedicated staging environment for migration testing

2. **Resource planning**
   - Determine team allocation for 16-week engagement
   - Minimum team: 1 backend lead, 1 frontend lead, 1 full-stack, 0.5 DevOps
   - Redis installation and configuration scheduled for Week 3 start

3. **Success metrics definition**
   - Define specific KPIs for each milestone
   - Set up monitoring dashboards pre-launch

---

*Document Version: 1.0*  
*Last Updated: April 7, 2026*  
*Author: Architecture Team*  
*Status: Draft — Pending Review*
