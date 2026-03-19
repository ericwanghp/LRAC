# Product Development Full Process

## ⚠️ Core Rule: New Requirements Must Follow Complete Process

**Whenever a new requirement is identified from the user, the complete product development process must be followed.**

```
Phase 1: Requirements Analysis → Create/Update BRD
Phase 2: Product Design → Create/Update PRD
Phase 2.5: UI/UX Design → Design + Component Specs
Phase 3: Architecture Design → Create/Update Architecture Doc
Phase 4: Task Breakdown → Update tasks.json
Phase 5: Dev & Unit/Functional Test Loop
Phase 6: Integration & Regression Testing
Phase 7: Deploy & UAT Verification Loop
Phase 8: Project Management as team-lead (Throughout)
```

## Phase-Skill Mapping ⚠️ MANDATORY

**Each phase has associated skills that MUST be invoked when entering that phase:**

| Phase | Required Skill | When to Invoke | How |
|-------|---------------|----------------|-----|
| **1-2** | `brainstorming` | When receiving new feature request | `Skill("brainstorming")` |
| **2.5** | `ui-ux-pro-max` → `enhance-prompt` → `stitch-loop` → `design-md` → `shadcn-ui` | When creating UI/UX design | Run style/theme brainstorming first, then invoke Stitch skills in sequence |
| **3-4** | `writing-plans` | When BRD/PRD approved, creating architecture | `Skill("writing-plans")` |
| **5** | `executing-plans` | When starting implementation | `Skill("executing-plans")` |
| **5** | `tdd-enforcement` | Before writing ANY production code | `Skill("tdd-enforcement")` |
| **5-6** | `systematic-debugging` | When encountering bugs/test failures | `Skill("systematic-debugging")` |
| **5-7** | `fix` | When fixing lint/format issues, before commit | `Skill("fix")` |
| **5-7** | `verification-before-completion` | Before claiming work is complete | `Skill("verification-before-completion")` |
| **7** | `finishing-development-branch` | When implementation complete, ready to merge | `Skill("finishing-development-branch")` |
| **5-8** | `dispatching-parallel-agents` | When facing 2+ independent tasks | `Skill("dispatching-parallel-agents")` |

Coverage percentage thresholds are defined only in `.claude/rules/09-testing.md` (`Coverage Requirements`). This file and agent/skill files must reference that rule and must not redefine numeric thresholds.

**Skill Invocation Rules**:
1. Skills are HARD GATES - cannot proceed without invoking
2. Invoke skill at the START of each phase
3. Follow skill instructions completely before continuing

## Process Overview

```
Phase 1: Requirements Analysis
  ↓ business-analyst + market-researcher → BRD
Phase 2: Product Design
  ↓ product-manager + ux-designer → PRD + UI/UX
Phase 2.5: UI/UX Design (Stitch)
  ↓ ux-designer + frontend-dev → DESIGN.md + Visual Prototypes + Component Specs
Phase 3: Architecture Design
  ↓ architect + researcher → Architecture Doc → architect-reviewer Review
Phase 4: Task Breakdown
  ↓ architect → tasks.json
Phase 5: Development & Unit/Functional Test Loop
  ↓ technical-writer → Design Documents
  ↓ frontend/backend-dev → Code + Unit Tests + Functional Tests
  ↓ test-automator → Test Automation Scripts
  ↓ code-reviewer → Review → Iterate
Phase 6: Integration & Regression Testing
  ↓ test-engineer → E2E Integration Tests
  ↓ test-automator → Automated Regression Suite
Phase 7: Deployment & UAT Loop
  ↓ devops-engineer → Deploy to Production
  ↓ product-manager → UAT Verification
  ↓ If UAT fails → Bug Fix → Redeploy Loop
Phase 8: Project Management as team-lead (Throughout)
  └─ project-manager → Coordination
```

## Phase-Agent-Skill Dispatch Matrix ⚠️ CANONICAL

Use this matrix to remove dispatch ambiguity between agents and skills.

| Phase | Required Agent | Required Skill | Optional Skill |
|-------|----------------|----------------|----------------|
| 1 | `business-analyst` + `market-researcher` | `brainstorming` | `competitive-analysis` |
| 2 | `product-manager` + `ux-designer` | `brainstorming` | `competitive-analysis` |
| 2.5 | `ux-designer` + `frontend-dev` | `ui-ux-pro-max` → `enhance-prompt` → `stitch-loop` → `design-md` | `shadcn-ui` |
| 3 | `architect` + `researcher` + `architect-reviewer` | `writing-plans` | None |
| 4 | `architect` | `writing-plans` | None |
| 5 | `fullstack-dev` + `code-reviewer` | `executing-plans` + `tdd-enforcement` + `verification-before-completion` | `systematic-debugging` + `fix` + `dispatching-parallel-agents` |
| 6 | `test-engineer` + `test-automator` | `verification-before-completion` | `systematic-debugging` + `dispatching-parallel-agents` |
| 7 | `devops-engineer` + `product-manager` | `finishing-development-branch` + `verification-before-completion` | `dispatching-parallel-agents` |
| 8 | `project-manager` | `dispatching-parallel-agents` | `toolchain-audit` |

Dispatch precedence rule:
1. Choose phase from lifecycle.
2. Dispatch required agent first.
3. Invoke required skill before implementation/review/testing for that phase.
4. Use optional skill only when trigger conditions are met.

Agent Teams execution gate:
- For phases with required agents, execution must run through subagents in independent tmux panes.
- When 2+ independent runnable tasks exist, parallel execution is mandatory unless a serial blocker is documented.
- Enforcement details are defined in `.claude/rules/04-agent-teams.md`.

## Phase Context Loading

To reduce context bloat, phase execution should follow progressive disclosure:

1. Load core project state (`tasks.json`, `progress-summary.md`)
2. Load current phase essentials from `.claude/context/phase-manifest.json`
3. Load the active role definition and required skills for that phase
4. Load task-specific docs and code only when execution requires them

**Do not default to reading all rules, agents, and skills on every task.**

## Phase Details

### Phase 1: Requirements Analysis
- **Required Skill**: `brainstorming` ⚠️ INVOKE FIRST
- **Participants**: business-analyst + market-researcher
- **Output**: BRD (Business Requirements Document)
- **File Location**: `docs/brd/BRD-{project}.md`
- **⚠️ MANDATORY: Must include competitive analysis reference**
  - Reference: `docs/research/COMPETITIVE-ANALYSIS-{topic}.md`
  - Include: Market context, competitive landscape, differentiation strategy

### Phase 2: Product Design
- **Required Skill**: `brainstorming` (continue from Phase 1)
- **Participants**: product-manager + ux-designer
- **Output**: PRD + UI/UX Design
- **File Location**: `docs/prd/PRD-{project}.md`
- **⚠️ MANDATORY: Must reference competitive analysis and BRD**
  - Reference: `docs/research/COMPETITIVE-ANALYSIS-{topic}.md`
  - Reference: `docs/brd/BRD-{project}.md`
  - Include: User flow patterns, design direction, differentiation

### Phase 2.5: UI/UX Design with Stitch ⚠️ MANDATORY for UI Projects

**Required Skills** (Google Official stitch-skills from https://github.com/google-labs-code/stitch-skills):

Invoke skills in sequence:
1. `Skill("ui-ux-pro-max")` — Run multi-round user Q&A brainstorming to lock design style and theme
2. `Skill("enhance-prompt")` — Transform approved style/theme into Stitch-optimized prompts
3. `Skill("stitch-loop")` — Generate UI designs using Stitch MCP
4. `Skill("design-md")` — Document design system in DESIGN.md
5. `Skill("shadcn-ui")` — Map designs to shadcn/ui components (optional)

**Prerequisites**:
- Stitch MCP server must be configured in the active runtime MCP config (for Claude CLI: `~/.claude.json`):
  ```json
  "stitch": {
    "type": "http",
    "url": "https://stitch.googleapis.com/mcp",
    "oauth": { "clientId": "stitch-web" }
  }
  ```

- **Participants**: ux-designer + frontend-dev
- **Purpose**: Generate production-ready UI designs using Google Stitch
- **Output**: Design System + Visual Prototypes + Component Specs
- **File Locations**:
  - `.stitch/DESIGN.md` — Design system documentation
  - `.stitch/SITE.md` — Site vision and roadmap
  - `.stitch/designs/*.html` — Generated HTML prototypes
  - `.stitch/designs/*.png` — Design screenshots
  - `docs/design/UI-SPEC-{feature}.md` — UI specification documents

**⚠️ CRITICAL: All UI projects MUST go through this phase before Phase 3 (Architecture Design)**

Icon system default for UI outputs:
- Use Lucide as the default icon library (`lucide-react` for React/Next.js).
- Keep icon library choice consistent across generated pages and UI specs.

#### Phase 2.5 Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Phase 2.5: Stitch UI/UX Design Workflow                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Step 0: Style/Theme Brainstorming (ui-ux-pro-max skill)                   │
│  ─────────────────────────────────────────────────                          │
│  - Invoke: Skill("ui-ux-pro-max")                                          │
│  - Conduct multi-round Q&A with user to confirm visual style and theme     │
│  - Lock direction before any Stitch generation                             │
│  - Record agreed style/theme in PRD or design notes                        │
│                                                                             │
│  Step 1: Enhance UI Prompts (enhance-prompt skill)                         │
│  ─────────────────────────────────────────────────                          │
│  - Invoke: Skill("enhance-prompt")                                         │
│  - Transform confirmed style/theme into polished Stitch-optimized prompts   │
│  - Add UI/UX keywords, structure, and design system context                │
│  - Output: `.stitch/next-prompt.md` with enhanced prompt                   │
│                                                                             │
│  Step 2: Generate Initial Design (stitch-loop skill)                       │
│  ─────────────────────────────────────────────────                         │
│  - Invoke: Skill("stitch-loop")                                            │
│  - Use Stitch MCP to generate UI from enhanced prompt                      │
│  - Create or use existing Stitch project                                    │
│  - Output: `.stitch/designs/{page}.html` + `.stitch/designs/{page}.png`   │
│                                                                             │
│  Step 3: Document Design System (design-md skill)                          │
│  ─────────────────────────────────────────────────                         │
│  - Invoke: Skill("design-md")                                              │
│  - Analyze generated designs and extract design tokens                     │
│  - Create `.stitch/DESIGN.md` with color palette, typography, components  │
│  - This becomes the "source of truth" for consistent design                │
│                                                                             │
│  Step 4: Iterate on Design (stitch-loop + enhance-prompt)                  │
│  ─────────────────────────────────────────────────                         │
│  - Use baton system (`.stitch/next-prompt.md`) to iterate                  │
│  - Generate additional pages using design system from Step 3               │
│  - Update `.stitch/SITE.md` with sitemap and roadmap                       │
│                                                                             │
│  Step 5: Component Specification (shadcn-ui skill)                         │
│  ─────────────────────────────────────────────────                         │
│  - Invoke: Skill("shadcn-ui")                                              │
│  - Map generated designs to shadcn/ui components                           │
│  - Document component requirements and customization needs                 │
│  - Output: `docs/design/UI-SPEC-{feature}.md`                              │
│                                                                             │
│  ⚠️ Phase 2.5 Completion Checklist                                         │
│  └── ✅ DESIGN.md created with complete design system                      │
│      ✅ All key screens generated and documented                            │
│      ✅ UI specification documents created                                  │
│      ✅ Component mapping to shadcn/ui completed                            │
│      ✅ Git commit with design artifacts                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Google Official Stitch Skills Overview

| Skill | Purpose | When to Use | Install Command |
|-------|---------|-------------|-----------------|
| `ui-ux-pro-max` | Brainstorm and converge on design style/theme with user | Before any Stitch prompt generation | `npx skills add nextlevelbuilder/ui-ux-pro-max-skill` (portable) / `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill` (Claude CLI) |
| `enhance-prompt` | Transform vague UI ideas into Stitch-optimized prompts | Before generating any design | `npx skills add google-labs-code/stitch-skills --skill enhance-prompt --global` |
| `stitch-loop` | Iteratively build multi-page websites with baton system | For page generation | `npx skills add google-labs-code/stitch-skills --skill stitch-loop --global` |
| `design-md` | Create DESIGN.md documenting design system | After initial design generation | `npx skills add google-labs-code/stitch-skills --skill design-md --global` |
| `shadcn-ui` | Map designs to shadcn/ui components | For component specification | `npx skills add google-labs-code/stitch-skills --skill shadcn-ui --global` |

#### CLI Theme Feedback Protocol (Phase 2.5 Step 0)

When collecting style/theme feedback in CLI, use this mandatory structure:

1. Present 2-3 candidate themes with explicit color tokens:
   - `Primary`, `Secondary`, `Accent`, `Background`, `Surface`, `Text`
   - Include HEX for each token and one-line usage intent
2. Attach visual artifacts for each candidate:
   - At least one screenshot path from `.stitch/designs/*.png`
   - If available, include preview URL or generated HTML path
3. Ask structured questions instead of open-ended "looks good?":
   - Brand match score (1-5)
   - Readability score (1-5)
   - Emotional tone fit (1-5)
   - One required change request
4. Confirm final decision as one of:
   - `Option A`, `Option B`, `Hybrid (A+B)`, or `New direction`
5. Persist the confirmed decision before Step 1:
   - Write final theme tokens and rationale into PRD or design notes
   - Use the confirmed decision as input for `enhance-prompt`

CLI feedback prompt template:

```text
Theme Candidate A
- Primary: #XXXXXX (buttons, links)
- Secondary: #XXXXXX (cards, sections)
- Accent: #XXXXXX (highlights, states)
- Background: #XXXXXX (page background)
- Surface: #XXXXXX (panel/card background)
- Text: #XXXXXX (primary copy)
- Preview: .stitch/designs/<page-a>.png

Theme Candidate B
- Primary: #XXXXXX ...
- Preview: .stitch/designs/<page-b>.png

Please reply with:
1) Selection: A / B / Hybrid / New
2) Brand match (1-5):
3) Readability (1-5):
4) Tone fit (1-5):
5) One specific change:
```

#### File Structure for Stitch Projects

```
project/
├── .stitch/
│   ├── metadata.json      # Stitch project & screen IDs
│   ├── DESIGN.md          # Design system (colors, typography, components)
│   ├── SITE.md            # Site vision, sitemap, roadmap
│   ├── next-prompt.md     # Baton file for iteration
│   └── designs/           # Generated designs
│       ├── {page}.html
│       └── {page}.png
├── docs/design/
│   └── UI-SPEC-{feature}.md  # UI specifications for developers
└── docs/prd/
    └── PRD-{project}.md   # Product requirements (from Phase 2)
```

#### Integration with Phase 3 (Architecture)

The outputs from Phase 2.5 feed directly into Phase 3:
- `.stitch/DESIGN.md` → Frontend architecture decisions
- `docs/design/UI-SPEC-*.md` → Component structure planning
- `.stitch/SITE.md` → Page routing and navigation architecture

### Phase 3: Architecture Design ⚠️ Must Be Reviewed
- **Required Skill**: `writing-plans` ⚠️ INVOKE FIRST
- **Participants**: architect + researcher → architect-reviewer (required)
- **Output**: Architecture Design Document (must be reviewed and approved)
- **File Location**: `docs/architecture/ARCH-{project}.md`

### Phase 4: Task Breakdown
- **Required Skill**: `writing-plans` (continue from Phase 3)
- **Participants**: architect
- **Output**: tasks.json

### Phase 5: Development & Unit/Functional Test Loop

**Required Skills** (invoke at appropriate times):
- `executing-plans` ⚠️ INVOKE at START of implementation
- `tdd-enforcement` ⚠️ INVOKE BEFORE writing ANY production code
- `systematic-debugging` ⚠️ INVOKE when encountering bugs/failures
- `verification-before-completion` ⚠️ INVOKE BEFORE claiming complete
- `dispatching-parallel-agents` ⚠️ INVOKE when 2+ independent tasks

**Development and Testing process for each task (⚠️ must follow)**:

```
┌─────────────────────────────────────────────────────────────────┐
│  technical-writer (for each feature)                            │
│  └── System analysis → Design doc → docs/design/DESIGN-{FEAT}.md│
│      ⚠️ Must complete before code implementation                │
│                                                                 │
│  qa-expert (for each feature)                                   │
│  └── Test strategy → Test cases → docs/test/TEST-{FEAT}.md     │
│      ⚠️ Must complete before code implementation                │
│                                                                 │
│  fullstack-dev (⚠️ PRIMARY DEVELOPER for Code + Tests)         │
│  └── ⚠️ MUST invoke Skill("fullstack-developer") first          │
│  └── Code implementation (frontend + backend)                   │
│  └── Unit tests (⚠️ required, follow `.claude/rules/09-testing.md`)│
│  └── Functional tests (⚠️ required)                             │
│      ⚠️ End-to-end ownership: Code + Unit Tests + Func Tests   │
│                                                                 │
│  test-automator (for each feature)                              │
│  └── Automate unit & functional tests                           │
│      ⚠️ Tests must be automated and passing                     │
│                                                                 │
│  code-reviewer (⚠️ required)                                    │
│  └── Code review → Pass/Needs revision                         │
│      └── Needs revision → Developer fixes iteratively           │
│                                                                 │
│  ⚠️ Feature Completion (MANDATORY for EVERY feature)           │
│  └── 1. Update tasks.json (passes: true)                        │
│      2. Update progress.txt (record session)                    │
│      3. Git commit (persist changes)                            │
└─────────────────────────────────────────────────────────────────┘
```

### fullstack-dev: Primary Developer Role

**⚠️ CRITICAL: fullstack-dev is the PRIMARY developer for Phase 5**

The fullstack-dev agent is responsible for the complete development loop:

| Responsibility | Description |
|----------------|-------------|
| **Code Implementation** | Frontend + Backend code for features |
| **Unit Tests** | Write and meet coverage policy from `.claude/rules/09-testing.md` |
| **Functional Tests** | Test feature functionality end-to-end |

**Why fullstack-dev?**
- **Efficiency**: Single agent owns the complete development cycle
- **Context**: Maintains full context from code to tests
- **Quality**: Immediate test feedback during development
- **Accountability**: Clear ownership of Code + Tests

**Skill Requirement**: fullstack-dev MUST invoke `Skill("fullstack-developer")` before implementation to access:
- Technology stack expertise (React, Next.js, Node.js, TypeScript)
- Architecture patterns for frontend and backend
- Best practices for security, performance, and testing
- Code examples and troubleshooting guidance

**Phase 5 Testing Requirements**:

| Test Type | When | Who | Requirement |
|-----------|------|-----|-------------|
| **Unit Tests** | During development | fullstack-dev | Meet `.claude/rules/09-testing.md` threshold, all passing |
| **Functional Tests** | After unit tests | fullstack-dev | All feature scenarios covered |
| **Test Automation** | After functional tests | test-automator | Automated in CI/CD |

**⚠️ Note**: fullstack-dev owns both Code + Tests for efficient development loop

### Phase 6: Integration & Regression Testing

**Required Skills** (invoke at appropriate times):
- `systematic-debugging` ⚠️ INVOKE when encountering bugs/failures
- `verification-before-completion` ⚠️ INVOKE BEFORE claiming complete
- `dispatching-parallel-agents` ⚠️ INVOKE when 2+ independent test suites

- **Participants**: test-engineer + test-automator
- **Purpose**: End-to-end testing across all features

| Test Type | Description | Requirement |
|-----------|-------------|-------------|
| **Integration Testing** | Test interactions between features/modules | All integration points covered |
| **E2E Testing** | Test complete user workflows | All critical paths covered |
| **Regression Testing** | Ensure new changes don't break existing features | All existing features verified |
| **Performance Testing** | Test system performance under load | Meet performance requirements |
| **Security Testing** | Vulnerability scanning, penetration testing | No critical vulnerabilities |

### Phase 7: Deploy & UAT Verification Loop

**Required Skills** (invoke at appropriate times):
- `finishing-development-branch` ⚠️ INVOKE when implementation complete
- `verification-before-completion` ⚠️ INVOKE BEFORE claiming deployment success
- `dispatching-parallel-agents` ⚠️ INVOKE when deploying multiple services

- **Participants**: devops-engineer + product-manager
- **Purpose**: Deploy to production and verify with User Acceptance Testing

**UAT Checklist (product-manager)**:

| Check | Description |
|-------|-------------|
| Business Requirements | All BRD requirements verified |
| User Workflows | All user scenarios work correctly |
| Acceptance Criteria | All PRD acceptance criteria met |
| Data Integrity | Data correctly stored and displayed |
| Performance | System responds within acceptable time |
| Security | No security issues in production |

**Rollback Criteria**:
- Critical functionality broken
- Data loss or corruption
- Security vulnerability discovered
- Performance severely degraded
