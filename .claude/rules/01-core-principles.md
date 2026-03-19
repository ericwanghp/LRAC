# Core Design Principles

> Multi-role collaborative development framework based on native multi-agent runtimes (Claude/Codex compatible) + long-running agent best practices.

## Dual-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Architecture Layers                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Layer 2: Native Agent Teams (Session Layer)                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  TeamCreate / TaskCreate / TaskUpdate / TaskList / SendMessage     │   │
│   │  Purpose: Real-time task allocation and multi-Agent coordination    │   │
│   │  Lifecycle: Session-level, disappears when session ends            │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      ▲                                      │
│                                      │ Read state                           │
│                                      ▼                                      │
│   Layer 1: Persistent File System (Project Layer)                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  tasks.json (Feature List)  +  progress.txt (Progress Notes)       │   │
│   │  Purpose: Feature completion status, cross-session context         │   │
│   │  Lifecycle: Project lifecycle, Git version control                 │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Core Principles

| Principle | Description |
|-----------|-------------|
| **Runtime Native First** | Prioritize the active runtime's native capabilities first, then portable CLI fallbacks |
| **Feature List** | tasks.json as feature list, passes tracks status |
| **Progress Notes** | progress.txt for cross-session context |
| **Progressive Context** | Load only the current phase, role, and task context by default |
| **Incremental Progress** | Process one feature at a time |
| **Immediate Commit** | Git commit immediately after feature completion |

## Design Philosophy Source

Based on: [Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

| Anthropic Best Practice | Framework Implementation | Why It Works |
|------------------------|-------------------------|--------------|
| Feature List | tasks.json + passes | JSON structure is stable, hard for model to accidentally modify |
| Progress Notes | progress.txt | Human-readable, conveys decision context |
| Environment Init | init.sh | Ensures environment consistency |
| Git Commits | One commit per feature | Changes are traceable and rollback-able |
