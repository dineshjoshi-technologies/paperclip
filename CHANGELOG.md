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

### Changed
- Updated .env.example with payment routes
- Enhanced authentication API contract
- Improved Prisma schema and generation in Dockerfile
- Updated project documentation across all files
- Added production logging and error handling

### Removed
- Removed npm cache from CI/CD to resolve GitHub Actions build error

### Fixed
- CI/CD pipeline failures and workflow permissions
- Corrected globals.css import path in layout
- Resolved database migration issues

### Security

---

## [0.1.0] - 2026-04-04

### Added
- Project initialization
- Core platform architecture
- Development environment setup
- Basic documentation structure

[Unreleased]: https://github.com/dineshjoshi-technologies/paperclip/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/dineshjoshi-technologies/paperclip/releases/tag/v0.1.0
