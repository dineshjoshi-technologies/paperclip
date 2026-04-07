# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned — Phase 0: Bug Squash (Week of April 7, 2026)
- Fix runtime crash from missing `cn()` import in dashboard
- Standardize JWT payload claims across all test helpers
- Add field whitelisting to website controller update operations
- Fix webhook body parsing order for payment signature verification
- Replace Module.prototype.require test mocking with proper dependency injection
- Fix all 11 failing tests in websitesaas backend
- Enforce JWT secrets in production environment
- Consolidate duplicate email/auth route endpoints

### Planned — Phase 1: MVP Completion (Weeks of April 14-25, 2026)
- Connect onboarding wizard to backend APIs
- Add 3 starter templates with preview functionality
- Implement section-based page editor with text and image editing
- Build one-click website deployment pipeline
- Replace hardcoded dashboard data with real API calls
- Integrate Razorpay payment gateway with webhook verification
- Implement self-serve signup flow with subscription management
- Add basic prompt-to-website AI generation
- Full responsive QA across all pages

### Planned — Phase 2: Launch Prep (Week of April 28, 2026)
- Landing page with live AI demo
- Pricing page (₹199/mo single tier at launch)
- Centralized error handling and structured logging
- User onboarding flow with tutorial
- Performance audit and optimization
- Complete OpenAPI documentation
- Waitlist to signup migration infrastructure

### Added
- Authentication system with user registration, login, JWT, and password reset
- Onboarding wizard UI and API for new user flows
- Page builder with drag-and-drop capabilities
- Website management CRUD APIs
- Template management system with categories and previews
- User profile and settings management
- Payment controller endpoints
- Full test suite for authentication middleware and controller
- Token service with unit tests
- Rate limiting on auth endpoints
- Request validation middleware
- API documentation (OpenAPI/Swagger)
- 8 pre-built website templates (business, portfolio, blogging, landing)
- CI/CD pipeline improvements with permissions and permissions fix
- AI content generation panel with 300+ line enhancement for AI copy generation
- Canvas component with drag-and-drop, viewport switching, and SEO meta support
- Admin dashboard with user management, subscription overview, revenue charts, and platform health monitoring
- AI service integration with Ollama service for local AI model support
- Payment routes with webhook handling for Stripe integration
- Email controller with security improvements and logging
- Logger service for structured application logging
- Admin guard component for route protection
- Admin header and sidebar components
- Dashboard analytics page with activity charts
- Theme context and dark mode support
- QA reports and deployment runbook documentation

### Changed
- Updated .env.example with payment routes
- Enhanced authentication API contract
- Improved Prisma schema and generation in Dockerfile
- Updated project documentation across all files
- Added production logging and error handling
- Overhauled admin page with comprehensive management interface (549 lines changed)
- Enhanced dashboard page with analytics and real-time metrics (291 lines changed)
- Rebuilt page builder component with AI integration and improved UX (293 lines changed)
- Updated dashboard header with theme toggle and user menu
- Standardized admin authentication middleware
- Updated global styles with new theme variables
- Enhanced TypeScript configuration for new components

### Removed
- Removed npm cache from CI/CD to resolve GitHub Actions build error

### Fixed
- CI/CD pipeline failures and workflow permissions
- Corrected globals.css import path in layout
- Resolved database migration issues
- Mass assignment vulnerability in website controller (SEC-001)
- JWT token payload mismatch between auth and tests (BUG-002)
- Email controller test mocking issues
- Missing Prisma model mocks (emailLog, emailTemplate, refreshToken)
- Test suite now passing 84/84 tests (was 81/84)

### Security
- Added field whitelisting to template controller create/update operations
- Standardized JWT payload to use userId claim across all auth code
- Improved email controller security headers
- Added admin authentication middleware enhancements

---

## [0.1.0] - 2026-04-04

### Added
- Project initialization
- Core platform architecture
- Development environment setup
- Basic documentation structure

[Unreleased]: https://github.com/dineshjoshi-technologies/paperclip/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/dineshjoshi-technologies/paperclip/releases/tag/v0.1.0
