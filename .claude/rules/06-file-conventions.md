# File Conventions

## Document Output Locations

| Document Type | Location |
|---------------|----------|
| BRD | `docs/brd/` |
| PRD | `docs/prd/` |
| Architecture | `docs/architecture/` |
| System Design | `docs/design/` |
| Test Analysis | `docs/test/` |
| UI/UX | `docs/design/` |
| Phase Context Manifest | `.claude/context/phase-manifest.json` |
| CHANGELOG | `docs/CHANGELOG.md` |
| LESSONS_LEARNED | `.auto-coding/LESSONS_LEARNED.md` |

## Language Requirements ⚠️ IMPORTANT

**All core framework files MUST be written in English**

| File/Directory | Language | Reason |
|----------------|----------|--------|
| `CLAUDE.md` | English | Framework specification, must be universally readable |
| `.auto-coding/` directory | English | Project data files, automation compatibility |
| `docs/CHANGELOG.md` | English | Change tracking, team collaboration |
| `.auto-coding/LESSONS_LEARNED.md` | English | Knowledge retention, team collaboration |
| `.claude/agents/*.md` | English | Agent definitions, must be universally readable |
| `.claude/rules/*.md` | English | Rule definitions, must be universally readable |

**Why English Only**:
- **Automation**: Scripts and tools may parse these files
- **Collaboration**: Team members may have different language backgrounds
- **Consistency**: Mixed languages cause confusion
- **AI Processing**: English is the primary language for AI understanding

**⚠️ Exception**: User-facing documentation in `docs/` (BRD, PRD, etc.) can be in the project's primary language.

## tasks.json Format

```json
{
  "version": "3.0",
  "project": "project-name",
  "parallelGroups": {},
  "features": [
    {
      "id": "inital-p1r-001",
      "description": "Feature description",
      "taskBreakdown": {
        "dependencies": [],
        "parallelGroup": null
      },
      "acceptanceCriteria": {
        "criteria": ["Acceptance criteria"]
      },
      "status": {
        "status": "pending",
        "passes": false,
        "blockReason": null,
        "resumeContext": null
      },
      "timeline": {
        "startedAt": null,
        "completedAt": null
      },
      "executionHistory": []
    }
  ]
}
```

**Rules**:
- Coding Agent updates `status.passes`, `status.status`, timeline fields, and execution history
- Set `status.passes: true` only after feature completion
- `features[].id` must match `{iteration}-{phaseSymbol}-{NNN}`
- `iteration`: `inital` or `imac-{abbr}`
- `phaseSymbol`: `p1r` `p1b` `p2p` `p25d` `p3a` `p4b` `p5d` `p6t` `p7d` `p8m`

## progress-summary.md Format

**Purpose**: Lightweight context handoff for routine work. Keep it short and current.

**Location**: `.auto-coding/progress-summary.md`

```markdown
# Progress Summary

## Current Focus
- Active phase: Phase 5
- Active features: [list]

## Recent Decisions
- [Decision]

## Open Risks
- [Risk]

## Next Recommended Step
- [Step]
```

## progress.txt Format

**Timestamp Format**: ISO 8601 (`YYYY-MM-DDTHH:MM:SSZ`)

```markdown
# ============================================================
# Session: {ID} | Timestamp: {ISO8601} | Role: {agent}
# ============================================================

## Starting State
- Current Features: [list]
- Blockers: [list]

## Execution Content
1. [Action]
2. [Action]

## Ending State
- Completed: [list]
- Remaining Issues: [list]

## Next Steps
- Suggested next task

---
```

## CHANGELOG.md - Change Management Log

**Purpose**: Records all important project changes, ensures changes are traceable, auditable, and rollback-able

**Location**: `docs/CHANGELOG.md`

**Change Types**:
| Type | Code | Description |
|------|------|-------------|
| Requirement Change | REQ | Business/feature requirements add/modify/delete |
| Architecture Change | ARCH | Technical architecture, system design adjustments |
| Code Refactor | REFACTOR | Code structure optimization, no feature changes |
| Bug Fix | FIX | Defect fixes |
| Performance | PERF | Performance-related improvements |
| Security | SEC | Security vulnerability fixes |
| Documentation | DOC | Documentation add/modify/delete |

## LESSONS_LEARNED.md - Lessons Learned

**Purpose**: Records experiences, lessons, and best practices during development for future reference

**Location**: `.auto-coding/LESSONS_LEARNED.md`

**Category Tags**:
| Tag | Description |
|-----|-------------|
| #architecture | Architecture design related |
| #workflow | Workflow related |
| #communication | Communication coordination related |
| #testing | Testing related |
| #performance | Performance related |
| #security | Security related |
| #agent-collaboration | Agent collaboration related |

**Experience Level**:
| Level | Description |
|-------|-------------|
| ⭐⭐⭐ | Critical experience, must follow |
| ⭐⭐ | Important experience, strongly recommended |
| ⭐ | Reference experience, adopt as needed |
