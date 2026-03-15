# Standard Session Workflow

## Session Start

```bash
# 1. Sync code
git pull

# 2. View feature status
cat .auto-coding/tasks.json

# 3. Understand historical context
cat .auto-coding/progress-summary.md

# 4. Set active phase and load phase context
AUTO_CODING_PHASE=1 node .claude/hooks/read-context.js

# 5. Validate environment
./init.sh
```

For deeper history, read `.auto-coding/progress.txt` only when the summary is insufficient.
Set `AUTO_CODING_PHASE` to `1`, `2`, `2.5`, `3`, `4`, `5`, `6`, `7`, or `8` based on your current stage.

## Parallel Readiness Audit ⚠️ REQUIRED BEFORE EXECUTION

Run a quick audit immediately after Session Start and before selecting execution mode.

### 30-Second Audit Checklist

1. List runnable tasks from `.auto-coding/tasks.json` (`passes: false` + dependencies satisfied).
2. Mark which tasks are independent (no shared critical file/module lock).
3. Map each runnable task to the required specialist role from `.claude/rules/03-development-process.md`.
4. If 2+ independent runnable tasks exist, choose parallel subagent execution by default.
5. If serial execution is chosen, record blocker reason in task/progress update.

### Dispatch Requirement

- Matching subagent per required role is mandatory.
- One subagent per independent task.
- One tmux pane per subagent.
- Main agent remains coordinator and does not execute subagent implementation scope.

### Audit Output Template (must be recorded in notes/progress)

```text
Parallel Audit
- Runnable tasks: [FEAT-001, FEAT-002]
- Independent tasks: [FEAT-001, FEAT-002]
- Role mapping: FEAT-001->frontend-dev, FEAT-002->test-engineer
- Execution mode: parallel
- Pane mapping: fe-ui, test-e2e
- Serial blocker reason: N/A
```

## Select Task

1. Find features with `passes: false` in tasks.json
2. Check if their `dependencies` all have `passes: true`
3. Select eligible task to execute

## Execute Task

1. Dispatch matching subagents and tmux panes based on the parallel audit result
2. Implement feature code in assigned subagent scopes
3. Write/run tests
4. Ensure tests pass
5. Complete the `Feature Completion Checklist` in this file

## Feature Completion Checklist ⚠️ MANDATORY

This section is the single authority for feature completion steps. Other rule files must reference this section and must not duplicate it.

Every completed feature MUST execute these steps in order:

| Step | Required Action | Required Result |
|------|-----------------|-----------------|
| 1 | Update `.auto-coding/tasks.json` | `status.passes: true`, `status.status: "completed"`, completion metadata updated |
| 2 | Update `.auto-coding/progress.txt` | Session record appended with execution and next-step context |
| 3 | Commit to git | Atomic commit for the feature using standard message convention |

## Commit Message Convention

```
feat(FEAT-XXX): Brief description

- Specific change 1
- Specific change 2

Completed: [feature ID]
Tests: X passed, Y failed
```

## Session End

**Session End applies to the entire work session, not individual features:**

```bash
# Verify all completed features have been:
# 1. Marked in tasks.json (passes: true)
# 2. Recorded in progress.txt
# 3. Committed to git

# Final session summary:
echo "Session completed: N features done"
```
