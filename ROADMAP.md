# DJ Technologies — Product Roadmap

> **Last Updated:** 2026-04-07
> **Source:** MASTER-PLAN.md (supersedes all prior phase definitions)

---

## 🚧 Phase 0 — Bug Squash & Release Blockers
**Status: In Progress**
**Timeline:** April 7-11, 2026 (Week 1)
**Goal:** `websitesaas/` passes QA with 84/84 tests, 0 critical bugs, 0 security issues

- [ ] Fix missing `cn()` import in dashboard (runtime crash)
- [ ] Fix JWT payload mismatch in test helpers
- [ ] Fix mass assignment vulnerability in website controller
- [ ] Fix webhook body parsing order for payments
- [ ] Replace test mocking with proper dependency injection
- [ ] Fix all 11 failing tests
- [ ] Enforce JWT secrets in production
- [ ] Consolidate duplicate email/auth routes

**Deliverable:** Green CI, release-ready codebase

---

## 🟡 Phase 1 — MVP Completion
**Status: Planned**
**Timeline:** April 14-25, 2026 (Weeks 2-3)
**Goal:** User can sign up → create website → edit → deploy → pay

- [ ] Onboarding wizard connected to backend APIs
- [ ] 3 starter templates with preview
- [ ] Section-based page editor (text, image)
- [ ] One-click website deployment pipeline
- [ ] Dashboard with real API data
- [ ] Production SSL + VPS deployment
- [ ] Razorpay payment integration with webhooks
- [ ] Self-serve signup flow
- [ ] Basic prompt-to-website AI generation
- [ ] Responsive QA across all pages

**Deliverable:** Functional end-to-end user journey

---

## 🔵 Phase 2 — Launch Prep
**Status: Planned**
**Timeline:** April 28 - May 2, 2026 (Week 4)
**Goal:** Production-ready platform with marketing assets

- [ ] Landing page with live AI demo
- [ ] Pricing page (₹199/mo single tier)
- [ ] Centralized error handling + logging
- [ ] User onboarding flow + tutorial
- [ ] Performance audit + optimization
- [ ] Complete API documentation (OpenAPI)
- [ ] Waitlist → signup migration

**Deliverable:** Launch-ready platform + marketing content

---

## 🟣 Phase 3 — Post-Launch Growth
**Status: Planned**
**Timeline:** May 5-16, 2026 (Weeks 5-6)
**Goal:** Scale with multi-tier billing, referral program, agency features

- [ ] Build & Earn referral program
- [ ] Multi-tier billing (₹499, ₹999, ₹2,999 plans)
- [ ] Analytics dashboard with real metrics
- [ ] Agency management features
- [ ] Hindi language support
- [ ] Template marketplace (premium)
- [ ] Stripe integration for international users

**Deliverable:** Scaled platform with full pricing tiers and marketplace

---

## 🔴 Phase 4 — Platform Expansion
**Status: Deferred**
**Goal:** Marketplace, API exposure, white-label

- Template marketplace with 50+ templates
- Plugin ecosystem
- Developer APIs
- White-label solutions
- Agency partner portal

---

## 🟠 Phase 5 — Intelligence Layer
**Status: Deferred**
**Goal:** Self-optimizing websites, AI recommendations

- Self-optimizing websites
- AI-powered conversion optimization
- Behavior-driven UI changes
- Predictive content suggestions

---

## 🎯 Target Users

| Segment | Primary Need | Pricing Target |
|---------|-------------|----------------|
| Freelancers | Build client sites fast, resell hosting | ₹199/mo per site |
| Small Businesses | Professional site without agency | ₹199-₹499/mo |
| Agencies | Scale production, white-label | ₹2,999/mo |

---

## 🚀 Launch Strategy

1. **Fix everything** (Phase 0) → **Build MVP** (Phase 1) → **Prepare launch** (Phase 2) → **Go live** → **Scale** (Phase 3)
2. Single tier (₹199/mo) at launch, multi-tier post-launch
3. Marketing starts 2 weeks AFTER launch, not before
4. India-first: UPI, INR pricing, localized content

---

## ⚡ Final Note

This roadmap is driven by the Master Plan in MASTER-PLAN.md. All agents must follow task priorities and agent assignments defined there.

**Revenue path:** Ship working product → First paying customer → Referral loop → Scale tiers.
