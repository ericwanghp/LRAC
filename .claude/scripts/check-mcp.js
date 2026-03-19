#!/usr/bin/env node
/**
 * check-mcp.js
 *
 * Checks and validates MCP server configuration for the Auto-Coding Framework
 * Run: node .claude/scripts/check-mcp.js
 *
 * Note: MCP servers can be configured in multiple ways:
 * 1. As plugins (newer method): ~/.claude/settings.json -> enabledPlugins
 * 2. As traditional MCP servers: ~/.claude.json -> mcpServers
 * 3. Project level: .mcp.json -> mcpServers
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ROOT_DIR = path.resolve(__dirname, '../../');
const MCP_CONFIG = path.join(ROOT_DIR, '.auto-coding/config/mcp.json');

function log(message, type = 'info') {
  const icons = {
    info: 'ℹ️ ',
    success: '✅',
    warning: '⚠️ ',
    error: '❌',
    install: '📦'
  };
  console.log(`${icons[type] || ''} ${message}`);
}

function commandExists(cmd) {
  try {
    require('child_process').execSync(`command -v ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function getRecommendedMCPs() {
  if (!fs.existsSync(MCP_CONFIG)) {
    return [];
  }
  try {
    const config = JSON.parse(fs.readFileSync(MCP_CONFIG, 'utf8'));
    return Object.entries(config.servers || {}).map(([name, server]) => ({
      name,
      ...server
    }));
  } catch (e) {
    log(`Failed to parse mcp config: ${e.message}`, 'error');
    return [];
  }
}

// Plugin name mapping (short name -> full plugin name patterns)
const PLUGIN_PATTERNS = {
  'playwright': ['playwright@claude-plugins-official', 'playwright@'],
  'context7': ['context7@claude-plugins-official', 'context7@'],
  'chrome-devtools': ['chrome-devtools@', 'chrome-devtools'],
  'firecrawl': ['firecrawl@', 'firecrawl'],
  'stitch': ['stitch@', 'stitch']
};

// MCPs that require API keys
const API_KEY_MCPS = {
  'stitch': {
    'envVar': 'GOOGLE_API_KEY',
    'url': 'https://aistudio.google.com/apikey',
    'prompt': 'Enter your Google AI Studio API Key'
  }
};

function checkPluginInstalled(mcpName) {
  const settingsPath = path.join(process.env.HOME || '', '.claude', 'settings.json');
  const pluginsPath = path.join(process.env.HOME || '', '.claude', 'plugins', 'installed_plugins.json');

  const patterns = PLUGIN_PATTERNS[mcpName] || [mcpName];

  try {
    // Check settings.json for enabledPlugins
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      const enabledPlugins = settings.enabledPlugins || {};

      for (const pattern of patterns) {
        for (const pluginKey of Object.keys(enabledPlugins)) {
          if (pluginKey === pattern || pluginKey.startsWith(pattern)) {
            return { installed: true, level: 'plugin', source: 'settings.json' };
          }
        }
      }
    }

    // Check installed_plugins.json
    if (fs.existsSync(pluginsPath)) {
      const plugins = JSON.parse(fs.readFileSync(pluginsPath, 'utf8'));
      const pluginList = plugins.plugins || plugins;

      for (const pattern of patterns) {
        for (const pluginKey of Object.keys(pluginList)) {
          if (pluginKey === pattern || pluginKey.startsWith(pattern)) {
            return { installed: true, level: 'plugin', source: 'installed_plugins.json' };
          }
        }
      }
    }
  } catch (e) {
    // Ignore parse errors
  }

  return { installed: false, level: null };
}

function checkMCPServerInstalled(mcpName) {
  const homeClaudeConfig = path.join(process.env.HOME || '', '.claude.json');
  const projectMcpConfig = path.join(ROOT_DIR, '.mcp.json');

  try {
    // Check project level .mcp.json first
    if (fs.existsSync(projectMcpConfig)) {
      const config = JSON.parse(fs.readFileSync(projectMcpConfig, 'utf8'));
      if (config.mcpServers && config.mcpServers[mcpName]) {
        return { installed: true, level: 'project', source: '.mcp.json' };
      }
    }

    // Check user level ~/.claude.json
    if (fs.existsSync(homeClaudeConfig)) {
      const config = JSON.parse(fs.readFileSync(homeClaudeConfig, 'utf8'));

      // Check global mcpServers
      if (config.mcpServers && config.mcpServers[mcpName]) {
        return { installed: true, level: 'user', source: '.claude.json (global)' };
      }

      // Check project-specific mcpServers in projects section
      if (config.projects && config.projects[ROOT_DIR]) {
        const projectConfig = config.projects[ROOT_DIR];
        if (projectConfig.mcpServers && projectConfig.mcpServers[mcpName]) {
          return { installed: true, level: 'project', source: '.claude.json (project)' };
        }
      }
    }
  } catch (e) {
    // Ignore parse errors
  }

  return { installed: false, level: null };
}

function checkMCPInstalled(mcpName) {
  // First check if it's installed as a plugin (newer method)
  const pluginStatus = checkPluginInstalled(mcpName);
  if (pluginStatus.installed) {
    return pluginStatus;
  }

  // Then check if it's configured as traditional MCP server
  return checkMCPServerInstalled(mcpName);
}

function getInstallCommand(mcp, scope = 'user', apiKey = null) {
  const installCommands = {
    'playwright': `claude mcp add -s ${scope} playwright -- npx @anthropic-ai/mcp-server-playwright`,
    'chrome-devtools': `claude mcp add -s ${scope} chrome-devtools -- npx -y chrome-devtools-mcp@latest`,
    'context7': `claude mcp add -s ${scope} context7 -- npx @anthropic-ai/context7-mcp`,
    'firecrawl': `claude mcp add -s ${scope} firecrawl -- npx firecrawl-mcp`,
    'stitch': apiKey
      ? `claude mcp add -s ${scope} stitch --transport http https://stitch.googleapis.com/mcp --header "X-Goog-Api-Key: ${apiKey}"`
      : `claude mcp add -s ${scope} stitch --transport http https://stitch.googleapis.com/mcp --header "X-Goog-Api-Key: YOUR_API_KEY"`
  };

  return installCommands[mcp.name] || `claude mcp add -s ${scope} ${mcp.name} -- <command>`;
}

function promptApiKey(mcpName) {
  const keyConfig = API_KEY_MCPS[mcpName];
  if (!keyConfig) {
    return Promise.resolve(null);
  }

  if (!process.stdin.isTTY || process.env.CI === 'true') {
    log(`${mcpName} requires an API key. Get it from: ${keyConfig.url}`, 'warning');
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    console.log(`\n${'─'.repeat(50)}`);
    log(`${mcpName} requires an API key`, 'warning');
    console.log(`  Get your API key from: ${keyConfig.url}`);
    console.log(`${'─'.repeat(50)}\n`);

    rl.question(`  ${keyConfig.prompt}: `, (answer) => {
      const key = answer.trim();
      if (!key) {
        log('No API key provided. Skipping installation.', 'warning');
        resolve(null);
      } else {
        resolve(key);
      }
    });
  });
}

function promptScope(mcpName) {
  if (!process.stdin.isTTY || process.env.CI === 'true') {
    return Promise.resolve('user');
  }
  return new Promise((resolve) => {
    console.log(`\n  Select installation scope for ${mcpName}:`);
    console.log(`    1) user     - Available to all projects (recommended)`);
    console.log(`    2) project  - Only for this project`);
    console.log(`    3) local    - Only for current directory`);

    rl.question(`  Enter choice [1-3, default: user]: `, (answer) => {
      const choice = answer.trim();
      let scope = 'user';

      if (choice === '2' || choice === 'project') {
        scope = 'project';
      } else if (choice === '3' || choice === 'local') {
        scope = 'local';
      }

      resolve(scope);
    });
  });
}

async function installMCP(mcp) {
  const { execSync } = require('child_process');

  log(`Installing MCP: ${mcp.name}...`, 'install');

  // Check if this MCP requires an API key
  let apiKey = null;
  if (API_KEY_MCPS[mcp.name]) {
    apiKey = await promptApiKey(mcp.name);
    if (!apiKey) {
      log(`Skipping ${mcp.name} - API key is required`, 'warning');
      log(`  Get your API key from: ${API_KEY_MCPS[mcp.name].url}`, 'info');
      return false;
    }
  }

  // Ask user for installation scope
  const scope = await promptScope(mcp.name);
  log(`  Selected scope: ${scope}`, 'info');
  const hasClaudeCli = commandExists('claude');
  if (!hasClaudeCli) {
    log(`  Claude CLI not found. Configure ${mcp.name} MCP in your active runtime settings manually.`, 'warning');
    return false;
  }

  try {
    // For MCPs that require API key (like Stitch), use custom install command
    if (apiKey) {
      const mcpCommand = getInstallCommand(mcp, scope, apiKey);
      log(`  Installing with API key...`, 'info');
      log(`  Command: ${mcpCommand.replace(apiKey, '***')}`, 'info');

      execSync(mcpCommand, {
        encoding: 'utf8',
        stdio: 'inherit',
        cwd: ROOT_DIR
      });

      log(`  MCP ${mcp.name} installed successfully`, 'success');
      return true;
    }

    // Try plugin install first (newer method)
    const pluginCommand = `claude plugin install -s ${scope} ${mcp.name}`;
    log(`  Trying: ${pluginCommand}`, 'info');

    execSync(pluginCommand, {
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: ROOT_DIR
    });

    log(`  MCP ${mcp.name} installed successfully as plugin`, 'success');
    return true;
  } catch (e) {
    // If plugin install fails, try traditional mcp add
    log(`  Plugin install failed, trying mcp add...`, 'info');

    try {
      const mcpCommand = getInstallCommand(mcp, scope, apiKey);
      log(`  Trying: ${mcpCommand.replace(apiKey || '', '***')}`, 'info');

      execSync(mcpCommand, {
        encoding: 'utf8',
        stdio: 'inherit',
        cwd: ROOT_DIR
      });

      log(`  MCP ${mcp.name} installed successfully`, 'success');
      return true;
    } catch (e2) {
      log(`  Failed to install ${mcp.name}: ${e2.message}`, 'error');
      return false;
    }
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         Auto-Coding Framework - MCP Dependency Check       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const mcps = getRecommendedMCPs();

  if (mcps.length === 0) {
    log('No MCP dependencies defined in mcp.json', 'info');
    process.exit(0);
  }

  log(`Checking ${mcps.length} MCP dependencies...\n`, 'info');

  const installed = [];
  const missing = [];

  // Check each MCP
  mcps.forEach(mcp => {
    const status = checkMCPInstalled(mcp.name);

    if (status.installed) {
      log(`${mcp.name}: Installed (${status.level}${status.source ? ', ' + status.source : ''})`, 'success');
      installed.push(mcp);
    } else {
      log(`${mcp.name}: Not configured`, 'warning');
      missing.push(mcp);
    }
  });

  // Summary
  console.log('\n' + '─'.repeat(50));
  console.log('\n📊 Summary:\n');
  console.log(`   Configured: ${installed.length}`);
  console.log(`   Missing:    ${missing.length}`);

  const failed = [];

  // Auto-install missing MCPs
  if (missing.length > 0) {
    console.log('\n📦 Installing missing MCPs...\n');

    for (const mcp of missing) {
      if (mcp.autoInstall !== false) {
        const success = await installMCP(mcp);
        if (success) {
          installed.push(mcp.name);
        } else {
          failed.push(mcp);
        }
      } else {
        log(`${mcp.name}: Manual installation required`, 'warning');
        log(`  Run: ${getInstallCommand(mcp)}`, 'info');
        failed.push(mcp);
      }
    }
  }

  // Final status
  console.log('\n' + '─'.repeat(50));

  if (failed.length === 0) {
    log('\nAll MCP dependencies are configured!\n', 'success');
  } else {
    log(`\n${failed.length} MCPs need manual installation:`, 'warning');
    failed.forEach(mcp => {
      console.log(`   # ${mcp.description || mcp.name}`);
      console.log(`   ${getInstallCommand(mcp)}\n`);
    });
    log('MCPs are optional but recommended for full functionality\n', 'info');
  }

  rl.close();
}

main().catch(err => {
  console.error(err);
  rl.close();
  process.exit(1);
});
