# Master Plan — DJ Technologies AI Website Platform

> **Synthesized:** 2026-04-07
> **Authority:** Plan Synthesizer (final arbiter for execution priority)
> **Status:** ACTIVE — Execution Blueprint

---

## Executive Summary

DJ Technologies is building an AI-powered no-code website builder SaaS targeting India's freelancers, small businesses, and agencies at ₹199/month. The platform generates websites from prompts, provides drag-and-drop editing, and includes zero-config hosting with SSL.

**Current State:** Phase 1 foundation is ~80% complete. The `backend/` service is production-ready (216/216 tests pass). However, the `websitesaas/` codebase has critical unfixed bugs (runtime crashes, security vulnerabilities, broken tests) that block any production release. The `website-platform/` codebase exists as a parallel frontend with overlapping functionality.

**Primary Obstacle:** Three parallel codebases without a unified strategy, combined with unfixed critical bugs in the frontend-facing application, means we cannot accept paying customers until these are resolved.

**Unified Strategy:** Fix `websitesaas/` → ship MVP → iterate with AI features → scale. The marketing plan (₹199/month pricing, Build & Earn program, India-first positioning) is validated and ready to activate once the product ships.

---

## Conflict Resolution Log

| # | Conflict | Source | Resolution | Rationale |
|---|----------|--------|------------|-----------|
| 1 | **Three codebases vs one product** | `backend/`, `websitesaas/`, `website-platform/` all exist | Consolidate to `websitesaas/` as primary app. `backend/` serves as reference for proven patterns. `website-platform/` merges into `websitesaas/frontend/`. | Reducing cognitive load. One deployable artifact = faster shipping. |
| 2 | **Marketing launch timeline vs QA status** | Marketing plan assumes GTM ready; QA blocks release | QA fixes (BUG-001, SEC-001, SEC-002, test infrastructure) are FIRST priority. Marketing launches 2 weeks AFTER release, not before. | Cannot market a broken product. Fix first, launch second. |
| 3 | **Phase 1 plan says "Sprint 1: Auth done" vs reality** | PHASE1-PLAN.md says auth is Sprint 1 | Auth exists but has critical bugs (JWT payload mismatch, mass assignment). These must be fixed before moving to Sprint 2. | Auth is foundational. Broken auth = broken everything. |
| 4 | **Pricing tiers vs feature development** | BUSINESS.md recommends 4 tiers; current code has none | Start with single ₹199/mo plan at launch. Multi-tier billing added in Phase 2 post-launch. | Ship one plan, validate demand, then add tiers. |
| 5 | **AI generation timeline** | PLATFORM.md lists AI as Phase 2; marketing assumes AI is core differentiator | AI must work at MVP (prompt-to-website). Phase 2 adds AI refinements. AI quality must meet marketing promises at launch. | AI is the primary differentiator vs Hostinger. Can't launch without it. |
| 6 | **Frontend crash vs dashboard analytics** | QA found `cn()` import missing; dashboard has hardcoded data | Fix crash first, then connect to real APIs in same sprint. | Runtime crash blocks all dashboard usage. |
| 7 | **Stripe vs Razorpay** | PHASE1-PLAN.md mentions Stripe; backend uses Razorpay | Razorpay is primary (UPI, India-first). Stripe as secondary for international. | Razorpay is better for India market (UPI, lower fees). |

---

## Prioritized Task List with Dependencies

### P0: Release Blockers (Week 1) — MUST COMPLETE FIRST

| ID | Task | Dependencies | Est. Effort | Blocker For |
|----|------|-------------|-------------|-------------|
| T-01 | Fix `cn()` import in `websitesaas/frontend/app/dashboard/page.tsx` | None | 5 min | All frontend work |
| T-02 | Fix JWT payload mismatch (`{ sub }` → `{ userId }`) in `websitesaas/backend/tests/` | None | 30 min | All auth testing |
| T-03 | Fix mass assignment in `website.controller.js:72` — whitelist fields | None | 30 min | Security clearance |
| T-04 | Fix webhook body parsing order in `websitesaas/backend/src/index.js` | T-03 | 1 hr | Payment integration |
| T-05 | Replace Module.prototype.require test mocking with proper DI | T-02 | 4 hrs | All test reliability |
| T-06 | Fix all 11 failing tests in `websitesaas/backend/` | T-05 | 4 hrs | Release readiness |
| T-07 | Enforce JWT secrets in production (throw if not set) | None | 30 min | Security clearance |
| T-08 | Consolidate duplicate email/auth route endpoints | None | 1 hr | API clarity |

**Success Gate:** All P0 tasks complete = `websitesaas/` passes all tests, no critical bugs, security scan clean.

### P1: MVP Completion (Week 2-3)

| ID | Task | Dependencies | Est. Effort |
|----|------|-------------|-------------|
| T-09 | Connect onboarding wizard to backend APIs | P0 complete, existing onboarding APIs | 6 hrs |
| T-10 | Template system — 3 starter templates with preview | P0 complete | 8 hrs |
| T-11 | Page editor — section-based editing with text/image | T-10 | 12 hrs |
| T-12 | One-click website deployment pipeline | T-11 | 8 hrs |
| T-13 | Replace hardcoded dashboard data with API calls | T-01 | 4 hrs |
| T-14 | Production SSL + deployment to VPS | T-12 | 4 hrs |
| T-15 | Razorpay integration with webhook verification | T-04 | 6 hrs |
| T-16 | Self-serve signup flow with subscription | T-15 | 6 hrs |
| T-17 | Prompt-to-website AI generation (basic) | T-11 | 12 hrs |
| T-18 | Responsive QA across all pages | T-13, T-14 | 4 hrs |

**Success Gate:** User can sign up, create website with AI or template, edit content, deploy, and pay.

### P2: Polish & Launch Readiness (Week 4)

| ID | Task | Dependencies | Est. Effort |
|----|------|-------------|-------------|
| T-19 | Landing page with live AI demo | T-17 | 6 hrs |
| T-20 | Pricing page (single tier: ₹199/mo) | T-15 | 2 hrs |
| T-21 | Error handling + centralized logging | P0 complete | 4 hrs |
| T-22 | Welcome flow + tutorial for new users | T-09 | 4 hrs |
| T-23 | Performance audit + optimization | T-18 | 4 hrs |
| T-24 | API documentation (OpenAPI) completion | P0 complete | 3 hrs |
| T-25 | Waitlist → signup migration infrastructure | T-20 | 2 hrs |

**Success Gate:** Production-ready platform with launch marketing content ready.

### P3: Post-Launch (Week 5-6)

| ID | Task | Dependencies | Est. Effort |
|----|------|-------------|-------------|
| T-26 | Build & Earn referral program | T-16 | 8 hrs |
| T-27 | Multi-tier billing (₹499, ₹999, ₹2999 plans) | T-15 | 12 hrs |
| T-28 | Analytics dashboard with real metrics | T-13 | 6 hrs |
| T-29 | Agency management features | T-27 | 8 hrs |
| T-30 | Hindi language support | T-22 | 8 hrs |
| T-31 | Template marketplace (premium) | T-10 | 12 hrs |
| T-32 | Stripe integration for international | T-15 | 6 hrs |

---

## Implementation Phases with Timeline

### Phase 0: Bug Squash Week (April 7-11, 2026)
**Goal:** `websitesaas/` passes QA, is release-ready

- Fix all critical bugs (T-01 through T-04)
- Fix test infrastructure (T-05 through T-06)
- Secure auth (T-07, T-08)
- **Deliverable:** Green CI, 84/84 tests passing, 0 security issues

### Phase 1: MVP Completion (April 14-25, 2026)
**Goal:** User can sign up → build → deploy → pay

- Onboarding wizard (T-09)
- Template system (T-10)
- Page editor (T-11)
- Deployment pipeline (T-12, T-14)
- Payment integration (T-15, T-16)
- AI generation prototype (T-17)
- Dashboard with real data (T-13)
- Responsive QA (T-18)
- **Deliverable:** Functional end-to-end user journey

### Phase 2: Launch Prep (April 28 - May 2, 2026)
**Goal:** Production-ready, marketing-ready

- Landing page with demo (T-19)
- Pricing page (T-20)
- Error handling + logging (T-21)
- User onboarding flow (T-22)
- Performance optimization (T-23)
- API docs (T-24)
- **Deliverable:** Launch-ready platform + marketing assets

### Phase 3: Post-Launch Growth (May 5-16, 2026)
**Goal:** Scale, multi-tier, referral program

- Referral system (T-26)
- Multi-tier billing (T-27)
- Analytics (T-28)
- Agency features (T-29)
- Hindi support (T-30)
- Template marketplace (T-31)
- International Stripe (T-32)
- **Deliverable:** Scaled platform with full pricing tiers

---

## Risk Register with Mitigation Strategies

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|-----------|--------|-----------|-------|
| AI quality doesn't match marketing claims | Medium | High | Set realistic claims (under-promise, over-deliver). Add "beta" label to AI generation initially. | Product |
| `websitesaas/` vs `website-platform/` confusion wastes effort | High | Medium | This master plan designates `websitesaas/` as primary. All agents must use it. | Plan Synthesizer |
| VPS capacity insufficient for multiple user websites | Low | High | Load test before launch. Auto-scaling plan in Phase 3. | DevOps |
| Razorpay payment failures at launch | Low | High | Thorough webhook testing (T-04). Fallback to manual activation. | Backend Dev |
| Hostinger responds with better AI before launch | Medium | Medium | Maintain AI quality edge. Emphasize freelancer reseller model as unique moat. | Marketing |
| Security exploit from unfixed vulnerabilities in production | Medium | Critical | Do NOT deploy until P0 complete. Enforce security checklist before any production push. | QA + DevOps |
| Three codebases cause merge conflicts in CI/CD | High | Medium | Consolidation roadmap (P0). Until then, enforce single source of truth per domain. | DevOps |
| Launch timeline slips beyond marketing commitments | Medium | Medium | Phase 0 must be non-negotiable. Marketing launch dates move WITH technical readiness. | CEO |
| User adoption lower than projected | Medium | Medium | Freelancer direct outreach (low cost, high conversion). Waitlist warm audience. | Marketing |

---

## Documentation Updates Required

| File | Update | Status |
|------|--------|--------|
| `README.md` | Update status to "Phase 1 — MVP completion in progress" with current state | PENDING |
| `ROADMAP.md` | Replace phases with refined timeline (Phase 0-3) | PENDING |
| `CHANGELOG.md` | Add planned changes for upcoming sprints | PENDING |
| `PHASE1-PLAN.md` | Update to reflect this master plan supersedes sprint order | PENDING |
| `BUSINESS.md` | Add note about single-tier launch strategy | PENDING |
| `PLATFORM.md` | Clarify codebase strategy (`websitesaas/` as primary) | PENDING |
| `MASTER-PLAN.md` | This document — single source of truth | COMPLETE |

---

## Recommended Agent Assignments

### Phase 0: Bug Squash (Week 1)

| Task | Agent | Rationale |
|------|-------|-----------|
| T-01 (cn() import fix) | Frontend Developer | Trivial frontend fix |
| T-02 (JWT payload fix) | Backend Developer | Test and auth code modification |
| T-03 (Mass assignment) | Backend Developer | Security fix, requires Zod validation |
| T-04 (Webhook parsing) | Backend Developer | Express middleware routing |
| T-05 (Test mocking refactor) | QA Engineer + Backend Developer | Test architecture + implementation |
| T-06 (Fix 11 tests) | QA Engineer | Owns test quality |
| T-07 (JWT secrets) | Backend Developer | Configuration security |
| T-08 (Route consolidation) | Backend Developer | API design decision |

### Phase 1: MVP (Week 2-3)

| Task | Agent | Rationale |
|------|-------|-----------|
| T-09 (Onboarding wizard) | Frontend Developer + Backend Developer | UI + API integration |
| T-10 (Template system) | Frontend Developer + Backend Developer | Needs both sides |
| T-11 (Page editor) | Frontend Developer | Heavy UI work |
| T-12 (Deployment pipeline) | DevOps Engineer + Founding Engineer | Infrastructure + app integration |
| T-13 (Dashboard APIs) | Backend Developer | API wire-up |
| T-14 (Production SSL) | DevOps Engineer | Server configuration |
| T-15 (Razorpay) | Backend Developer | Payment integration |
| T-16 (Signup flow) | Frontend + Backend Developer | Full-stack |
| T-17 (AI generation) | Founding Engineer | AI integration complexity |
| T-18 (Responsive QA) | QA Engineer | Testing responsibility |

### Phase 2: Launch Prep (Week 4)

| Task | Agent | Rationale |
|------|-------|-----------|
| T-19 (Landing page demo) | Frontend Developer | UI work |
| T-20 (Pricing page) | Frontend Developer | UI work |
| T-21 (Error handling) | Backend Developer + DevOps | Logging infrastructure |
| T-22 (Welcome flow) | Frontend Developer + Product | UX design |
| T-23 (Performance) | DevOps + Frontend Developer | Optimization |
| T-24 (API docs) | Backend Developer | Documentation |
| T-25 (Waitlist migration) | Backend Developer | Data migration |

### Phase 3: Post-Launch (Week 5-6)

| Task | Agent | Rationale |
|------|-------|-----------|
| T-26 (Referral program) | Backend Developer + Frontend Developer | Full-stack feature |
| T-27 (Multi-tier billing) | Backend Developer | Subscription logic |
| T-28 (Analytics) | Frontend Developer + Backend Developer | Dashboard + data |
| T-29 (Agency features) | Founding Engineer | Complex feature |
| T-30 (Hindi support) | Frontend Developer + Marketing | i18n + localization |
| T-31 (Template marketplace) | Full team | Major feature |
| T-32 (Stripe international) | Backend Developer | Payment integration |

---

## Decision Framework for Future Changes

When new planning documents or requests arrive, apply this filter:

1. **Is it a Phase 0 blocker?** → Do it NOW, drop everything else
2. **Does it enable revenue?** → Prioritize above everything except blockers
3. **Does it unblock other agents?** → High priority, ship fast
4. **Does it improve user experience?** → Include in current phase if feasible
5. **Is it nice-to-have?** → Defer to next phase

All agents must:
- Read this document before starting work
- Update it if priorities change significantly
- Log activity in `~/my-project/logs/activity.log`
- Block on P0 tasks if any are incomplete

---

*Synthesized by Plan Synthesizer — DJ Technologies — 2026-04-07*
