---
name: "Bug Report"
description: "Report a bug to help us improve"
title: "[Bug]: "
labels: ["bug", "triage"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!
  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear and concise description of what the bug is
      placeholder: When I try to..., the application...
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior
      value: |
        1. Go to '...'
        2. Click on '....'
        3. Scroll down to '....'
        4. See error
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What you expected to happen
    validations:
      required: true
  - type: textarea
    id: actual
    attributes:
      label: Actual Behavior
      description: What actually happened
    validations:
      required: true
  - type: dropdown
    id: component
    attributes:
      label: Affected Component
      description: Which part of the application is affected?
      options:
        - Frontend (Page Builder)
        - Frontend (Site Renderer)
        - Backend API
        - Authentication
        - Database
        - Docker/Infrastructure
        - Other
    validations:
      required: true
  - type: input
    id: version
    attributes:
      label: Version
      description: What version of the application are you running?
      placeholder: "0.1.0"
  - type: dropdown
    id: environment
    attributes:
      label: Environment
      description: Where did you encounter this bug?
      options:
        - Local Development
        - Docker Compose
        - Production
    validations:
      required: true
  - type: textarea
    id: logs
    attributes:
      label: Relevant Log Output
      description: Copy and paste any relevant log output
      render: shell
  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      description: Add any other context about the problem here (screenshots, etc.)
