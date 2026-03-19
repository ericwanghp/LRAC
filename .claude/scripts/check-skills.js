#!/usr/bin/env node
/**
 * check-skills.js
 *
 * Checks and installs required skills for the Auto-Coding Framework
 * Run: node .claude/scripts/check-skills.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ROOT_DIR = path.resolve(__dirname, '../../');
const SKILLS_CONFIG = path.join(ROOT_DIR, '.claude/skills/framework-skills.json');

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

function getInstalledSkills() {
  const skills = [];

  // Method 1: Try reading from ~/.claude/skills/ directory directly
  // This works even when running inside Claude Code (nested session)
  const skillsDir = path.join(process.env.HOME || '', '.claude', 'skills');
  if (fs.existsSync(skillsDir)) {
    try {
      const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
      entries.forEach(entry => {
        if (entry.isDirectory() || entry.isSymbolicLink()) {
          skills.push(entry.name);
        }
      });
      if (skills.length > 0) {
        return skills;
      }
    } catch (e) {
      // Fall through to CLI method
    }
  }

  // Method 2: Try using npx skills list (portable)
  try {
    const npxResult = execSync('npx -y skills list 2>/dev/null || echo ""', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const lines = npxResult.split('\n');
    lines.forEach(line => {
      let match = line.match(/^(\w[-\w:]*)\s*·/);
      if (match) {
        skills.push(match[1]);
        return;
      }
      match = line.match(/^[-*]\s+(\w[-\w:]*)/);
      if (match) {
        skills.push(match[1]);
      }
    });
    if (skills.length > 0) {
      return Array.from(new Set(skills));
    }
  } catch (e) {
  }

  // Method 3: Try using claude skill list CLI
  try {
    const result = execSync('claude skill list 2>/dev/null || echo "[]"', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    // Parse the output to extract skill names
    // Format: "skillname · description" or "- skillname" or "* skillname"
    const lines = result.split('\n');
    lines.forEach(line => {
      // Try multiple patterns to match different output formats
      // Pattern 1: "skillname · description"
      let match = line.match(/^(\w[-\w]*)\s*·/);
      if (match) {
        skills.push(match[1]);
        return;
      }
      // Pattern 2: "- skillname" or "* skillname"
      match = line.match(/^[-*]\s+(\w[-\w]*)/);
      if (match) {
        skills.push(match[1]);
        return;
      }
    });
  } catch (e) {
    // Return whatever we have
  }

  return Array.from(new Set(skills));
}


function promptScope(skillName) {
  if (!process.stdin.isTTY || process.env.CI === 'true') {
    return Promise.resolve('user');
  }
  return new Promise((resolve) => {
    console.log(`\n  Select installation scope for ${skillName}:`);
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

/**
 * Install a skill from GitHub repository using npx skills add
 * @param {string} skillName - Display name of the skill
 * @param {string} actualSkillName - The actual skill name to pass to npx (e.g., "react:components")
 * @param {string} repository - GitHub repository (e.g., "google-labs-code/stitch-skills")
 * @param {string} scope - Installation scope
 */
async function installGitHubSkill(skillName, actualSkillName, repository, scope) {
  const command = `npx skills add ${repository} --skill ${actualSkillName} --${scope}`;

  try {
    log(`  Running: ${command}`, 'info');
    execSync(command, {
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: ROOT_DIR
    });
    log(`  Skill ${skillName} installed successfully`, 'success');
    return true;
  } catch (e) {
    log(`  Failed to install ${skillName}: ${e.message}`, 'error');
    return false;
  }
}

async function installSkill(skillName, source, options = {}) {
  log(`Installing skill: ${skillName}...`, 'install');

  try {
    if (source === 'built-in') {
      log(`  Skill ${skillName} is built-in, skipping installation`, 'info');
      return true;
    }

    // Handle GitHub-hosted skills (e.g., Stitch skills)
    if (source && source.startsWith('github:')) {
      const repository = source.replace('github:', '');
      const actualSkillName = options.skillName || skillName;

      // Ask user for installation scope (convert to flag format)
      const scopeChoice = await promptScope(skillName);
      const scopeFlag = scopeChoice === 'user' ? 'global' : scopeChoice;
      log(`  Selected scope: ${scopeChoice} (--${scopeFlag})`, 'info');

      return await installGitHubSkill(skillName, actualSkillName, repository, scopeFlag);
    }

    // Handle claude-plugin: prefix - use claude plugin install
    if (source && source.startsWith('claude-plugin:')) {
      const pluginName = source.replace('claude-plugin:', '');
      const scope = await promptScope(skillName);
      log(`  Selected scope: ${scope}`, 'info');

      const installCommand = `claude plugin install -s ${scope} ${pluginName}`;
      try {
        log(`  Running: ${installCommand}`, 'info');
        execSync(installCommand, {
          encoding: 'utf8',
          stdio: 'inherit',
          cwd: ROOT_DIR
        });
        log(`  Skill ${skillName} installed successfully`, 'success');
        return true;
      } catch (e) {
        throw new Error(`Plugin install failed for ${skillName}`);
      }
    }

    // Handle npx: prefix - use npx skills add
    if (source && source.startsWith('npx:')) {
      const repoInfo = source.replace('npx:', '');
      const skillArg = options.skillName ? ` --skill ${options.skillName}` : '';
      const installCmd = options.installCommand || `npx skills add ${repoInfo}${skillArg} --global`;

      try {
        log(`  Running: ${installCmd}`, 'info');
        execSync(installCmd, {
          encoding: 'utf8',
          stdio: 'inherit',
          cwd: ROOT_DIR
        });
        log(`  Skill ${skillName} installed successfully`, 'success');
        return true;
      } catch (e) {
        throw new Error(`npx skills add failed for ${skillName}`);
      }
    }

    // Handle skill:// and other sources - try portable first, then runtime-specific
    const scope = await promptScope(skillName);
    log(`  Selected scope: ${scope}`, 'info');
    const npxScope = scope === 'user' ? 'global' : scope;
    const installCandidates = [
      `npx skills add anthropics/skills --skill ${skillName} --${npxScope}`,
      `claude plugin install -s ${scope} ${skillName}`,
      `claude skill install ${skillName}`
    ];

    let installed = false;

    for (const installCommand of installCandidates) {
      try {
        log(`  Running: ${installCommand}`, 'info');
        execSync(installCommand, {
          encoding: 'utf8',
          stdio: 'inherit',
          cwd: ROOT_DIR
        });
        installed = true;
        break;
      } catch (e) {
      }
    }

    if (!installed) {
      throw new Error(`No install command succeeded for ${skillName}`);
    }

    log(`  Skill ${skillName} installed successfully`, 'success');
    return true;
  } catch (e) {
    log(`  Failed to install ${skillName}: ${e.message}`, 'error');
    return false;
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║       Auto-Coding Framework - Skill Dependency Check       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Load skills config
  if (!fs.existsSync(SKILLS_CONFIG)) {
    log('Skills configuration not found', 'error');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(SKILLS_CONFIG, 'utf8'));
  const allSkills = [
    ...(config.skills.required || []),
    ...(config.skills.recommended || []),  // Include recommended skills
    ...(config.skills.optional || [])
  ];

  // Process stitch skills section (GitHub-hosted skills)
  const stitchSection = config.skills.stitch;
  if (stitchSection && stitchSection.skills) {
    stitchSection.skills.forEach(skill => {
      allSkills.push({
        ...skill,
        _stitchConfig: stitchSection  // Pass stitch config for installation
      });
    });
  }

  if (allSkills.length === 0) {
    log('No skill dependencies defined', 'info');
    process.exit(0);
  }

  log(`Checking ${allSkills.length} skill dependencies...\n`, 'info');

  const missing = [];
  const installed = [];
  const failed = [];

  // Get all installed skills once (much faster than checking each one)
  log('Fetching installed skills...', 'info');
  const installedSkillNames = getInstalledSkills();
  log(`Found ${installedSkillNames.length} installed skills\n`, 'info');

  // Check each skill
  allSkills.forEach(skill => {
    if (skill.source === 'built-in') {
      log(`${skill.name}: Built-in`, 'info');
      installed.push(skill.name);
    } else if (skill.source && skill.source.startsWith('github:')) {
      // GitHub-hosted skills - check by name
      if (installedSkillNames.includes(skill.name)) {
        log(`${skill.name}: Installed (GitHub)`, 'success');
        installed.push(skill.name);
      } else {
        log(`${skill.name}: Missing (GitHub: ${skill.source})`, 'warning');
        missing.push(skill);
      }
    } else if (installedSkillNames.includes(skill.name)) {
      log(`${skill.name}: Installed`, 'success');
      installed.push(skill.name);
    } else {
      log(`${skill.name}: Missing`, 'warning');
      missing.push(skill);
    }
  });

  // Summary
  console.log('\n' + '─'.repeat(50));
  console.log('\n📊 Summary:\n');
  console.log(`   Installed: ${installed.length}`);
  console.log(`   Missing:   ${missing.length}`);

  // Install missing skills
  if (missing.length > 0) {
    console.log('\n📦 Installing missing skills...\n');

    for (const skill of missing) {
      if (skill.autoInstall !== false) {
        // Pass skill options for GitHub-hosted skills (e.g., skillName for Stitch)
        const options = skill.skillName ? { skillName: skill.skillName } : {};
        const success = await installSkill(skill.name, skill.source, options);
        if (success) {
          installed.push(skill.name);
        } else {
          failed.push(skill);  // Store full skill object for proper error display
        }
      } else {
        log(`${skill.name}: Manual installation required`, 'warning');
        // Show appropriate install command based on source type
        if (skill.source && skill.source.startsWith('github:')) {
          const repo = skill.source.replace('github:', '');
          log(`  Run: npx skills add ${repo} --skill ${skill.skillName || skill.name} --global`, 'info');
        } else {
          log(`  Run: npx skills add anthropics/skills --skill ${skill.name} --global`, 'info');
          log(`  Or:  claude skill install ${skill.name}`, 'info');
        }
        failed.push(skill);  // Store full skill object for proper error display
      }
    }
  }

  // Final status
  console.log('\n' + '─'.repeat(50));

  if (failed.length === 0) {
    log('\nAll skill dependencies satisfied!\n', 'success');
  } else {
    log(`\n${failed.length} skills need manual installation:`, 'warning');
    failed.forEach(skill => {
      if (skill.source && skill.source.startsWith('github:')) {
        const repo = skill.source.replace('github:', '');
        const skillName = skill.skillName || skill.name;
        console.log(`   - npx skills add ${repo} --skill ${skillName} --global`);
      } else {
        console.log(`   - npx skills add anthropics/skills --skill ${skill.name || skill} --global`);
        console.log(`   - claude skill install ${skill.name || skill}`);
      }
    });
    console.log('');
  }

  rl.close();
}

main().catch(err => {
  console.error(err);
  rl.close();
  process.exit(1);
});
