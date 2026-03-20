**语言切换:** [English](README.md) | [中文](README.zh.md)

# [LRAC]长周期自动编码框架

> 长周期AI软件交付的操作模型。

Auto-Coding Framework 将基于代理的开发转变为结构化系统：角色分工执行、持久项目记忆、显式规则，以及端到端工作流，支持中断、交接和并行。

<p align="center">
  <img src="docs/design/readme-assets/framework-hero.svg" alt="Auto-Coding Framework hero" width="100%" />
</p>

<p align="center">
  <strong>37个专用代理</strong> ·
  <strong>8阶段交付流程</strong> ·
  <strong>双轨记忆</strong> ·
  <strong>Git溯源</strong>
</p>

---

[English | 中文]

---

## 60秒简介

![框架介绍预览](docs/design/readme-assets/framework-reco-zh-preview.gif)

## 框架存在的理由

大多数AI编码流程在初期很快，但后期容易崩溃，常见问题：

- 会话结束后上下文丢失
- 多代理并行无协调
- 长周期需求与实现脱节
- 决策、变更、验证难以追溯

本框架通过结合实时代理协调与文件系统/Git持久项目状态，解决上述问题。

## 框架特色

| 能力 | 框架增值 |
| --- | --- |
| **协调** | `project-manager`作为团队负责人，分配任务给专用代理 |
| **持久化** | `tasks.json`和`progress.txt`跨会话保存状态 |
| **流程** | 标准路径：BRD -> PRD -> Stitch -> 架构 -> 任务 -> 构建 -> 测试 -> UAT |
| **恢复** | 明确记录阻塞器、恢复上下文和执行历史 |
| **质量** | 规则、钩子、测试策略和完成门禁确保工作可审计 |

## 架构

<p align="center">
  <img src="docs/design/readme-assets/framework-architecture.svg" alt="框架架构" width="100%" />
</p>

框架分为三个层次运作：

- **会话层**：原生 Agent Teams 处理实时执行、任务分配和跨代理通信。
- **项目层**：`.auto-coding/tasks.json`、`.auto-coding/progress.txt` 和 `docs/` 等文件存储持久的项目记忆。
- **治理层**：`.claude/rules/` 中的规则定义工作如何启动、如何记录阻塞器、功能如何关闭，以及何时提交。

这就是让系统可恢复而不是会话脆弱的原因。

## 使用方法

<p align="center">
  <img src="docs/design/readme-assets/framework-workflow.svg" alt="框架工作流" width="100%" />
</p>

### 交付流程

1. 在 BRD 和 PRD 中捕获需求。
2. 使用 Stitch 进行 UI/UX 探索和系统级设计资产。
3. 在实施开始前审查架构。
4. 将工作分解为带有依赖和验收标准的 `tasks.json`。
5. 使用专业代理和测试执行开发。
6. 运行集成、回归、部署和 UAT 循环。
7. 使用以下方式关闭每个已完成的功能：
   - 更新 `tasks.json`
   - 追加 `progress.txt`
   - 立即创建 Git 提交

### 双轨记忆

| 轨道 | 范围 | 目的 |
| --- | --- | --- |
| **原生 Agent Teams** | 会话级 | 实时规划、委托、执行 |
| **tasks.json / progress.txt / docs / Git** | 项目级 | 跨会话状态、可追溯性、恢复 |

## 为什么它优于临时提示

<p align="center">
  <img src="docs/design/readme-assets/framework-advantages.svg" alt="框架优势" width="100%" />
</p>

| 纯提示工作流 | 自动编码框架 |
| --- | --- |
| 上下文大多被困在聊天历史中 | 上下文保存在文件和 Git 中 |
| 并行工作变得模糊 | 角色和团队负责人协调是明确的 |
| 容易失去功能完成的跟踪 | 验收、执行历史和完成门禁是强制性的 |
| 中断后的恢复是手动的 | 恢复上下文和阻塞器是工作流的一部分 |

## 代理系统

该框架附带 **37 个专业代理**，分为七类：

| 类别 | 数量 | 示例角色 |
| --- | --- | --- |
| 核心开发 | 10 | `architect`、`frontend-dev`、`backend-dev`、`fullstack-dev` |
| 数据与 AI | 8 | `data-engineer`、`llm-architect`、`ai-engineer` |
| 基础设施 | 2 | `devops-engineer`、`mcp-developer` |
| 质量与安全 | 8 | `code-reviewer`、`security-auditor`、`test-engineer` |
| 业务与产品 | 4 | `project-manager`、`product-manager`、`business-analyst` |
| 文档 | 2 | `technical-writer`、`api-documenter` |
| 研究与编排 | 3 | `researcher`、`market-researcher`、`agent-organizer` |

完整代理规格：[`.claude/agents/AGENTS.md`](.claude/agents/AGENTS.md)

## 阶段技能集成

**每个阶段都有相关的技能，在进入该阶段时必须调用：**

| 阶段 | 必需技能 | 调用时机 | 如何调用 |
| --- | --- | --- | --- |
| **1-2** | `brainstorming` | 收到新功能请求时 | `Skill("brainstorming")` |
| **2.5** | `ui-ux-pro-max` → `enhance-prompt` → `stitch-loop` → `design-md` → `shadcn-ui` | 创建 UI/UX 设计时 | 依次调用技能 |
| **3-4** | `writing-plans` | BRD/PRD 批准后，创建架构时 | `Skill("writing-plans")` |
| **5** | `executing-plans` | 开始实现时 | `Skill("executing-plans")` |
| **5** | `tdd-enforcement` | 编写任何生产代码之前 | `Skill("tdd-enforcement")` |
| **5-6** | `systematic-debugging` | 遇到错误/测试失败时 | `Skill("systematic-debugging")` |
| **5-7** | `fix` | 修复 lint/格式问题时，提交前 | `Skill("fix")` |
| **5-7** | `verification-before-completion` | 声称工作完成之前 | `Skill("verification-before-completion")` |
| **7** | `finishing-development-branch` | 实现完成、准备好合并时 | `Skill("finishing-development-branch")` |
| **5-8** | `dispatching-parallel-agents` | 面临 2+ 个独立任务时 | `Skill("dispatching-parallel-agents")` |

## IMAC 命令

对于存量项目的持续迭代（Install, Modify, And, Change），使用 `/IMAC`。

- 命令文件：`.claude/commands/IMAC.md`
- 先执行问答式 intake（包含单选 + 多选）
- 自动判定需要回溯的最早阶段（Phase 1/2/2.5/3/4/5+）
- 在实现前先做影响面分析
- 将变更记录写入 `.auto-coding/progress.txt` 与 `docs/CHANGELOG.md`

常见示例：

- `/IMAC`：先走 intake，通常根据答案从 PRD 或设计阶段重启流程
- `/IMAC architecture 将前端架构改为 XX`：通常从 Phase 3 开始后续流程

### Task ID 命名规范

在 `.auto-coding/tasks.json` 中，`features[].id` 必须是：

`{iteration}-{phaseSymbol}-{NNN}`

- `iteration`：`inital` 或 `imac-{abbr}`
- `phaseSymbol`：`p1r` `p1b` `p2p` `p25d` `p3a` `p4b` `p5d` `p6t` `p7d` `p8m`
- `NNN`：3位流水号（`001`、`002` ...）

## Stitch UI/UX 轨道

框架在产品和架构之间包含专用 UI/UX 通道：

```text
ui-ux-pro-max -> enhance-prompt -> stitch-loop -> design-md -> shadcn-ui
```

预期输出：

- `.stitch/next-prompt.md`
- `.stitch/designs/*.html`
- `.stitch/designs/*.png`
- `.stitch/DESIGN.md`
- `docs/design/UI-SPEC-*.md`

这为工程团队在编写界面代码之前提供视觉原型和组件级规格。

## 快速开始

### 前置条件

- **Claude Code**：此框架在 [Claude Code](https://claude.ai/code) 上运行，这是 Anthropic 的官方 CLI。
- **Stitch API 密钥**：用于 UI/UX 设计生成（第 2.5 阶段），请从 [stitch.withgoogle.com/settings](https://stitch.withgoogle.com/settings) 获取您的 API 密钥，请在项目 init.sh 阶段请求时保存该密钥。

### 1. 创建新项目

```bash
chmod +x setup.sh
./setup.sh new ../your-project
cd ../your-project
```

这会在新存储库中创建框架结构并初始化项目状态文件。

### 2. 初始化环境

```bash
chmod +x init.sh
./init.sh
```

`init.sh` 设计用于：

- 安装项目依赖
- 检查环境先决条件
- 验证核心框架就绪状态

### 3. 启用 Agent Teams

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS="1"
```

或内联启动 Claude：

```bash
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 claude
```

### 4. 给 Claude 一个真正的项目目标

```bash
# 在你的项目文件夹中运行：Claude & 提供提示。

我想构建"一个金融新闻聚合平台"。
使用 project-manager 作为团队负责人。
遵循框架阶段并维护 tasks.json 和 progress.txt。
```

这就足以启动结构化交付周期了。

这条规则不是可选的。它是使框架可追溯和可恢复的核心机制。

## 重置当前项目

要清除项目数据同时保留框架：

```bash
chmod +x setup.sh
./setup.sh reset
```

## 在途项目升级框架

当框架仓库更新后，可用以下命令升级已有在途项目：

```bash
chmod +x setup.sh
./setup.sh upgrade ../your-existing-project
```

如果你当前就在目标项目目录，也可以直接执行：

```bash
./setup.sh upgrade
```

`upgrade` 会同步框架层文件（`.claude`、`.auto-coding/config`、脚手架脚本与文档），并保留项目状态文件，例如：

- `.auto-coding/tasks.json`
- `.auto-coding/progress.txt`
- 现有项目文档产出与业务源码

升级后，请在目标项目中执行：

```bash
./init.sh
npm run typecheck
npm run lint
```

## 推荐并行设置

<p align="center">
  <img src="docs/design/readme-assets/tmux in parallel.png" alt="代理并行运行" width="100%" />
</p>

为了在 macOS 上获得最佳多代理工作流，请使用 **iTerm2 + tmux**：
```bash
# 方法 1：使用 iTerm2 集成启动新的 tmux 会话
tmux -CC

# 在 tmux 内启动 Claude Code
claude --teammate-mode tmux

# 提示 Claude 创建并行代理：
# "根据项目规则，创建一个'新闻聚合页面'。
#  使用 project-manager 作为团队负责人运行 TeamAgents。
#  使用 --teammate-mode tmux 进行多窗格执行。"

# 代理将分配到单独的窗格：
# ├── project-manager（团队负责人）
# ├── backend-dev（API 开发）
# ├── frontend-dev（UI 开发）
# └── test-engineer（测试自动化）
```

### tmux 快捷键（iTerm2 -CC 模式）

在 iTerm2 的 tmux 集成模式（`-CC`）中，tmux 窗格显示为原生 iTerm2 标签页/窗口：

| 操作 | 方法 |
| --- | --- |
| **水平分割窗格** | iTerm2: `Cmd+D` 或 tmux: `Ctrl+B %` |
| **垂直分割窗格** | iTerm2: `Cmd+Shift+D` 或 tmux: `Ctrl+B "` |
| **切换窗格** | iTerm2: `Cmd+Opt+Arrow` 或 tmux: `Ctrl+B Arrow` |
| **关闭窗格** | iTerm2: `Cmd+W` 或 tmux: `Ctrl+B x` |
| **分离会话** | tmux: `Ctrl+B d`（会话保持运行） |
| **列出会话** | `tmux ls` |

### 会话持久化

```bash
# 从会话分离（保持运行）
# 或 tmux detach
Ctrl+B d

# 稍后重新附加（即使重启后如果使用 tmux-resurrect）
# 或 tmux -CC a
tmux -CC attach

# 列出所有会话
tmux ls

# 重新附加目标会话（ -d 分离当前会话）
# tmux -CC a -t your_session
tmux -CC attach -t your_session

# 列出所有会话并选择
Ctrl+B s

# 关闭当前会话
exit

# 关闭特定会话
tmux kill-session -t session-name

# 关闭所有会话
tmux kill-server
```

提示

1. **使用描述性会话名称**：`tmux -CC new -s my-project`
2. **保存会话布局**：使用 tmux-resurrect 插件实现跨重启的会话持久化
3. **监控所有代理**：在 iTerm2 中，使用 `Cmd+Shift+I` 向所有窗格广播输入
4. **滚动历史**：在 -CC 模式中，使用原生 iTerm2 滚动（`Cmd+Up` 或触控板）
5. **Tmux 速查表**：https://tmuxcheatsheet.com/

### 为什么这个设置效果好：

- 每个代理获得自己的窗格
- 会话在终端重启后保留
- 输出保持隔离，更易于监控
- iTerm2 在 `-CC` 模式下提供原生窗格和标签页管理

## 功能完成规则

每个已完成的功能必须按此顺序执行：

```text
1. 更新 tasks.json
2. 追加 progress.txt
3. 创建 Git 提交
```

## 测试和验证

框架包含内置验证脚本：

```bash
node .claude/scripts/run-tests.js
node .claude/scripts/run-tests.js --hooks
node .claude/scripts/run-tests.js --config
```

您还可以通过以下方式验证技能和 MCP 就绪状态：

```bash
node .claude/scripts/check-skills.js
node .claude/scripts/check-mcp.js
```

## 媒体资源

README 视觉资源位于 [`docs/design/readme-assets/`](docs/design/readme-assets/)。

- 英雄图：[`docs/design/readme-assets/framework-hero.svg`](docs/design/readme-assets/framework-hero.svg)
- 架构图：[`docs/design/readme-assets/framework-architecture.svg`](docs/design/readme-assets/framework-architecture.svg)
- 工作流图：[`docs/design/readme-assets/framework-workflow.svg`](docs/design/readme-assets/framework-workflow.svg)
- 优势图：[`docs/design/readme-assets/framework-advantages.svg`](docs/design/readme-assets/framework-advantages.svg)
- 中文视频源页面：[`docs/design/readme-assets/framework-reco-zh.html`](docs/design/readme-assets/framework-reco-zh.html)
- 中文视频输出：[`docs/design/readme-assets/framework-reco-zh.webm`](docs/design/readme-assets/framework-reco-zh.webm)
- 中文 GIF 预览：[`docs/design/readme-assets/framework-reco-zh-preview.gif`](docs/design/readme-assets/framework-reco-zh-preview.gif)

使用以下命令重新生成视频：

```bash
npm run docs:video
```

使用以下命令重新生成 GIF 预览：

```bash
npm run docs:gif
```

## 相关文档

- [`AGENTS.md`](AGENTS.md) - 框架概述和快速参考
- [`CLAUDE.md`](CLAUDE.md) - 完整框架规范
- [`.claude/rules/`](.claude/rules/) - 操作规则
- [`.claude/agents/AGENTS.md`](.claude/agents/AGENTS.md) - 代理目录
- [`.auto-coding/LESSONS_LEARNED.md`](.auto-coding/LESSONS_LEARNED.md) - 保留的经验和最佳实践
