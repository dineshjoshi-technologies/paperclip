# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
