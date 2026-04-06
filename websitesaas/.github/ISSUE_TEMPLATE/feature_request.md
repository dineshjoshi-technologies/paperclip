---
name: "Feature Request"
description: "Suggest an idea for this project"
title: "[Feature]: "
labels: ["enhancement", "triage"]
assignees: []
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to suggest a feature!
  - type: textarea
    id: problem
    attributes:
      label: Problem Statement
      description: Is your feature request related to a problem? Please describe
      placeholder: I'm always frustrated when...
    validations:
      required: true
  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: Describe the solution you'd like
    validations:
      required: true
  - type: textarea
    id: alternatives
    attributes:
      label: Alternative Solutions
      description: Describe alternatives you've considered
  - type: dropdown
    id: component
    attributes:
      label: Affected Component
      description: Which part of the application would this feature affect?
      options:
        - Frontend (Page Builder)
        - Frontend (Site Renderer)
        - Backend API
        - Authentication
        - Database
        - Docker/Infrastructure
        - Documentation
        - Other
    validations:
      required: true
  - type: dropdown
    id: priority
    attributes:
      label: Priority
      description: How important is this feature to you?
      options:
        - Critical (blocking my work)
        - High (significant improvement)
        - Medium (nice to have)
        - Low (minor enhancement)
    validations:
      required: true
  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      description: Add any other context or screenshots about the feature request here
