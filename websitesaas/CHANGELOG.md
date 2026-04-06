# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial project setup with Next.js frontend and Express backend
- Drag-and-drop page builder with dnd-kit
- 10 component types (heading, paragraph, text, image, button, container, video, divider, spacer, form)
- Real-time preview with viewport switching (desktop/tablet/mobile)
- Undo/redo functionality with keyboard shortcuts
- Auto-save and manual save for pages
- JWT authentication with refresh tokens
- Role-based access control (USER, ADMIN, AGENCY)
- PostgreSQL database with Prisma ORM
- Docker Compose setup with 4 services (frontend, backend, postgres, nginx)
- Nginx reverse proxy with rate limiting and gzip compression
- Zod validation on API endpoints
- Security headers with Helmet.js
- CORS configuration
- API rate limiting (express + nginx)
- Health check endpoint
- Database schema with User, Website, Template, Page, and Component models
- Public site rendering for published websites
- Template system with categories and premium flag
- README.md with comprehensive documentation
- CONTRIBUTING.md with development guidelines
- SECURITY.md with vulnerability reporting process
- GitHub issue and PR templates
- Dependabot configuration for automated dependency updates
- CodeQL security scanning workflow
- CI pipeline with lint, test, build, and Docker verification
- Markdown linting configuration

### Changed

### Deprecated

### Removed

### Fixed

### Security

[Unreleased]: https://github.com/dj-technologies/websitesaas/compare/v0.1.0...HEAD
