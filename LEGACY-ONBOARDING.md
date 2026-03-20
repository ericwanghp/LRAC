# Legacy Onboarding — Framework Integration Plan

## 1. Goals & Principles

- **Goal**: Bring existing projects under framework governance without large-scale refactoring.
- **Principle**: Take over the process first, optimize code incrementally; make it traceable first, perfect it later.
- **Constraint**: Do not rewrite business architecture in one pass; do not block the current release cadence.

## 2. Scope

Applies to projects that are already live or in development, meeting any of the following:

- Has existing code and branch strategy, but lacks a unified task decomposition standard.
- Has partial documentation but is missing staged deliverables and a recoverable execution pipeline.
- Has ongoing requirement changes that need to be managed through `/IMAC`.

## 3. Pre-Onboarding Checklist

Run the following in the target project root:

```bash
pwd
ls -la
```

Confirm the following:

- Primary tech stack (Node/Python/Go etc.) and current package manager.
- Available quality commands (e.g., typecheck, lint, test).
- Whether `.claude` or `.auto-coding` directories already exist.
- Whether critical historical documents exist (requirements, design, architecture, changelog).

## 4. Quick Onboarding Process

### Step A: Sync Framework Layer

In the framework repository:

```bash
chmod +x setup.sh
./setup.sh upgrade /absolute/path/to/legacy-project
```

This syncs framework-layer files while preserving project state and business code.

### Step B: Initialization Verification

Enter the target project and run:

```bash
./init.sh
npm run typecheck
npm run lint
```

If the project is not npm-based, substitute with the project's equivalent quality commands.

### Step C: Establish Initial Task Board

If the target project does not yet have a task system, generate and validate an initial task structure:

- Create a task skeleton based on `.auto-coding/config/tasks.init.template.json`.
- Keep only the task items relevant to the current project.
- Place unconfirmed requirements in a "pending clarification" task to avoid jumping straight into development.

## 5. Phase Mapping Strategy (Legacy Projects)

Start from the "earliest phase needing remediation" rather than defaulting to the development phase:

- Unclear requirements boundary: remediate from Phase 1 (BRD) or Phase 2 (PRD).
- Chaotic UX/interactions: remediate from Phase 2.5 (Design).
- Highly coupled system: remediate from Phase 3 (Architecture).
- Adding only a clear, small feature: can enter from Phase 4 (Task Breakdown) or Phase 5+.

## 6. Task ID Naming Convention

`features[].id` must follow:

`{iteration}-{phaseSymbol}-{NNN}`

### 6.1 Iteration Rules

- First onboarding phase: use `inital`
- Subsequent iterations: use `imac-{abbr}`

Examples:

- `inital-p1r-001`
- `inital-p3a-004`
- `imac-pay-p2p-001`
- `imac-checkout-p25d-002`

### 6.2 phaseSymbol Rules

Allowed values:

- `p1r` `p1b` `p2p` `p25d` `p3a` `p4b` `p5d` `p6t` `p7d` `p8m`

### 6.3 Sample Initial IDs (10 Examples)

- `inital-p1r-001`
- `inital-p1b-002`
- `inital-p2p-003`
- `inital-p25d-004`
- `inital-p3a-005`
- `inital-p4b-006`
- `inital-p5d-007`
- `inital-p6t-008`
- `inital-p7d-009`
- `inital-p8m-010`

## 7. Using `/IMAC` After Takeover

After onboarding, all requirement changes go through `/IMAC`:

- Run intake first, then auto-detect the earliest restart phase.
- Perform impact analysis and generate an execution plan.
- New tasks must use `imac-{abbr}-{phaseSymbol}-{NNN}`.
- On completion, record to `.auto-coding/progress.txt` and sync changelog entries.

## 8. Acceptance Criteria

A project is considered successfully onboarded when:

- `./init.sh` runs and passes basic environment checks.
- Quality commands run and failures are traceable.
- All Task IDs in `.auto-coding/tasks.json` conform to the naming convention.
- Team can complete iterative闭环 through `/IMAC`.

## 9. Common Risks & Handling

- **Scripts don't match project ecosystem**: substitute with the project's existing equivalent quality commands.
- **Too many initial tasks to make progress**: keep only the main-path tasks; move secondary items into subsequent IMAC cycles.
- **Incomplete historical documents**: supplement the minimum necessary context first; do not block the main-path takeover.
