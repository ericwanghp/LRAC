#!/bin/bash

# Auto-Coding Framework Setup Script
# Used to create new projects or reset current project

set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Save absolute path of script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

show_help() {
    cat << EOF
Usage: ./setup.sh <command> [arguments]

Commands:
  new <project-name>    Create a new project directory
  upgrade [project-path] Upgrade framework files in an existing project
  reset                 Reset current project (clear project and doc data)
  help                  Show this help message

Examples:
  ./setup.sh new my-project     # Create a new project named my-project
  ./setup.sh upgrade ../my-project  # Upgrade framework in existing project
  ./setup.sh upgrade            # Upgrade framework in current directory
  ./setup.sh reset              # Reset current project, ready for new project

Description:
  - new:  Create complete project structure in a new directory
  - upgrade: Sync latest framework scaffold into an existing in-flight project
             while preserving project state files (tasks/progress/docs outputs)
  - reset: Clear current project data and docs, keep framework config
           Also detects and offers to clean project-generated directories
           (e.g., news-aggregator, pm-website, .playwright-mcp, etc.)
           Useful for converting demo project to new project starting point

EOF
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

render_tasks_template() {
    local target_file=$1
    local project_name=$2
    local template_file=".auto-coding/config/tasks.init.template.json"
    local now_utc
    now_utc=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    if [ -f "$template_file" ] && command -v python3 >/dev/null 2>&1; then
        python3 - "$template_file" "$target_file" "$project_name" "$now_utc" << 'PY'
import json
import sys

template_path, target_path, project_name, now_utc = sys.argv[1:5]

with open(template_path, "r", encoding="utf-8") as f:
    data = json.load(f)

def walk(v):
    if isinstance(v, str):
        return v.replace("__PROJECT_NAME__", project_name).replace("__NOW_UTC__", now_utc)
    if isinstance(v, list):
        return [walk(i) for i in v]
    if isinstance(v, dict):
        return {k: walk(val) for k, val in v.items()}
    return v

data = walk(data)
with open(target_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write("\n")
PY
        log_info "tasks.json initialized from tasks.init.template.json"
    else
        cat > "$target_file" << EOF
{
  "version": "3.0",
  "project": "$project_name",
  "parallelGroups": {},
  "features": []
}
EOF
        log_warn "tasks.init.template.json unavailable, fallback minimal tasks.json created"
    fi
}

copy_readme_assets() {
    if [ -d "$SCRIPT_DIR/docs/design/readme-assets" ]; then
        mkdir -p docs/design/readme-assets
        cp -R "$SCRIPT_DIR/docs/design/readme-assets/." docs/design/readme-assets/
        log_info "README media assets copied to docs/design/readme-assets/"
    fi
}

# Create new project
create_new_project() {
    local PROJECT_NAME=$1

    echo "🚀 Auto-Coding Framework - Create New Project"
    echo "================================"

    # Create project directory
    log_info "Creating project directory: $PROJECT_NAME"
    mkdir -p "$PROJECT_NAME"
    cd "$PROJECT_NAME"
    git init

    # Create directory structure
    log_info "Creating directory structure..."
    mkdir -p .auto-coding/config
    mkdir -p docs/brd
    mkdir -p docs/prd
    mkdir -p docs/architecture
    mkdir -p docs/design
    mkdir -p docs/test

    # Copy framework files
    log_info "Copying framework files..."

    # Copy .claude directory (agents, rules, hooks, skills, scripts)
    if [ -d "$SCRIPT_DIR/.claude" ]; then
        cp -r "$SCRIPT_DIR/.claude" .
    fi

    # Copy CLAUDE spec file
    if [ -e "$SCRIPT_DIR/CLAUDE.md" ]; then
        cp "$SCRIPT_DIR/CLAUDE.md" .
    fi

    # Copy README template
    if [ -e "$SCRIPT_DIR/README.md" ]; then
        cp "$SCRIPT_DIR/README.md" .
    fi

    if [ -e "$SCRIPT_DIR/setup.sh" ]; then
        cp "$SCRIPT_DIR/setup.sh" .
        chmod +x setup.sh
        log_info "setup.sh copied"
    fi

    copy_readme_assets

    # Copy .auto-coding/config files (mcp.json, test-strategy.json, etc.)
    if [ -d "$SCRIPT_DIR/.auto-coding/config" ]; then
        cp -r "$SCRIPT_DIR/.auto-coding/config/"* .auto-coding/config/ 2>/dev/null || true
        log_info "Config files copied to .auto-coding/config/"
    fi

    # Get last part of project name (handle relative paths)
    PROJECT_BASENAME=$(basename "$PROJECT_NAME")

    render_tasks_template ".auto-coding/tasks.json" "$PROJECT_BASENAME"

    # Create initial progress.txt
    cat > .auto-coding/progress.txt << 'EOF'
# Progress Notes
EOF

    # Create LESSONS_LEARNED.md (ask user)
    if [ -e "$SCRIPT_DIR/.auto-coding/LESSONS_LEARNED.md" ]; then
        echo "Copy LESSONS_LEARNED.md template? (y/n)"
        read -r answer
        if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
            cp "$SCRIPT_DIR/.auto-coding/LESSONS_LEARNED.md" .auto-coding/
            log_success "LESSONS_LEARNED.md copied"
        fi
    fi

    # Create .gitignore
    cat > .gitignore << 'EOF'
node_modules/
.env
.DS_Store
dist/
build/
*.log
EOF

    # Create init.sh (copy if template exists, otherwise create basic version)
    if [ -e "$SCRIPT_DIR/init.sh" ]; then
        cp "$SCRIPT_DIR/init.sh" .
        log_info "init.sh copied"
    else
        log_info "Creating basic init.sh..."
        cat > init.sh << 'INIT_EOF'
#!/bin/bash

# Project Initialization Script

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Initializing project..."

# 1. Install dependencies
if [ -f "$PROJECT_ROOT/package.json" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# 2. Check framework dependencies
echo "📋 Checking framework dependencies..."
if [ -f "$PROJECT_ROOT/.claude/scripts/check-skills.js" ]; then
    node "$PROJECT_ROOT/.claude/scripts/check-skills.js" || true
fi

if [ -f "$PROJECT_ROOT/.claude/scripts/check-mcp.js" ]; then
    node "$PROJECT_ROOT/.claude/scripts/check-mcp.js" || true
fi

echo ""
echo "✅ Initialization complete!"
echo ""
echo "Next steps:"
echo "  1. Start Claude Code: claude"
echo "  2. Tell Claude your project requirements"
echo ""
INIT_EOF
        chmod +x init.sh
    fi

    # Check dependencies
    check_dependencies

    log_success "Project initialization complete!"
    echo ""
    echo "Next steps:"
    echo "  1. cd $PROJECT_NAME"
    echo "  2. Run ./init.sh to initialize environment"
    echo "  3. Start Claude Code: claude"
    echo "  4. Tell Claude your project requirements"
    echo ""
}

# Upgrade framework files in an existing project
upgrade_project() {
    local TARGET_PATH="${1:-.}"
    local TARGET_ABS

    if [ ! -d "$TARGET_PATH" ]; then
        log_warn "Target path does not exist: $TARGET_PATH"
        exit 1
    fi

    TARGET_ABS="$(cd "$TARGET_PATH" && pwd)"

    echo "🔼 Auto-Coding Framework - Upgrade Existing Project"
    echo "=================================================="
    echo ""
    log_info "Framework source: $SCRIPT_DIR"
    log_info "Upgrade target:   $TARGET_ABS"
    echo ""
    echo "Will sync framework layer:"
    echo "  ✅ .claude/ (except .claude/worktrees)"
    echo "  ✅ .auto-coding/config/"
    echo "  ✅ .github/guide.md and selected framework workflows"
    echo "  ✅ CLAUDE.md, AGENTS.md, README.md, README.zh.md, setup.sh, init.sh"
    echo "  ✅ docs/design/readme-assets/"
    echo ""
    echo "Will preserve project state layer:"
    echo "  🛡️ .auto-coding/tasks.json"
    echo "  🛡️ .auto-coding/progress.txt"
    echo "  🛡️ docs/brd docs/prd docs/architecture docs/design outputs docs/test"
    echo "  🛡️ application source code and project dependency files"
    echo ""
    echo "Continue with upgrade? (y/n)"
    read -r answer
    if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
        echo "Operation cancelled"
        exit 0
    fi

    mkdir -p "$TARGET_ABS/.auto-coding/config"
    mkdir -p "$TARGET_ABS/docs/design/readme-assets"

    if command -v rsync >/dev/null 2>&1; then
        [ -d "$SCRIPT_DIR/.claude" ] && rsync -a --exclude 'worktrees/' "$SCRIPT_DIR/.claude/" "$TARGET_ABS/.claude/"
        [ -d "$SCRIPT_DIR/.auto-coding/config" ] && rsync -a "$SCRIPT_DIR/.auto-coding/config/" "$TARGET_ABS/.auto-coding/config/"
        [ -d "$SCRIPT_DIR/docs/design/readme-assets" ] && rsync -a "$SCRIPT_DIR/docs/design/readme-assets/" "$TARGET_ABS/docs/design/readme-assets/"
    else
        if [ -d "$SCRIPT_DIR/.claude" ]; then
            mkdir -p "$TARGET_ABS/.claude"
            for entry in "$SCRIPT_DIR"/.claude/*; do
                name=$(basename "$entry")
                if [ "$name" != "worktrees" ]; then
                    cp -R "$entry" "$TARGET_ABS/.claude/"
                fi
            done
        fi
        [ -d "$SCRIPT_DIR/.auto-coding/config" ] && cp -R "$SCRIPT_DIR/.auto-coding/config/." "$TARGET_ABS/.auto-coding/config/"
        [ -d "$SCRIPT_DIR/docs/design/readme-assets" ] && cp -R "$SCRIPT_DIR/docs/design/readme-assets/." "$TARGET_ABS/docs/design/readme-assets/"
    fi

    for file in CLAUDE.md AGENTS.md README.md README.zh.md setup.sh init.sh; do
        if [ -f "$SCRIPT_DIR/$file" ]; then
            cp "$SCRIPT_DIR/$file" "$TARGET_ABS/$file"
        fi
    done

    if [ -f "$TARGET_ABS/setup.sh" ]; then
        chmod +x "$TARGET_ABS/setup.sh"
    fi
    if [ -f "$TARGET_ABS/init.sh" ]; then
        chmod +x "$TARGET_ABS/init.sh"
    fi

    if [ -f "$SCRIPT_DIR/.github/guide.md" ]; then
        mkdir -p "$TARGET_ABS/.github"
        cp "$SCRIPT_DIR/.github/guide.md" "$TARGET_ABS/.github/guide.md"
    fi
    if [ -d "$SCRIPT_DIR/.github/workflows" ]; then
        mkdir -p "$TARGET_ABS/.github/workflows"
        for wf in claude-code-advanced.yml policy-toolchain-scan.yml; do
            if [ -f "$SCRIPT_DIR/.github/workflows/$wf" ]; then
                cp "$SCRIPT_DIR/.github/workflows/$wf" "$TARGET_ABS/.github/workflows/$wf"
            fi
        done
    fi

    log_success "Framework upgrade sync completed"
    echo ""
    echo "Next steps in target project:"
    echo "  1. cd $TARGET_ABS"
    echo "  2. Run ./init.sh to validate upgraded framework dependencies"
    echo "  3. Run npm run typecheck && npm run lint"
    echo "  4. Review git diff and commit upgrade changes"
    echo ""
}

# Reset current project
reset_project() {
    echo "🔄 Auto-Coding Framework - Reset Project"
    echo "=================================="
    echo ""
    log_warn "This operation will clear the following:"
    echo ""
    echo "  📋 Project Data:"
    echo "    - .auto-coding/tasks.json (task list)"
    echo "    - .auto-coding/progress.txt (progress notes)"
    echo "    - .stitch/ (Stitch design artifacts)"
    echo ""
    echo "  📁 Project Documentation:"
    echo "    - docs/brd/ (business requirements)"
    echo "    - docs/prd/ (product requirements)"
    echo "    - docs/architecture/ (architecture docs)"
    echo "    - docs/design/ except docs/design/readme-assets (design docs)"
    echo "    - docs/test/ (test docs)"
    echo "    - docs/plans/ (planning docs)"
    echo "    - docs/research/ (research/competitive analysis)"
    echo "    - docs/file/ (misc files)"
    echo "    - docs/DEPLOYMENT.md, docs/API.md, etc. (project docs)"
    echo ""
    echo "  ⚙️  Project Config Files:"
    echo "    - package.json, tsconfig.json, next.config.js, etc."
    echo "    - All framework-specific config files (Next.js, Tailwind, Vitest, etc.)"
    echo "    - Lock files (package-lock.json, yarn.lock, pnpm-lock.yaml)"
    echo ""
    echo "  📂 Project-Generated Directories:"
    echo "    - src/, public/, dist/, build/, etc."
    echo "    - .next/, .playwright-mcp/, etc."
    echo ""
    echo "The following will be preserved:"
    echo "  ✅ .claude/ (framework config)"
    echo "  ✅ .github/ (GitHub workflows)"
    echo "  ✅ .auto-coding/config/ (project config)"
    echo "  ✅ .auto-coding/LESSONS_LEARNED.md (lessons learned)"
    echo "  ✅ docs/design/readme-assets/ (README showcase media)"
    echo "  ✅ CLAUDE.md, README.md, setup.sh, init.sh (framework scaffold)"
    echo ""
    echo "Continue? (y/n)"
    read -r answer
    if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
        echo "Operation cancelled"
        exit 0
    fi

    # Clear tasks and progress
    log_info "Clearing tasks and progress..."

    # Get current project name (from directory)
    PROJECT_BASENAME=$(basename "$SCRIPT_DIR")

    render_tasks_template ".auto-coding/tasks.json" "$PROJECT_BASENAME"

    # Reset progress.txt
    cat > .auto-coding/progress.txt << 'EOF'
# Progress Notes
EOF

    # Clear document directories (keep subdirectories, remove contents)
    log_info "Clearing document directories..."
    for dir in docs/brd docs/prd docs/architecture docs/test docs/plans docs/research docs/file; do
        if [ -d "$dir" ]; then
            rm -rf "$dir"/*
            rm -rf "$dir"/.* 2>/dev/null || true
        fi
    done

    # Clear docs/design except readme-assets
    if [ -d "docs/design" ]; then
        find "docs/design" -mindepth 1 -maxdepth 1 ! -name "readme-assets" -exec rm -rf {} +
    fi

    # Clear all files in docs root (keep subdirectories)
    log_info "Clearing docs root files..."
    find docs -maxdepth 1 -type f -delete

    # Recreate .gitkeep to preserve empty directories in git
    mkdir -p docs/brd docs/prd docs/architecture docs/design docs/test docs/plans docs/research docs/file
    touch docs/brd/.gitkeep docs/prd/.gitkeep docs/architecture/.gitkeep docs/design/.gitkeep docs/test/.gitkeep docs/plans/.gitkeep docs/research/.gitkeep docs/file/.gitkeep

    # Delete .stitch directory (Stitch design artifacts)
    if [ -d ".stitch" ]; then
        log_info "Removing .stitch directory..."
        rm -rf .stitch
    fi

    # Ask if user wants to clear lessons learned
    if [ -f ".auto-coding/LESSONS_LEARNED.md" ]; then
        echo ""
        echo "Also clear LESSONS_LEARNED.md? (y/n)"
        read -r answer
        if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
            # Keep template structure but clear content
            cat > .auto-coding/LESSONS_LEARNED.md << 'EOF'
# Lessons Learned

> Record experiences, best practices, and lessons during development

---

## Categories

| Tag | Description |
|-----|-------------|
| #architecture | Architecture design related |
| #workflow | Workflow related |
| #testing | Testing related |
| #security | Security related |
| #agent-collaboration | Agent collaboration related |

---

## Experience Levels

| Level | Description |
|-------|-------------|
| ⭐⭐⭐ | Critical - Must follow |
| ⭐⭐ | Important - Strongly recommended |
| ⭐ | Reference - Adopt as needed |

---

## Records

<!-- Add your lessons learned below -->

EOF
            log_success "LESSONS_LEARNED.md cleared"
        fi
    fi

    # Clean project-generated config files in root directory
    clean_project_config_files

    # Detect and clean project-generated directories
    detect_and_clean_generated_dirs

    log_success "Project has been reset!"
    echo ""
    echo "Next steps:"
    echo "  1. Run ./init.sh to initialize environment(chmod +x init.sh if not executable)"
    echo "  2. Start Claude Code: claude"
    echo "  3. Tell Claude your new project requirements"
    echo ""
}

# Clean project-generated config files in root directory
clean_project_config_files() {
    log_info "Cleaning project config files..."

    # Common project config files (not framework scaffold files)
    PROJECT_CONFIG_FILES=(
        "next-env.d.ts"
        "next.config.js"
        "next.config.mjs"
        "next.config.ts"
        "postcss.config.js"
        "postcss.config.mjs"
        "tailwind.config.js"
        "tailwind.config.ts"
        "tailwind.config.mjs"
        "vitest.config.ts"
        "vitest.config.js"
        "vite.config.ts"
        "vite.config.js"
        "jest.config.js"
        "jest.config.ts"
        "webpack.config.js"
        "webpack.config.ts"
        "rollup.config.js"
        "rollup.config.ts"
        "babel.config.js"
        "babel.config.json"
        ".eslintrc.js"
        ".eslintrc.json"
        ".eslintrc.yml"
        ".prettierrc"
        ".prettierrc.js"
        ".prettierrc.json"
        "tsconfig.json"
        "jsconfig.json"
        "package.json"
        "package-lock.json"
        "yarn.lock"
        "pnpm-lock.yaml"
        ".npmrc"
        ".yarnrc"
        ".nvmrc"
        ".node-version"
    )

    REMOVED_COUNT=0
    for file in "${PROJECT_CONFIG_FILES[@]}"; do
        if [ -f "$file" ]; then
            rm -f "$file"
            ((REMOVED_COUNT++))
        fi
    done

    if [ $REMOVED_COUNT -gt 0 ]; then
        log_success "Removed $REMOVED_COUNT project config files"
    else
        log_info "No project config files to remove"
    fi
}

# Detect and clean project-generated directories
detect_and_clean_generated_dirs() {
    echo ""
    log_info "Scanning for project-generated directories..."

    # Directories to preserve (framework core)
    PRESERVE_DIRS=".git|.github|.claude|.auto-coding|docs|node_modules"
    # Files to preserve (framework scaffold)
    PRESERVE_FILES="CLAUDE.md|README.md|AGENTS.md|setup.sh|init.sh|.gitignore|CLAUDE-architecture.excalidraw"

    # Find directories that are not in preserve list
    FOUND_DIRS=()
    FOUND_HIDDEN_DIRS=()

    # Check regular directories
    for dir in */; do
        dir_name="${dir%/}"
        if [[ ! "$dir_name" =~ ^($PRESERVE_DIRS)$ ]]; then
            FOUND_DIRS+=("$dir_name")
        fi
    done

    # Check hidden directories (except .git, .claude, .auto-coding)
    for dir in .*/; do
        dir_name="${dir%/}"
        # Skip . and ..
        if [[ "$dir_name" == "." || "$dir_name" == ".." ]]; then
            continue
        fi
        if [[ ! "$dir_name" =~ ^($PRESERVE_DIRS)$ ]]; then
            FOUND_HIDDEN_DIRS+=("$dir_name")
        fi
    done

    # Combine all found directories
    ALL_DIRS=("${FOUND_DIRS[@]}" "${FOUND_HIDDEN_DIRS[@]}")

    if [ ${#ALL_DIRS[@]} -eq 0 ]; then
        log_info "No project-generated directories found."
        return 0
    fi

    echo ""
    log_warn "Found ${#ALL_DIRS[@]} project-generated directories:"
    for dir in "${ALL_DIRS[@]}"; do
        echo "  - $dir"
    done

    echo ""
    echo "Clean up these directories? (y/n)"
    read -r answer

    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        for dir in "${ALL_DIRS[@]}"; do
            log_info "Removing: $dir"
            rm -rf "$dir"
        done
        log_success "Project-generated directories cleaned!"
    else
        log_info "Skipped cleaning project-generated directories."
    fi
}

# Check dependencies
check_dependencies() {
    echo ""
    log_info "Checking Skills dependencies..."
    if [ -f ".claude/scripts/check-skills.js" ]; then
        node .claude/scripts/check-skills.js 2>/dev/null || {
            log_warn "Skills auto-install failed, please install manually:"
            echo "   claude skill install webapp-testing"
            echo "   npx skills add nextlevelbuilder/ui-ux-pro-max-skill"
            echo "   claude skill install mcp-builder"
        }
    else
        log_warn "Skills check script not found"
    fi

    log_info "Checking MCP dependencies..."
    if [ -f ".claude/scripts/check-mcp.js" ]; then
        node .claude/scripts/check-mcp.js 2>/dev/null || true
    fi
}

# Main logic
case "$1" in
    new)
        if [ -z "$2" ]; then
            echo "Error: Project name required"
            echo "Usage: ./setup.sh new <project-name>"
            exit 1
        fi
        create_new_project "$2"
        ;;
    upgrade)
        upgrade_project "$2"
        ;;
    reset)
        reset_project
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        # Legacy usage compatibility: ./setup.sh <project-name>
        if [ -n "$1" ]; then
            log_warn "Legacy usage deprecated, recommended: ./setup.sh new $1"
            echo ""
            create_new_project "$1"
        else
            show_help
            exit 1
        fi
        ;;
esac
