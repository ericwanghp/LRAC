# Coding Guidelines

> Behavior rules to ensure code quality and project integrity

---

## Overview

These guidelines are enforced through native hooks where possible, and serve as best practices otherwise.

---

## Enforced Rules (via Hooks)

### 1. Prevent Skipping Validation

**Hook**: `prevent-skip-validation.js`
**Trigger**: PreToolUse:Bash
**Enforcement**: Warning (allows command with warning)

Patterns that trigger warning:
- `--skip-tests`, `--no-tests`, `skipAllTests`
- `SKIP_TEST=true` environment variable
- `--skip-validation`, `--no-validate`, `--skip-check`
- `--no-lint`, `--skip-lint`
- `npm install --force`, `yarn install --force`
- `git push --no-verify`, `git commit --no-verify`
- `[skip ci]`, `[ci skip]` in commit messages

**Rationale**: All code changes should be validated through tests, linting, and CI checks.

### 2. Prevent Force Push

**Hook**: `prevent-force-push.js`
**Trigger**: PreToolUse:Bash
**Enforcement**: Block (exit code 2)

Blocked patterns:
- `git push -f`
- `git push --force`
- `git push --force-with-lease`

Protected branches: `main`, `master`, `develop`, `staging`, `production`

**Rationale**: Force push can overwrite team members' work and break deployment history.

---

## Best Practices (Manual Enforcement)

### 3. Require Task Reference in Commits

**Rule**: Commit messages should reference task IDs

Format:
```
feat(FEAT-XXX): Description
fix(FEAT-XXX): Description
refactor(FEAT-XXX): Description
```

**Rationale**: Enables traceability between code changes and task definitions.

### 4. Update Progress After Task Completion

**Rule**: Update `.auto-coding/progress.txt` after completing a task

**Required Information**:
- Starting state
- Execution content
- Ending state
- Next steps

**Rationale**: Ensures cross-session context transfer for long-running projects.

### 5. Verify Passes Before Closing Task

**Rule**: Set `passes: true` before marking task as completed

In `tasks.json`:
```json
{
  "status": {
    "status": "completed",
    "passes": true  // Must be true
  }
}
```

**Rationale**: Ensures tasks are properly validated before being marked complete.

### 6. Use Lucide as Default Icon Library for UI Work

**Rule**: For frontend UI implementation and component examples, use Lucide icons as the default icon system.

**Implementation Guidance**:
- React/Next.js: prefer `lucide-react`
- Non-React contexts: prefer `lucide`
- Before coding, check whether the icon dependency already exists in `package.json`
- If missing, add the required Lucide package as part of the same change
- Avoid mixing multiple icon libraries in one feature unless there is a documented blocker

**Rationale**: A single icon library improves visual consistency, maintainability, and bundle predictability.

---

## Hook Configuration

Hooks are configured in `.claude/hooks/hooks.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          "node .claude/hooks/read-context.js",
          "node .claude/hooks/prevent-skip-validation.js",
          "node .claude/hooks/prevent-force-push.js"
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          "node .claude/hooks/verify-acceptance.js"
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          "node .claude/hooks/verify-git-commit.js"
        ]
      }
    ]
  }
}
```

---

## Bypassing Hooks (Emergency Only)

If you absolutely must bypass a hook:

```bash
# For git hooks --no-verify
git commit --no-verify -m "emergency fix"

# Note: This will trigger a warning but still proceed
```

**⚠️ Warning**: Bypassing hooks should be rare and documented in progress.txt.

---

## Related Files

| File | Purpose |
|------|---------|
| `.claude/hooks/hooks.json` | Hook configuration |
| `.claude/hooks/prevent-skip-validation.js` | Skip validation warning |
| `.claude/hooks/prevent-force-push.js` | Force push blocker |
| `.auto-coding/config/hookify.json` | Legacy config (deprecated) |
