# Agent Registry Drift Report

## Overview
Comparison between live company agent registry (as of 2026-05-13) and the documented agent registry in `/home/dj/.paperclip/instances/default/companies/d03eb01c-2f4c-4c3a-8646-d02cef79e5ca/memory/resources/agent-registry.md`

## Current Live Agent Registry (from API)
Total: 17 agents

| ID | Role | Status | Notes |
|----|------|--------|-------|
| 9a94e5ed-1000-4070-beb9-a5916ae5de51 | Delivery Agent | idle | Owns project delivery tracking, execution, client onboarding |
| a274c508-16ce-46f4-bbca-fbea10383d4b | DevOps Engineer | running | Manages infrastructure, CI/CD pipelines, Docker containers, Nginx configuration, hosting automation, and deployment systems |
| 262f36bd-07a3-44e4-94d5-4cb6e1293c3e | Analytics Reporting Manager | running | Owns business intelligence, metrics tracking, dashboard creation, performance reporting, and data-driven decision support |
| e869d214-7556-4172-b5b8-c3e5efb7cbe8 | Frontend Developer | error | Builds React/Next.js UI components, implements drag-and-drop builder, creates templates, and ensures pixel-perfect responsive designs |
| d2ce89de-4538-4f28-9122-eb94e2309a6e | Backend Developer | error | Builds Node.js APIs, manages PostgreSQL database, implements authentication, and designs scalable backend architecture |
| ec770318-4628-4199-aafd-f0299817892b | Plan Synthesizer | running | Synthesizes all 3 planning documents into a single unified master plan |
| e947e040-3ef5-442e-8f7f-545d486fc7ca | QA Engineer | idle | Automated code review, bug detection, test coverage analysis, quality assurance |
| a8466560-c150-4c82-b1d2-882a510ea544 | Support Agent | idle | Owns support ticket triage/resolution, customer success |
| f1aa4e28-36ad-4a61-a8b9-8fd5d0059bf3 | UX Design Planner | idle | Creates UX/UI design plans, user flow diagrams, and frontend component strategies |
| 44463576-cc21-4aca-9062-ef04dd2412a2 | SEO Content Manager | idle | Owns content strategy, SEO optimization, blog/content creation, social media management, and keyword research |
| 0272a3f0-b991-4214-baf1-3e7a989e1272 | Product Strategy Planner | running | Creates product strategy plans, feature roadmaps, and business model analysis |
| 5ff63b72-2e7f-4e87-96f7-89b97a75a511 | Architecture Planner | idle | Creates technical architecture plans, system design documents, and code structure proposals |
| c4fc3cfd-4207-4b15-b825-7fb356d03e7e | Marketing Researcher | idle | Market research, competitive analysis, lead generation, trend identification, content strategy research |
| 84285272-cb37-4b65-9167-e43a9e73c31f | Finance Manager | running | Owns financial management, budgeting, invoicing, financial reporting, and expense tracking |
| 342eb21f-7c2c-4602-a0b7-a3db75765f1e | CEO | error | shell, files, browser |
| 5c3d16f0-c3b0-419d-9c7a-3f2098fce51d | Founding Engineer | error | Manages infrastructure, CI/CD pipelines, Docker containers, Nginx configuration, hosting automation, and deployment systems, etc. |
| 766d7c9b-90c2-4169-8c6c-cb705b1d0636 | Sales Agent | idle | Owns sales pipeline management, proposals, deal closure, pricing strategy support |

## Documented Agent Registry (from file)
Total: 7 agents

| ID | Role | Status | Config |
|----|------|--------|--------|
| 342eb21f | CEO | Active | AGENTS.md, SOUL.md, HEARTBEAT.md, TOOLS.md |
| 5c3d16f0 | Founding Engineer | Active | AGENTS.md, SOUL.md, HEARTBEAT.md |
| e947e040 | QA Engineer | Active | AGENTS.md |
| c4fc3cfd | DevOps/Infra | Active | AGENTS.md, SOUL.md, HEARTBEAT.md, TOOLS.md |
| d2ce89de | Product Manager | Active | AGENTS.md, SOUL.md, HEARTBEAT.md, TOOLS.md |
| e869d214 | Growth/Sales | Active | AGENTS.md, SOUL.md, HEARTBEAT.md, TOOLS.md |
| a274c508 | Delivery/Support | Active | AGENTS.md, SOUL.md, HEARTBEAT.md, TOOLS.md |

## Coverage Gaps (from documented file)
- Automation (workflows) — not yet assigned
- Finance (billing, MRR) — not yet assigned
- SEO/Content — not yet assigned
- Memory/Knowledge — not yet assigned
- Reporting/Metrics — not yet assigned

## Drift Analysis

### Missing from Documented Registry (10 agents):
1. Delivery Agent (9a94e5ed-1000-4070-beb9-a5916ae5de51)
2. Analytics Reporting Manager (262f36bd-07a3-44e4-94d5-4cb6e1293c3e)
3. Frontend Developer (e869d214-7556-4172-b5b8-c3e5efb7cbe8)
4. Backend Developer (d2ce89de-4538-4f28-9122-eb94e2309a6e)
5. Plan Synthesizer (ec770318-4628-4199-aafd-f0299817892b)
6. Support Agent (a8466560-c150-4c82-b1d2-882a510ea544)
7. UX Design Planner (f1aa4e28-36ad-4a61-a8b9-8fd5d0059bf3)
8. SEO Content Manager (44463576-cc21-4aca-9062-ef04dd2412a2)
9. Architecture Planner (5ff63b72-2e7f-4e87-96f7-89b97a75a511)
10. Sales Agent (766d7c9b-90c2-4169-8c6c-cb705b1d0636)

### Role Name Mismatches:
1. Documented "DevOps/Infra" → Live "DevOps Engineer" (a274c508)
2. Documented "Product Manager" → Not found in live registry (d2ce89de is Backend Developer)
3. Documented "Growth/Sales" → Not found in live registry (e869d214 is Frontend Developer)
4. Documented "Delivery/Support" → Split into Live "Delivery Agent" (9a94e5ed) and "Support Agent" (a8466560)

### Status Inconsistencies:
1. CEO: Documented Active → Live Error
2. Founding Engineer: Documented Active → Live Error
3. QA Engineer: Documented Active → Live Idle
4. DevOps/Infra: Documented Active → Live Idle (a274c508 is DevOps Engineer but shows idle in some contexts)

### New Functional Areas in Live Registry Not Documented:
1. Analytics Reporting
2. Plan Synthesis
3. UX Design Planning
4. Architecture Planning
5. Sales Agency

## Impact Assessment
The drift creates significant risks:
1. Misassignment of tasks due to outdated role mappings
2. Inaccurate coverage analysis leading to gaps in critical functions
3. Inefficient resource allocation based on stale data
4. Poor executive decision-making due to incorrect agent capability visibility

## Recommendations
1. Update the documented agent registry to reflect the current live state
2. Establish a regular synchronization process between live registry and documentation
3. Clarify role responsibilities to eliminate ambiguity
4. Address the noted coverage gaps through hiring or role expansion