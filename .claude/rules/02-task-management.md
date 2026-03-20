# Dual-Track Task Management

## System Comparison

| Dimension | Native Agent Teams | tasks.json / progress.txt |
|-----------|-------------------|-------------------------|
| **Lifecycle** | Session-level | Project-level |
| **Persistence** | Disappears when session ends | Permanent storage |
| **Version Control** | None | Git managed |
| **Primary Use** | Real-time coordination | State persistence |
| **Operator** | project-manager | All Agents |
| **Query Time** | When assigning/executing tasks | Session start/end |

## tasks.json (Enhanced Feature List)

**Purpose**: Records all project features and their completion status, supports long-cycle, interruptible, recoverable project management

**Version**: v3.0

### Core Fields

| Field | Type | Description | Who Can Modify |
|-------|------|-------------|----------------|
| `id` | string | Unique identifier | Set at creation, cannot modify |
| `taskBreakdown.dependencies` | array | List of dependent feature IDs | architect |
| `taskBreakdown.parallelGroup` | string | Parallel group name | architect |
| `acceptanceCriteria.criteria` | array | List of acceptance criteria | product-manager |
| `timeline.startedAt` | datetime | Actual start time | Agent when starting |
| `timeline.completedAt` | datetime | Actual completion time | Agent when completing |
| `status.status` | string | Current status | Coding Agent |
| `status.passes` | boolean | Whether passed acceptance | Coding Agent |
| `status.blockReason` | object | Block reason details | Coding Agent |
| `status.resumeContext` | object | Resume context | Coding Agent |
| `executionHistory` | array | Execution history records | Coding Agent |

### Task ID Naming Convention ⚠️ MANDATORY

`features[].id` must use:

`{iteration}-{phaseSymbol}-{NNN}`

Where:

- `iteration`
  - `inital` for first project bootstrap
  - `imac-{abbr}` for follow-up `/IMAC` iterations
- `phaseSymbol` must be one of:
  - `p1r` `p1b` `p2p` `p25d` `p3a` `p4b` `p5d` `p6t` `p7d` `p8m`
- `NNN` is a 3-digit sequence (for example: `001`, `002`)

Valid examples:

- `inital-p1r-001`
- `inital-p25d-003`
- `imac-auth-p3a-001`
- `imac-chatflow-p5d-012`

Phase symbol mapping:

| Phase Symbol | Phase |
|-------------|-------|
| `p1r` | Phase 1 Research |
| `p1b` | Phase 1 BRD |
| `p2p` | Phase 2 PRD |
| `p25d` | Phase 2.5 Design |
| `p3a` | Phase 3 Architecture |
| `p4b` | Phase 4 Breakdown |
| `p5d` | Phase 5 Development |
| `p6t` | Phase 6 Testing |
| `p7d` | Phase 7 Deploy/UAT |
| `p8m` | Phase 8 Project Management |

### Parallel Tasks (parallelGroup)

```json
{
  "parallelGroups": {
    "auth-module": {
      "name": "Authentication Module",
      "features": ["FEAT-003", "FEAT-004"],
      "canStartWhen": ["FEAT-001"],
      "status": "pending"
    }
  }
}
```

### Interrupt Recovery (blockReason + resumeContext)

**When blocked**, record:
- `blockReason`: Type, description, resolution needed
- `resumeContext`: lastStep, nextStep, partialWork, suggestedActions

**When resuming**:
1. Read `blockReason` to understand why blocked
2. Read `resumeContext.lastStep` to know where we left off
3. Read `resumeContext.nextStep` to know what to do next
4. Read `resumeContext.suggestedActions` to know prerequisites

## progress.txt (Progress Notes)

**Purpose**: Records session execution content, passes cross-session context

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

## Native Agent Teams

| Tool | Purpose | User |
|------|---------|------|
| TeamCreate | Create collaboration team | project-manager |
| TaskCreate | Create tasks | project-manager |
| TaskUpdate | Update task status/assign | project-manager, Agent |
| TaskList | View task list | All roles |
| SendMessage | Agent-to-Agent communication | All roles |
