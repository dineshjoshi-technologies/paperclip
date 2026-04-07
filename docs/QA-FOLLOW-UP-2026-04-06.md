# QA Follow-Up — 2026-04-06 (Second Pass)

**Reference:** QA-REPORT-2026-04-06.md (DJTAA-97)

## Change Detection

No new commits since last review (HEAD at `db4f455`). All changes are uncommitted working-tree modifications. The same 22 modified + 17 untracked files persist — meaning the bugs flagged  in DJTAA-98 and DJTAA-99 have **NOT been fixed** by any other agent.

## Critical Bugs Still Open

### BUG-001 (DJTAA-98) — `cn()` missing import in dashboard — NOT FIXED
- `websitesaas/frontend/app/dashboard/page.tsx` calls `cn()` on lines 234 and 275
- `cn` is **NOT** imported (line 12 only imports `{ apiFetch, formatDate, slugify }`)
- 12 other components in the same project import `cn` correctly from `@/lib/utils` — this is a simple oversight
- **Impact:** Frontend crashes at runtime when dashboard loads

### BUG-002 (DJTAA-99) — JWT payload mismatch — NOT FIXED
- `jwt.js` uses `{ userId }` payload; test helpers in `_setup.js` and `auth.integration.test.js` use `{ sub }`
- Auth middleware reads `decoded.userId` — test-generated tokens return `undefined`
- **Impact:** Any test using test token helpers will fail auth middleware validation. In production, any client using wrong claim name would be rejected.

### SEC-001 — Mass assignment in website controller — NOT FIXED
- `websitesaas/backend/src/controllers/website.controller.js:72` still passes `req.body` directly to Prisma
- Users could potentially set `userId`, `status`, or other sensitive fields
- **Impact:** Privilege escalation / data integrity

### SEC-002 — Webhook body parsing order — PARTIAL
- The `websitesaas` payments routes file is still a stub (all 501 Not Implemented)
- However the `backend` project (main) has Razorpay integration which uses `express.json()` globally BEFORE webhook handler reads raw body — `paymentService.js:148-155` does `JSON.stringify(payload)` for HMAC verification instead of using the raw body, which means it's comparing the **parsed then re-serialized** JSON, not the original raw request body
- **Impact:** Webhook signature verification may fail due to JSON re-serialization differences

## Positive Findings (This Review)

### Main Backend (`/home/dj/my-project/backend`) — 216/216 tests passing
- All unit tests pass: auth, payment controller, payment service, validation, rate limiter, crypto utils
- All integration tests pass: pages, payments, templates, users, websites
- Good test organization with `setupTestDb.js` utility
- Payment controller properly hides secrets with `••••••••` masking
- `emailService.js` has been enhanced (32 new lines) — check what was added

### Email Controller Security Improvement Found
- `email.controller.js` diff shows: `req.user.id` → `req.userId` fix applied — correct property name now
- Password strength validation added for reset password (min 8 chars check)
- **Good:** Someone fixed the auth property name inconsistency

### Schema Changes Noted
- `backend/prisma/schema.prisma` has 53 line changes — new models or fields added, needs review for proper relations and constraints
- `backend/package.json` has 19 package additions — dependency review needed

## Recommendations

1. **Apply BUG-001 fix immediately** — One-line change: add `cn` to the imports on line 12 of `dashboard/page.tsx`
2. **BUG-002** — Update test helpers in `_setup.js` and `auth.integration.test.js` to use `{ userId }` instead of `{ sub }`
3. **SEC-001** — Whitelist fields in website controller update method
4. **Before next PR merge** — Require `npm test` passes and linting passes in CI
5. **Schema review** — The 53-line Prisma schema change should be reviewed for proper relations before migration is run

## Release Status: 🚫 NOT READY

| Criteria | Status |
|----------|--------|
| All tests pass (websitesaas) | ❌ — 11/84 failing (main backend 216/216 ✅) |
| No critical bugs | ❌ — BUG-001 still open |
| Security scan passed | ❌ — 4 open issues |
| Code review complete | ⚠️ — Some files unreviewed |
| Test coverage > 80% | ❌ — No measurement |

---
*QA Follow-Up — DJ Technologies — 2026-04-06*
