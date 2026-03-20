#!/bin/bash
#
# init.sh - Project Environment Initialization Script
#
# Usage:
#   1. Install project dependencies
#   2. Initialize database/config files
#   3. Start development server
#   4. Verify environment availability
#
# Usage: ./init.sh [options]
#   -h, --help     Show help
#   -s, --skip-deps  Skip dependency installation
#   -d, --dev      Start development mode
#   -t, --test     Run tests to verify environment

set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default configuration
SKIP_DEPS=false
DEV_MODE=false
TEST_MODE=false
RUNTIME_MODE="auto"
EFFECTIVE_RUNTIME=""

# ============================================================
# Function Definitions
# ============================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    cat << EOF
Usage: ./init.sh [options]

Options:
  -h, --help       Show this help message
  -s, --skip-deps  Skip dependency installation
  -d, --dev        Start development mode (keep service running)
  -t, --test       Run tests to verify environment
  -r, --runtime    Runtime mode: auto | claude | codex

Examples:
  ./init.sh              # Full initialization
  ./init.sh -s           # Skip dependency installation
  ./init.sh -d           # Development mode (run in background)
  ./init.sh -t           # Environment verification only
  ./init.sh -r codex     # Prefer Codex-compatible guidance and install paths

EOF
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

resolve_runtime_mode() {
    case "$RUNTIME_MODE" in
        auto)
            if command_exists claude; then
                EFFECTIVE_RUNTIME="claude"
            elif command_exists codex; then
                EFFECTIVE_RUNTIME="codex"
            else
                EFFECTIVE_RUNTIME="generic"
            fi
            ;;
        claude|codex)
            EFFECTIVE_RUNTIME="$RUNTIME_MODE"
            ;;
        *)
            log_error "Invalid runtime: $RUNTIME_MODE (expected: auto|claude|codex)"
            exit 1
            ;;
    esac
}

# Check and setup GitHub CLI
check_github_cli() {
    log_info "Checking GitHub CLI..."

    if ! command_exists gh; then
        log_warn "GitHub CLI (gh) not installed"

        # Detect OS and install
        if [[ "$OSTYPE" == "darwin"* ]]; then
            if command_exists brew; then
                log_info "Installing GitHub CLI via Homebrew..."
                brew install gh
            else
                log_error "Homebrew not found. Please install Homebrew first: https://brew.sh"
                log_info "Or install GitHub CLI manually: https://cli.github.com"
                return 1
            fi
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            if command_exists apt-get; then
                log_info "Installing GitHub CLI via apt..."
                curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
                echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
                sudo apt update
                sudo apt install gh -y
            elif command_exists dnf; then
                log_info "Installing GitHub CLI via dnf..."
                sudo dnf install gh -y
            elif command_exists yum; then
                log_info "Installing GitHub CLI via yum..."
                sudo yum install gh -y
            else
                log_error "Could not detect package manager. Please install GitHub CLI manually: https://cli.github.com"
                return 1
            fi
        else
            log_error "Unsupported OS. Please install GitHub CLI manually: https://cli.github.com"
            return 1
        fi

        log_success "GitHub CLI installed"
    else
        log_success "GitHub CLI is installed: $(gh --version | head -1)"
    fi

    # Check if logged in
    log_info "Checking GitHub CLI authentication status..."
    if gh auth status &>/dev/null; then
        local username=$(gh api user -q '.login' 2>/dev/null)
        log_success "GitHub CLI is authenticated as: $username"
        return 0
    else
        log_warn "GitHub CLI is not authenticated"
        log_info "Starting GitHub CLI login process..."
        log_info "Please follow the prompts to authenticate..."

        if gh auth login; then
            local username=$(gh api user -q '.login' 2>/dev/null)
            log_success "GitHub CLI authenticated successfully as: $username"
            return 0
        else
            log_error "GitHub CLI authentication failed"
            log_info "You can try again later with: gh auth login"
            return 1
        fi
    fi
}

# Detect project type and install dependencies
install_dependencies() {
    log_info "Detecting project type..."

    # Node.js project
    if [ -f "$PROJECT_ROOT/package.json" ]; then
        log_info "Node.js project detected"
        if command_exists npm; then
            log_info "Installing npm dependencies..."
            npm install
            log_success "Node.js dependencies installed"
        else
            log_error "npm not installed. Please install Node.js first"
            exit 1
        fi
    fi

    # Python project
    if [ -f "$PROJECT_ROOT/requirements.txt" ]; then
        log_info "Python project detected"
        if command_exists pip; then
            log_info "Installing Python dependencies..."
            pip install -r requirements.txt
            log_success "Python dependencies installed"
        else
            log_error "pip not installed. Please install Python first"
            exit 1
        fi
    fi

    # Go project
    if [ -f "$PROJECT_ROOT/go.mod" ]; then
        log_info "Go project detected"
        if command_exists go; then
            log_info "Downloading Go dependencies..."
            go mod download
            log_success "Go dependencies downloaded"
        else
            log_error "go not installed. Please install Go first"
            exit 1
        fi
    fi

    # Rust project
    if [ -f "$PROJECT_ROOT/Cargo.toml" ]; then
        log_info "Rust project detected"
        if command_exists cargo; then
            log_info "Downloading Rust dependencies..."
            cargo fetch
            log_success "Rust dependencies downloaded"
        else
            log_error "cargo not installed. Please install Rust first"
            exit 1
        fi
    fi
}

# Initialize database
init_database() {
    log_info "Checking database initialization..."

    # Check for database initialization script
    if [ -f "$PROJECT_ROOT/scripts/init-db.sh" ]; then
        log_info "Executing database initialization script..."
        bash "$PROJECT_ROOT/scripts/init-db.sh"
        log_success "Database initialization complete"
    elif [ -f "$PROJECT_ROOT/migrations/init.sql" ]; then
        log_info "SQL migration file detected"
        # Database initialization logic
        log_success "Database configuration complete"
    else
        log_info "No database initialization required"
    fi
}

# Copy environment configuration
setup_env() {
    log_info "Checking environment configuration..."

    if [ -f "$PROJECT_ROOT/.env.example" ] && [ ! -f "$PROJECT_ROOT/.env" ]; then
        if [ -f "$PROJECT_ROOT/.env.example" ]; then
            cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
            log_success "Created .env configuration file"
            log_warn "Please edit .env file to configure actual parameters"
        fi
    else
        log_info "Environment configuration already exists"
    fi
}

ensure_default_task_bootstrap() {
    local tasks_file="$PROJECT_ROOT/.auto-coding/tasks.json"
    local template_file="$PROJECT_ROOT/.auto-coding/config/tasks.init.template.json"
    local project_name
    project_name=$(basename "$PROJECT_ROOT")
    local now_utc
    now_utc=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    if [ -f "$tasks_file" ]; then
        return 0
    fi

    mkdir -p "$PROJECT_ROOT/.auto-coding"

    if [ -f "$template_file" ] && command_exists python3; then
        log_info "tasks.json missing, seeding from tasks.init.template.json..."
        python3 - "$template_file" "$tasks_file" "$project_name" "$now_utc" << 'PY'
import json
import sys

template_path, tasks_path, project_name, now_utc = sys.argv[1:5]

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
with open(tasks_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write("\n")
PY
        log_success "tasks.json initialized from tasks.init.template.json"
    else
        log_warn "tasks.init.template.json unavailable, creating minimal tasks.json"
        cat > "$tasks_file" << EOF
{
  "version": "3.0",
  "project": "$project_name",
  "parallelGroups": {},
  "features": []
}
EOF
    fi

    if [ ! -f "$PROJECT_ROOT/.auto-coding/progress.txt" ]; then
        cat > "$PROJECT_ROOT/.auto-coding/progress.txt" << 'EOF'
# Progress Notes
EOF
        log_info "progress.txt initialized"
    fi
}

# Run basic tests to verify environment
run_health_check() {
    log_info "Running environment health check..."

    local failed=0

    # Check Node.js environment
    if [ -f "$PROJECT_ROOT/package.json" ]; then
        if command_exists node; then
            node_version=$(node --version)
            log_success "Node.js version: $node_version"
        else
            log_error "Node.js not installed"
            failed=1
        fi
    fi

    # Check key directories
    for dir in src test tests; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            log_success "Directory exists: $dir"
        fi
    done

    # Check key files
    if [ -f "$PROJECT_ROOT/.auto-coding/tasks.json" ]; then
        log_success "Task configuration file exists"
    else
        log_warn "Task configuration file does not exist: .auto-coding/tasks.json"
    fi

    if [ -f "$PROJECT_ROOT/.auto-coding/progress.txt" ]; then
        log_success "Progress record file exists"
    else
        log_warn "Progress record file does not exist: .auto-coding/progress.txt"
    fi

    # Run project tests (if they exist)
    if [ -f "$PROJECT_ROOT/package.json" ]; then
        log_info "Running project tests..."
        if npm test -- --passWithNoTests 2>/dev/null; then
            log_success "Tests passed"
        else
            log_warn "Tests failed or no test files"
        fi
    fi

    if [ $failed -eq 0 ]; then
        log_success "Environment health check complete"
        return 0
    else
        log_error "Environment health check found issues"
        return 1
    fi
}

# Check framework skills dependencies
check_framework_skills() {
    log_info "Checking framework Skills dependencies..."

    if [ -f "$PROJECT_ROOT/.claude/scripts/check-skills.js" ]; then
        FRAMEWORK_RUNTIME="$EFFECTIVE_RUNTIME" node "$PROJECT_ROOT/.claude/scripts/check-skills.js"
    else
        log_warn "Skills check script does not exist"
    fi
}

# Check framework MCP dependencies
check_framework_mcp() {
    log_info "Checking framework MCP dependencies..."

    if [ -f "$PROJECT_ROOT/.claude/scripts/check-mcp.js" ]; then
        FRAMEWORK_RUNTIME="$EFFECTIVE_RUNTIME" node "$PROJECT_ROOT/.claude/scripts/check-mcp.js"
        if [ "$EFFECTIVE_RUNTIME" = "codex" ]; then
            log_info "Codex mode: if any MCP auto-install is skipped, configure MCP in Codex runtime settings"
        fi
    else
        log_warn "MCP check script does not exist"
    fi
}

check_phase_manifest() {
    log_info "Checking phase context manifest..."

    if [ -f "$PROJECT_ROOT/.claude/scripts/verify-phase-manifest.js" ]; then
        node "$PROJECT_ROOT/.claude/scripts/verify-phase-manifest.js"
    else
        log_warn "Phase manifest check script does not exist"
    fi
}

ensure_npm_global_bin_in_path() {
    if ! command_exists npm; then
        return 0
    fi

    local npm_prefix
    npm_prefix=$(npm prefix -g 2>/dev/null || true)
    if [ -n "$npm_prefix" ] && [ -d "$npm_prefix/bin" ]; then
        case ":$PATH:" in
            *":$npm_prefix/bin:"*) ;;
            *)
                export PATH="$npm_prefix/bin:$PATH"
                hash -r
                ;;
        esac
    fi
}

is_agent_browser_skill_installed() {
    local skill_dir="$HOME/.claude/skills/agent-browser"
    if [ -d "$skill_dir" ] || [ -L "$skill_dir" ]; then
        return 0
    fi

    if command_exists npx; then
        if npx -y skills list 2>/dev/null | grep -Eq '(^|[[:space:]])agent-browser([[:space:]]|·|$)'; then
            return 0
        fi
    fi

    return 1
}

check_agent_browser() {
    log_info "Checking agent-browser setup..."

    if ! command_exists npm; then
        log_error "npm not installed. Please install Node.js first"
        return 1
    fi

    ensure_npm_global_bin_in_path

    if ! command_exists agent-browser; then
        log_info "Installing agent-browser via npm..."
        if npm install -g agent-browser; then
            log_success "agent-browser installed"
            ensure_npm_global_bin_in_path
        else
            log_warn "Global install failed, trying user-local npm prefix..."
            local npm_user_prefix="$HOME/.npm-global"
            mkdir -p "$npm_user_prefix"
            npm config set prefix "$npm_user_prefix"
            export PATH="$npm_user_prefix/bin:$PATH"
            hash -r

            if npm install -g agent-browser; then
                log_success "agent-browser installed with user-local npm prefix"
                log_warn "If needed, add this to your shell profile: export PATH=\"$npm_user_prefix/bin:\$PATH\""
                ensure_npm_global_bin_in_path
            else
                log_error "Failed to install agent-browser"
                return 1
            fi
        fi
    fi

    if ! command_exists agent-browser; then
        local npm_prefix
        npm_prefix=$(npm prefix -g 2>/dev/null || true)
        if [ -n "$npm_prefix" ]; then
            log_warn "npm global prefix: $npm_prefix"
        fi
        log_error "agent-browser command not found after installation"
        return 1
    else
        log_success "agent-browser is installed: $(agent-browser --version)"
    fi

    log_info "Installing Chromium for agent-browser..."
    if agent-browser install; then
        log_success "Chromium installed for agent-browser"
    else
        log_error "Failed to install Chromium for agent-browser"
        return 1
    fi

    if ! command_exists npx; then
        log_error "npx not installed. Please install Node.js first"
        return 1
    fi

    if is_agent_browser_skill_installed; then
        log_success "agent-browser skill already installed"
    else
        log_info "Installing agent-browser skill..."
        if npx skills add vercel-labs/agent-browser; then
            log_success "agent-browser skill installed"
        else
            log_warn "Failed to install agent-browser skill automatically. Try: npx skills add vercel-labs/agent-browser"
        fi
    fi
}

check_ui_ux_pro_max_skill() {
    log_info "Checking ui-ux-pro-max skill setup..."

    local installed=false

    if [ "$EFFECTIVE_RUNTIME" = "codex" ]; then
        if command_exists npx; then
            if npx skills add nextlevelbuilder/ui-ux-pro-max-skill >/dev/null 2>&1; then
                installed=true
            fi
        fi
    else
        if command_exists plugin; then
            if plugin install ui-ux-pro-max@ui-ux-pro-max-skill >/dev/null 2>&1; then
                installed=true
            else
                plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill >/dev/null 2>&1 || true
                if plugin install ui-ux-pro-max@ui-ux-pro-max-skill >/dev/null 2>&1; then
                    installed=true
                fi
            fi
        fi

        if [ "$installed" = false ] && command_exists claude; then
            if claude -p "/plugin install ui-ux-pro-max@ui-ux-pro-max-skill" >/dev/null 2>&1; then
                installed=true
            else
                claude -p "/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill" >/dev/null 2>&1 || true
                if claude -p "/plugin install ui-ux-pro-max@ui-ux-pro-max-skill" >/dev/null 2>&1; then
                    installed=true
                fi
            fi
        fi

        if [ "$installed" = false ] && command_exists npx; then
            if npx skills add nextlevelbuilder/ui-ux-pro-max-skill >/dev/null 2>&1; then
                installed=true
            fi
        fi
    fi

    if [ "$installed" = false ] && command_exists npx; then
        if npx skills add nextlevelbuilder/ui-ux-pro-max-skill >/dev/null 2>&1; then
            installed=true
        fi
    fi

    if [ "$installed" = true ]; then
        log_success "ui-ux-pro-max skill installed"
    else
        log_warn "Could not auto-install ui-ux-pro-max skill in this environment"
        if [ "$EFFECTIVE_RUNTIME" = "codex" ]; then
            log_warn "Run manually for Codex-compatible path:"
            log_warn "npx skills add nextlevelbuilder/ui-ux-pro-max-skill"
        else
            log_warn "Run manually in Claude CLI:"
            log_warn "/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill"
            log_warn "/plugin install ui-ux-pro-max@ui-ux-pro-max-skill"
            log_warn "Or portable fallback: npx skills add nextlevelbuilder/ui-ux-pro-max-skill"
        fi
    fi
}

# Start development server
start_dev_server() {
    log_info "Starting development server..."

    if [ -f "$PROJECT_ROOT/package.json" ]; then
        # Detect dev script
        if npm run | grep -q "dev"; then
            log_info "Executing npm run dev..."
            npm run dev &
            DEV_PID=$!
            log_success "Development server started (PID: $DEV_PID)"
            log_info "Access URL: http://localhost:3000"

            # Wait for server to start
            sleep 3

            if curl -s http://localhost:3000 >/dev/null 2>&1; then
                log_success "Server is running normally"
            else
                log_warn "Server may not be ready, please check manually"
            fi
        else
            log_warn "dev script not found, please start manually"
        fi
    else
        log_warn "Unable to determine how to start development server"
    fi
}

# ============================================================
# Main Logic
# ============================================================

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -s|--skip-deps)
            SKIP_DEPS=true
            shift
            ;;
        -d|--dev)
            DEV_MODE=true
            shift
            ;;
        -t|--test)
            TEST_MODE=true
            shift
            ;;
        -r|--runtime)
            if [[ -z "$2" ]]; then
                log_error "Missing value for --runtime (expected: auto|claude|codex)"
                exit 1
            fi
            RUNTIME_MODE="$2"
            shift 2
            ;;
        *)
            log_error "Unknown argument: $1"
            show_help
            exit 1
            ;;
    esac
done

resolve_runtime_mode

# Show welcome message
echo "========================================"
echo "  Project Environment Initialization"
echo "========================================"
echo ""
log_info "Runtime mode: $RUNTIME_MODE (effective: $EFFECTIVE_RUNTIME)"

# Step 1: Install dependencies
if [ "$SKIP_DEPS" = false ]; then
    install_dependencies
else
    log_info "Skipping dependency installation"
fi

# Step 2: Setup environment
setup_env

# Step 3: Initialize database
init_database

# Step 3.5: Ensure default task bootstrap
ensure_default_task_bootstrap

# Step 4: Health check
run_health_check

# Step 5: Check Skills dependencies
check_framework_skills

# Step 5.5: Check MCP dependencies
check_framework_mcp

# Step 5.6: Check phase context manifest
check_phase_manifest

# Step 5.7: Check and install agent-browser
check_agent_browser

# Step 5.8: Check and install ui-ux-pro-max skill
check_ui_ux_pro_max_skill

# Step 6: Start development server
if [ "$DEV_MODE" = true ]; then
    start_dev_server
fi

# Test mode
if [ "$TEST_MODE" = true ]; then
    log_info "Test mode: Verification only"
    run_health_check
    exit $?
fi

echo ""
echo "========================================"
log_success "Initialization complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Read .auto-coding/tasks.json to understand tasks"
echo "  2. Read .auto-coding/progress.txt to understand progress"
echo "  3. Set active phase and load context pointers (AUTO_CODING_PHASE=1..8 node .claude/hooks/read-context.js)"
echo "  4. Select a task to start development"
echo "  or directly start your coding runtime (e.g. Claude CLI or Codex CLI) and tell it your project requirements"
echo ""
