# Contributing to DJ Technologies

Thank you for your interest in contributing! We welcome contributions of all kinds — bug fixes, features, documentation, and more.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Write or update tests as needed
5. Commit using [Conventional Commits](#commit-conventions)
6. Push to your fork and open a Pull Request

## Development Setup

### Prerequisites

- **Node.js 20+** (see `.nvmrc` for exact version)
- **Docker** and **Docker Compose**
- **npm** (comes with Node.js)

### Quick Start

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/paperclip.git
cd paperclip

# Install dependencies
npm install

# Start development environment
docker compose -f docker-compose.dev.yml up -d

# Run tests
npm test

# Run linting
npm run lint
```

### Project Structure

```
├── backend/              # Express.js API server
├── website-platform/     # Next.js frontend application
├── nginx/                # Nginx reverse proxy configuration
├── docker-compose.yml    # Production Docker configuration
├── docker-compose.dev.yml # Development Docker configuration
└── .github/workflows/    # CI/CD pipeline definitions
```

## Commit Conventions

We use **Conventional Commits** to standardize commit messages and enable automated changelog generation.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation changes
- `style` — Code style changes (formatting, semicolons, etc.)
- `refactor` — Code refactoring (no feature or bug fix)
- `test` — Adding or updating tests
- `chore` — Maintenance tasks, dependencies, config changes
- `ci` — CI/CD pipeline changes
- `perf` — Performance improvements

### Examples

```
feat(backend): add user authentication endpoint
fix(frontend): resolve drag-and-drop positioning bug
docs(readme): update quick start instructions
ci(github-actions): add codeql scanning workflow
```

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Tests pass locally (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] TypeScript compiles without errors (`npm run type-check` or `npm run build`)
- [ ] Documentation updated if needed
- [ ] Commit messages follow Conventional Commits format

### PR Template

When opening a PR, please include:

1. **Description** — What does this change do?
2. **Type of Change** — Bug fix, feature, docs, refactor, etc.
3. **Testing** — How was this tested?
4. **Screenshots** (if UI changes)
5. **Related Issues** — Link any related issues

### Review Process

1. All PRs require at least one review
2. CI must pass (lint, test, build)
3. Address review comments promptly
4. Squash and merge once approved

## Coding Standards

### General

- Use meaningful variable and function names
- Keep functions small and focused
- Write comments for complex logic only
- Follow existing code patterns and conventions

### JavaScript/TypeScript

- Use TypeScript for new code
- Prefer `const` over `let`, avoid `var`
- Use async/await over callbacks
- Enable strict mode in TypeScript config

### Frontend (Next.js)

- Use functional components with hooks
- Prefer server components where possible
- Follow React best practices

### Backend (Express.js)

- Use middleware pattern consistently
- Validate all inputs
- Handle errors gracefully
- Log appropriately

## Testing

- Write unit tests for new functionality
- Update existing tests when modifying code
- Aim for meaningful test coverage
- Run full test suite before submitting PRs

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.spec.js
```

## Documentation

- Update README.md for significant changes
- Document new APIs
- Add JSDoc/TSDoc comments for public functions
- Keep INFRASTRUCTURE.md current for deployment changes

## Branch Naming Conventions

We use semantic branch names to track work:

```
<type>/<short-description>

Examples:
feat/user-authentication
fix/website-publishing-bug
docs/api-reference-update
refactor/database-queries
```

**Types:**

- `feat/` — New feature or enhancement
- `fix/` — Bug fix
- `docs/` — Documentation changes
- `refactor/` — Code refactoring
- `test/` — Test additions or fixes
- `chore/` — Maintenance tasks

## Git Commit Attribution

All commits must use DJ Technologies attribution:

- Use: `Authored by DJ Technologies <dinesh@djtechnologies.net>`
- Never use: `Co-Authored-By: Paperclip <noreply@paperclip.ing>`

## Questions?

Open an issue for questions or reach out to the maintainers.
