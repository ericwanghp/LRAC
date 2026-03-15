# Agent Teams Usage Guide

## Scope

Use Agent Teams when `parallelGroups` contains executable parallel work. Single-agent serial execution is allowed only when work is inherently sequential.

## Enforcement Level ⚠️ HARD GATE

1. For any phase with required agent roles, work MUST be executed by the matching subagent in a dedicated tmux pane.
2. The main agent MUST NOT directly execute implementation work that belongs to subagents.
3. If 2+ runnable tasks are independent, parallel execution is mandatory by default.
4. Any serial fallback must record a concrete reason in task updates (dependency, shared lock, or external blocker).

## Team-Lead Boundary

`project-manager` is the team-lead and is a coordinator only.

| Team-lead MUST do | Team-lead MUST NOT do |
|-------------------|-----------------------|
| Break down and schedule tasks | Write implementation code |
| Assign work to subagents | Edit project files for subagent tasks |
| Track progress and resolve blockers | Take over unfinished subagent work directly |
| Verify acceptance results | Bypass role separation |

## Parallel Execution Protocol

1. Read `.auto-coding/tasks.json` and identify runnable items from `parallelGroups` and dependency status.
2. Prioritize runnable tasks with this rule: `independent first, parallel first`.
3. Create team and tasks, then start each subagent with `run_in_background: true`.
4. Ensure each subagent runs in an independent tmux pane.
5. Name panes with `{role-abbreviation}-{task-abbreviation}` and keep a pane-to-task mapping.
6. Monitor progress via task status and messages, and coordinate cross-task dependencies.
7. Accept completion only after deliverables and required completion actions are confirmed.

## Parallelization Decision Rules

Use this decision order before execution:

1. Are there 2+ runnable tasks whose dependencies are already satisfied?
2. Do those tasks modify independent files or modules?
3. Do those tasks require different specialist roles?

If all answers are `yes`, tasks MUST run in parallel subagents.

Allowed serial execution conditions:
- Task has unresolved dependency.
- Tasks contend on the same critical file/module lock.
- External resource gate forces ordering.

## Subagent Lifecycle


Agents are temporary workers and must follow this lifecycle:

1. Spawn when work is ready.
2. Execute assigned scope.
3. Report completion or blocker.
4. Exit immediately after approval.
5. Recall later only when new scope requires that agent.

Never keep completed agents idle.

## Dispatch Checklist ⚠️ REQUIRED BEFORE WORK

Before any execution step:

1. Confirm phase and required roles from `.claude/rules/03-development-process.md`.
2. Confirm runnable tasks from `.auto-coding/tasks.json`.
3. Spawn matching subagents and bind each to one tmux pane.
4. Assign clear scope and acceptance target per subagent.
5. Start background execution and monitor heartbeat/status.

If any checklist item is missing, do not start implementation.

## Anti-Patterns (Must Not Happen)

- Main agent writes code while subagents are only "planned".
- One subagent handles multiple unrelated independent tasks.
- Multiple subagents share one tmux pane.
- Parallelizable tasks are run serially without documented reason.
- Completed subagents remain idle instead of exiting.

## Pane Naming Convention

Use `{role-abbreviation}-{task-abbreviation}`.

| Agent Type | Example |
|------------|---------|
| project-manager | `pm-coord` |
| frontend-dev | `fe-ui` |
| backend-dev | `be-api` |
| architect | `arch-design` |
| test-engineer | `test-e2e` |

## Completion Checklist Authority

Feature completion steps are defined in one source only:

- `.claude/rules/05-session-workflow.md` → `Feature Completion Checklist`

This file references that checklist and does not duplicate it.
