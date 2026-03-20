---
description: Iteratively evolve an existing project with automatic phase detection, impact analysis, and change logging.
---

You are running the **/IMAC** command (Install, Modify, And, Change).

Your responsibilities are mandatory and must be completed in order:

1) Build the IMAC intake interaction
- Start with question-driven intake by default. Do not require command arguments.
- If the user adds extra text after `/IMAC`, treat it only as initial context, then still run full intake questions.
- The interaction must include:
  - At least one **single-select** question (radio-style options, user chooses one).
  - At least one **multi-select** question (checkbox-style options, user can choose multiple).
- Use concise options and proceed quickly to execution.

2) Automatically detect the correct starting phase
- Infer the earliest phase that should be revisited based on the requested change.
- Use this mapping:
  - **Phase 1 (BRD)**: Business goals, market, user segment, value proposition, success metrics.
  - **Phase 2 (PRD)**: Product behavior, workflow, feature definition, acceptance criteria.
  - **Phase 2.5 (Design)**: UI/UX direction, visual style, interaction design, component behavior.
  - **Phase 3 (Architecture)**: Tech stack, system boundaries, service decomposition, data model, infra.
  - **Phase 4 (Task Breakdown)**: Work decomposition, dependencies, ownership, sequencing.
  - **Phase 5+ (Implementation/Test/Deploy)**: Pure execution changes without upstream requirement/design impact.
- If uncertain, choose the earliest plausible phase to reduce downstream rework.

3) Explain the phase decision
- Output:
  - Selected start phase
  - Why this phase is chosen
  - Why earlier phases are or are not required
  - Recommended downstream phases to rerun

4) Run impact analysis before making changes
- Analyze at least these dimensions:
  - Business/product impact
  - UX/design impact
  - Architecture/technical impact
  - Task/dependency impact
  - Test and release impact
  - Risk and rollback considerations
- Explicitly identify:
  - Files/docs likely to change
  - Existing artifacts needing regeneration
  - Potential breaking changes

5) Produce IMAC execution plan
- Provide an ordered plan from the detected start phase forward.
- Include clear entry/exit criteria for each phase.
- Keep tasks actionable and aligned with the framework workflow.

5.5) Enforce IMAC task ID naming
- Any new `features[].id` created in this IMAC cycle must follow:
  - `{iteration}-{phaseSymbol}-{NNN}`
- For IMAC iterations, `iteration` must be:
  - `imac-{abbr}` where `{abbr}` is a short, meaningful intake abbreviation
- Allowed `phaseSymbol` values:
  - `p1r` `p1b` `p2p` `p25d` `p3a` `p4b` `p5d` `p6t` `p7d` `p8m`
- `NNN` must be 3 digits (`001`, `002`, ...).

6) Record change log updates
- Append a structured IMAC entry to `.auto-coding/progress.txt`.
- Update `docs/CHANGELOG.md` if it exists; if it does not exist, create it.
- The IMAC changelog entry must include:
  - Request summary
  - Detected start phase
  - Impact scope
  - Key decisions
  - Changed files
  - Verification results
  - Follow-up actions

7) Execute and verify
- Implement changes according to the approved IMAC plan.
- Run relevant tests and quality checks.
- Report completed results, remaining risks, and next-step recommendations.

Examples:
- `/IMAC`
  - Usually requires single-select + multi-select intake first, then starts from PRD or Design depending on answers.
