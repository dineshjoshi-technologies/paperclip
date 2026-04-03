# DJ Technologies — Phase 1 Execution Plan

## Current State
- Landing page scaffolded (Next.js 16, Tailwind v4)
- Backend skeleton (Express.js, health check only)
- Database schema designed (14 models via Prisma)
- Docker infrastructure ready (5 services)
- CI/CD pipeline configured
- 6 agents defined (CEO, Founding Engineer, QA, DevOps, Product, Growth)

## Revenue-First Priority Order

### Sprint 1: Revenue Infrastructure (Week 1-2)
**Goal: Enable first paying customer**

1. **Authentication System** — Founding Engineer
   - User registration/login
   - JWT-based auth
   - Password reset flow
   - API: POST /api/auth/register, POST /api/auth/login, POST /api/auth/reset

2. **Database Connection** — Founding Engineer
   - Wire Prisma to backend
   - Run initial migration
   - Seed basic data (templates, components)

3. **User Dashboard** — Founding Engineer
   - Post-login dashboard
   - Website list view
   - Create new website flow
   - Basic settings page

4. **SSL + Production Deploy** — DevOps
   - Provision SSL certificates
   - Enable HTTPS in Nginx
   - Deploy to production VPS
   - Set up monitoring

5. **Pricing Page + Stripe** — Founding Engineer + Growth
   - Integrate Stripe checkout
   - Connect subscription model
   - Update pricing page with live plans
   - Self-serve signup flow

**Deliverable: A user can sign up, pay, and access a dashboard**

---

### Sprint 2: Core Website Builder (Week 3-4)
**Goal: User can create and publish a website**

1. **Template System** — Founding Engineer
   - 3 starter templates (business, portfolio, blog)
   - Template preview
   - Template → website creation

2. **Basic Page Editor** — Founding Engineer
   - Section-based editing
   - Text/content editing
   - Image upload
   - Preview mode

3. **Deployment Pipeline** — DevOps + Founding Engineer
   - One-click website deployment
   - Custom domain connection
   - Auto SSL per website
   - Deployment status tracking

4. **Website Publishing** — Founding Engineer
   - Publish/unpublish toggle
   - Live preview URL
   - Custom domain mapping

**Deliverable: A user can pick a template, edit content, and publish a live website**

---

### Sprint 3: Polish & Scale (Week 5-6)
**Goal: Production-ready, sellable product**

1. **Responsive QA** — QA
   - Cross-browser testing
   - Mobile responsiveness
   - Performance audit

2. **API Completeness** — Founding Engineer
   - Full CRUD for websites
   - Page management API
   - Template API
   - User profile API
   - Subscription management API

3. **Error Handling & Logging** — DevOps
   - Centralized error handling
   - Application logging
   - Error tracking (Sentry or equivalent)
   - Alert system

4. **Self-Serve Onboarding** — Product + Growth
   - Welcome flow for new users
   - Tutorial/guided setup
   - First website wizard
   - Help documentation

**Deliverable: A polished, self-serve platform ready for customers**

---

## Agent Assignments

| Sprint | Task | Agent Owner |
|--------|------|-------------|
| 1 | Authentication | Founding Engineer |
| 1 | Database Connection | Founding Engineer |
| 1 | User Dashboard | Founding Engineer |
| 1 | SSL + Production Deploy | DevOps |
| 1 | Stripe Integration | Founding Engineer + Growth |
| 2 | Template System | Founding Engineer |
| 2 | Basic Page Editor | Founding Engineer |
| 2 | Deployment Pipeline | DevOps + Founding Engineer |
| 2 | Website Publishing | Founding Engineer |
| 3 | Responsive QA | QA |
| 3 | API Completeness | Founding Engineer |
| 3 | Error Handling & Logging | DevOps |
| 3 | Self-Serve Onboarding | Product + Growth |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| User signup → first website | < 10 minutes |
| Website deployment time | < 60 seconds |
| Uptime | 99.9% |
| First paying customer | End of Sprint 1 |
| Self-serve conversion | > 5% |

---

## Revenue Path

1. **Sprint 1**: Enable first revenue (subscription signup)
2. **Sprint 2**: Deliver value (working website builder)
3. **Sprint 3**: Scale (self-serve, polished, sellable)

After Phase 1:
- Offer managed hosting as add-on (MRR)
- Productize website packages (fixed-price offers)
- Build template library (reusable assets)
- Feed learnings into Phase 2 (AI features)
