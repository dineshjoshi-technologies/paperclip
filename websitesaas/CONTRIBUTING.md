# Contributing to DJ Technologies Website SaaS Platform

Thank you for your interest in contributing! This document provides guidelines and setup instructions for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## Getting Started

### Prerequisites

- **Node.js** 20+ (use `.nvmrc` if available)
- **npm** 10+
- **Docker** and **Docker Compose** (for containerized development)
- **Git**

### Quick Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/websitesaas.git
cd websitesaas

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Set up environment
cp backend/.env.example backend/.env

# 4. Run database migrations
cd backend && npx prisma migrate dev

# 5. Start development servers
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Docker Development

```bash
# Start all services with Docker Compose
docker compose up -d

# Run migrations
docker compose exec backend npx prisma migrate dev

# View logs
docker compose logs -f
```

## Code Style

### JavaScript/Node.js (Backend)

- Use 2-space indentation
- Single quotes for strings
- Semicolons required
- ESLint rules enforced — run `npm run lint` before committing

### TypeScript/React (Frontend)

- Use 2-space indentation
- Single quotes for strings
- Semicolons required
- Strict TypeScript mode preferred
- ESLint + Prettier rules enforced

### General Guidelines

- Use meaningful variable and function names
- Keep functions small and focused
- Add JSDoc comments for public APIs
- Use TypeScript interfaces for data structures
- Follow existing patterns in the codebase

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation changes
- `style` — Code style changes (formatting, semicolons, etc)
- `refactor` — Code refactoring
- `test` — Adding or updating tests
- `chore` — Maintenance tasks, dependencies, config

### Examples

```
feat(builder): add video component support
fix(auth): resolve JWT refresh token expiration
docs(readme): update quick start instructions
chore(deps): update prisma to 5.22.0
```

## Pull Request Process

### Before Submitting

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Ensure all checks pass**:
   ```bash
   # Backend
   cd backend && npm run lint && npm test

   # Frontend
   cd frontend && npm run lint && npm run build
   ```

3. **Update documentation** if your changes affect user-facing functionality

### PR Checklist

- [ ] Tests added/updated for new functionality
- [ ] All existing tests pass
- [ ] Linting passes with no errors
- [ ] TypeScript types are correct (no `any` unless necessary)
- [ ] Documentation updated if needed
- [ ] Commit messages follow Conventional Commits
- [ ] PR description explains the "why" not just the "what"

### PR Template

When opening a PR, please include:

- **What** this PR changes
- **Why** the change is needed
- **How** to test the changes
- Screenshots for UI changes (if applicable)

## Testing

### Backend Tests

```bash
cd backend
npm test              # Run all tests
npm test -- --watch   # Watch mode
```

### Frontend Tests

```bash
cd frontend
npm test              # Run all tests
```

### Database Testing

```bash
cd backend
# Use Prisma Studio for manual testing
npm run db:studio
```

## Need Help?

- Check existing [issues](https://github.com/dj-technologies/websitesaas/issues)
- Read the [documentation](docs/)
- Ask questions in discussions

Thank you for contributing!
