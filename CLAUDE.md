# Auto-Coding Framework

> Multi-role collaborative development framework based on Claude Code native Agent Teams + Anthropic's best practices for long-running agents.

## Overview

**Enable AI Agents to collaborate like a human team** — through clear role division, standardized workflows, and sustainable development of complex projects.

**Agent Teams TL;DR**
- Parallelizable work uses Agent Teams first, driven by `tasks.json` dependencies and `parallelGroups`.
- `project-manager` coordinates only; implementation stays with scoped subagents.
- Completion authority is single-sourced in `Feature Completion Checklist` from `.claude/rules/05-session-workflow.md`.

### Core Features

| Feature | Description |
|---------|-------------|
| **37 Specialized Agents** | Categorized: Development, Data, Security, Product, Documentation, Research |
| **8-Phase Development Process** | Requirements → Product → **UED (Stitch)** → Architecture → Breakdown → Development → Testing → Deployment → UAT |
| **Stitch Integration** | AI-powered UI/UX design via Google Stitch - generate visual prototypes, design systems, and component specs |
| **Dual-Track Task Management** | Native Agent Teams + Persistent Feature List (tasks.json) |
| **Cross-Session Context** | progress.txt records history, ensures long-cycle project continuity |

### Role Selection Guide

| Task | Choose |
|------|--------|
| Architecture design, tech selection | `architect` |
| Frontend UI development | `frontend-dev` |
| Backend API development | `backend-dev` |
| Data pipelines, ETL | `data-engineer` |
| Test case writing | `test-engineer` |
| Code review | `code-reviewer` |
| Requirements analysis, BRD | `business-analyst` |
| Product planning, PRD | `product-manager` |
| **Parallel task coordination** | `project-manager` (team-lead) |

> Full agent specs: [.claude/agents/AGENTS.md](.claude/agents/AGENTS.md)

---

## Rules

All detailed rules are in `.claude/rules/` directory:

| Rule File | Purpose |
|-----------|---------|
| [01-core-principles.md](.claude/rules/01-core-principles.md) | Dual-layer architecture, core principles |
| [02-task-management.md](.claude/rules/02-task-management.md) | tasks.json, progress.txt, Agent Teams tools |
| [03-development-process.md](.claude/rules/03-development-process.md) | 8-phase development process, testing requirements |
| [04-agent-teams.md](.claude/rules/04-agent-teams.md) | Agent Teams usage, project-manager as team-lead |
| [05-session-workflow.md](.claude/rules/05-session-workflow.md) | Session start/end, feature completion checklist |
| [06-file-conventions.md](.claude/rules/06-file-conventions.md) | File locations, language requirements, formats |
| [07-environment-git.md](.claude/rules/07-environment-git.md) | init.sh, git conventions, commit timing |
| [08-blockage-handling.md](.claude/rules/08-blockage-handling.md) | Blockage types, handling process, escalation |
| [09-testing.md](.claude/rules/09-testing.md) | Testing framework, coverage thresholds, and quality gates |
| [10-coding-guidelines.md](.claude/rules/10-coding-guidelines.md) | Coding standards, readability, and implementation conventions |
| [11-tooling-dependency-contract.md](.claude/rules/11-tooling-dependency-contract.md) | MCP and skill dependency consistency contract |

---

## Quick Reference

### Agent Teams Core Principles ⚠️ MANDATORY

1. **Use Agent Teams for executable parallel work**
   - Start from `.auto-coding/tasks.json` (`parallelGroups` + dependencies).
   - If 2+ runnable tasks are independent, parallel subagent execution is mandatory by default.
   - Single-agent serial execution is valid only for inherently sequential tasks.

2. **Enforce strict team-lead boundary**
   - `project-manager` coordinates only: breakdown, assignment, tracking, blocker resolution, and acceptance verification.
   - `project-manager` must not write implementation code or bypass role separation.
   - Work for required roles must execute in corresponding subagents, not in the main agent.

3. **Follow parallel execution protocol**
   - Start subagents in background and isolate each in an independent tmux pane.
   - Keep one pane per subagent and maintain pane-to-task mapping.
   - Coordinate dependencies through task status and messages.

4. **Treat subagents as temporary workers**
   - Spawn when ready, execute scoped work, report completion/blockers, exit after approval.
   - Never keep completed agents idle.

5. **Keep completion authority single-sourced**
   - Feature completion steps are defined only in `.claude/rules/05-session-workflow.md` under `Feature Completion Checklist`.

### Session Start Parallel Audit ⚠️ REQUIRED

1. Identify runnable tasks from `.auto-coding/tasks.json`.
2. Mark independence and required specialist role per task.
3. If 2+ independent tasks exist, run parallel subagents by default.
4. Bind one subagent to one tmux pane and keep pane-to-task mapping.
5. Any serial fallback must include explicit blocker reason in progress/task updates.

### Feature Completion Checklist ⚠️ MANDATORY

Every feature completion MUST follow these three steps in order:

```
1. Update tasks.json  →  passes: true, status: "completed"
2. Update progress.txt →  Append session record
3. Git commit          →  git commit -m "feat(FEAT-XXX): Description"
```

### Development Process

```
Phase 1: Requirements Analysis  →  BRD
Phase 2: Product Design         →  PRD
Phase 2.5: UI/UX Design (Stitch) →  DESIGN.md + Visual Prototypes + Component Specs
Phase 3: Architecture Design    →  Architecture Doc (must review)
Phase 4: Task Breakdown         →  tasks.json
Phase 5: Dev & Unit/Func Tests  →  Code + Tests (coverage policy in `.claude/rules/09-testing.md`)
Phase 6: Integration & Regress  →  E2E Tests
Phase 7: Deploy & UAT Loop      →  Production + Verification
Phase 8: PM Coordination        →  project-manager (team-lead)

```

Team-lead coordination context is always-on from Phase 1 to Phase 8 via `.claude/context/phase-manifest.json`.

### Stitch Design Workflow (Phase 2.5)

**Required Skills**: `ui-ux-pro-max` → `enhance-prompt` → `stitch-loop` → `design-md` → `shadcn-ui`

| Step | Skill | Output |
|------|-------|--------|
| 1. Brainstorm Style & Theme | `ui-ux-pro-max` | Confirmed direction via multi-round user Q&A |
| 2. Enhance Prompt | `enhance-prompt` | `.stitch/next-prompt.md` |
| 3. Generate Design | `stitch-loop` | `.stitch/designs/{page}.html` + `.png` |
| 4. Document System | `design-md` | `.stitch/DESIGN.md` |
| 5. Iterate Pages | `stitch-loop` | Additional pages via baton |
| 6. Component Spec | `shadcn-ui` | `docs/design/UI-SPEC-*.md` |

### File Locations

| File | Location | Purpose |
|------|----------|---------|
| Feature List | `.auto-coding/tasks.json` | Feature completion status |
| Progress Notes | `.auto-coding/progress.txt` | Cross-session context |
| Phase Context Manifest | `.claude/context/phase-manifest.json` | Phase context packs and always-on team-lead context |
| BRD | `docs/brd/BRD-{project}.md` | Business requirements |
| PRD | `docs/prd/PRD-{project}.md` | Product requirements |
| **Design System** | `.stitch/DESIGN.md` | Stitch design system (colors, typography, components) |
| **Visual Prototypes** | `.stitch/designs/*.png` | Generated visual designs |
| **HTML Templates** | `.stitch/designs/*.html` | Reference HTML implementations |
| **UI Specifications** | `docs/design/UI-SPEC-*.md` | Component specifications for developers |
| Architecture | `docs/architecture/ARCH-{project}.md` | Technical design |
| CHANGELOG | `docs/CHANGELOG.md` | Change tracking |
| LESSONS | `.auto-coding/LESSONS_LEARNED.md` | Lessons learned |

---

## Language Requirements ⚠️ IMPORTANT

**All core framework files MUST be written in English**:

- `CLAUDE.md`
- `.auto-coding/` directory (tasks.json, progress.txt)
- `.claude/agents/*.md`
- `.claude/rules/*.md`
- `docs/CHANGELOG.md`
- `.auto-coding/LESSONS_LEARNED.md`

**Exception**: User-facing documentation (BRD, PRD, etc.) can be in the project's primary language.
