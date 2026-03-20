#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const CLAUDE_DIR = path.join(ROOT_DIR, '.claude');
const AGENTS_DIR = path.join(CLAUDE_DIR, 'agents');
const SKILLS_DIR = path.join(CLAUDE_DIR, 'skills');
const CONTEXT_DIR = path.join(CLAUDE_DIR, 'context');
const PHASE_MANIFEST_PATH = path.join(CONTEXT_DIR, 'phase-manifest.json');
const DEFAULT_BASELINE_PATH = path.join(CLAUDE_DIR, 'config', 'policy-baseline.json');
const TASKS_JSON_PATH = path.join(ROOT_DIR, '.auto-coding', 'tasks.json');

const args = process.argv.slice(2);
const strictMode = args.includes('--strict');
const jsonMode = args.includes('--json');
const sarifMode = args.includes('--sarif');
const writeBaseline = args.includes('--write-baseline');
const noBaseline = args.includes('--no-baseline');
let baselinePath = null;
let sarifOutputPath = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--baseline' && args[i + 1]) {
    baselinePath = path.resolve(ROOT_DIR, args[i + 1]);
    i++;
  }
  if (args[i] === '--sarif-output' && args[i + 1]) {
    sarifOutputPath = path.resolve(ROOT_DIR, args[i + 1]);
    i++;
  }
}

if (!noBaseline && !baselinePath && (writeBaseline || fs.existsSync(DEFAULT_BASELINE_PATH))) {
  baselinePath = DEFAULT_BASELINE_PATH;
}

const findings = [];

function addFinding(severity, code, message, file) {
  findings.push({ severity, code, message, file: normalizeFilePath(file) });
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return null;
  }
}

function normalizeFilePath(filePath) {
  if (!filePath) {
    return '';
  }
  const absolute = path.isAbsolute(filePath) ? filePath : path.join(ROOT_DIR, filePath);
  const relative = path.relative(ROOT_DIR, absolute);
  return relative.startsWith('..') ? filePath : relative.replace(/\\/g, '/');
}

function findingSignature(finding) {
  return `${finding.code}||${finding.file || ''}||${finding.message}`;
}

function parseBaseline(raw) {
  const parsed = JSON.parse(raw);
  const items = Array.isArray(parsed.items) ? parsed.items : [];
  const signatures = new Set();
  items.forEach((item) => {
    signatures.add(findingSignature({
      code: item.code || '',
      file: normalizeFilePath(item.file || ''),
      message: item.message || ''
    }));
  });
  return signatures;
}

function loadBaseline(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return { enabled: false, signatures: new Set(), path: filePath, error: null };
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return { enabled: true, signatures: parseBaseline(raw), path: filePath, error: null };
  } catch (e) {
    return { enabled: true, signatures: new Set(), path: filePath, error: e.message };
  }
}

function writeBaselineFile(filePath, sourceFindings) {
  const outputPath = filePath || DEFAULT_BASELINE_PATH;
  const items = sourceFindings.map((finding) => ({
    code: finding.code,
    file: normalizeFilePath(finding.file),
    message: finding.message
  }));
  const payload = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    items
  };
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return outputPath;
}

function walkFiles(dir, ext = '.md') {
  const files = [];
  if (!fs.existsSync(dir)) {
    return files;
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath, ext));
    } else if (entry.isFile() && fullPath.endsWith(ext)) {
      files.push(fullPath);
    }
  });
  return files;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return null;
  }
  const raw = match[1];
  const data = {};
  raw.split('\n').forEach((line) => {
    const idx = line.indexOf(':');
    if (idx === -1) {
      return;
    }
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^"|"$/g, '');
    data[key] = value;
  });
  return data;
}

function parseTools(toolText = '') {
  return toolText.split(',').map((t) => t.trim()).filter(Boolean);
}

function checkAgentFrontmatter(agentFiles) {
  const allowedModels = new Set(['opus', 'sonnet', 'haiku']);
  const allowedTools = new Set([
    'Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep',
    'TeamCreate', 'TaskCreate', 'TaskUpdate', 'TaskList', 'TaskGet', 'SendMessage',
    'WebSearch', 'WebFetch'
  ]);
  const agentMap = new Map();

  agentFiles.forEach((filePath) => {
    const content = readFileSafe(filePath);
    if (!content) {
      addFinding('error', 'AGENT_FILE_READ', 'Cannot read agent file', filePath);
      return;
    }
    const fm = parseFrontmatter(content);
    if (!fm) {
      addFinding('error', 'AGENT_FRONTMATTER_MISSING', 'Missing frontmatter block', filePath);
      return;
    }

    ['name', 'description', 'tools', 'model'].forEach((field) => {
      if (!fm[field]) {
        addFinding('error', 'AGENT_FIELD_MISSING', `Missing field: ${field}`, filePath);
      }
    });

    if (fm.model && !allowedModels.has(fm.model)) {
      addFinding('error', 'AGENT_MODEL_INVALID', `Invalid model: ${fm.model}`, filePath);
    }

    if (fm.base_rules) {
      const baseRulePath = path.join(AGENTS_DIR, '_base', fm.base_rules);
      if (!fs.existsSync(baseRulePath)) {
        addFinding('error', 'AGENT_BASE_RULE_MISSING', `base_rules file not found: ${fm.base_rules}`, filePath);
      }
    }

    const tools = parseTools(fm.tools || '');
    tools.forEach((toolName) => {
      if (!allowedTools.has(toolName)) {
        addFinding('warning', 'AGENT_TOOL_UNKNOWN', `Unknown tool in frontmatter: ${toolName}`, filePath);
      }
    });

    if (fm.name) {
      agentMap.set(fm.name, { filePath, frontmatter: fm, tools, content });
    }
  });

  return agentMap;
}

function parseAgentsSummary(agentsMdPath) {
  const content = readFileSafe(agentsMdPath);
  const summaryMap = new Map();
  if (!content) {
    addFinding('error', 'AGENTS_SUMMARY_MISSING', 'Cannot read AGENTS.md', agentsMdPath);
    return summaryMap;
  }

  const parseScope = content.split('\n## Usage')[0];
  const rowRegex = /\|\s*`([^`]+)`\s*\|\s*([A-Za-z]+)\s*\|\s*([^|]+)\|/g;
  let match = null;
  while ((match = rowRegex.exec(parseScope)) !== null) {
    const name = match[1].trim();
    const model = match[2].trim().toLowerCase();
    const responsibility = match[3].trim();
    const isReadOnly = /read-only/i.test(responsibility);
    summaryMap.set(name, { model, isReadOnly });
  }
  return summaryMap;
}

function checkAgentConsistency(agentMap, summaryMap) {
  summaryMap.forEach((summary, name) => {
    if (!agentMap.has(name)) {
      addFinding('warning', 'AGENT_SUMMARY_NO_FILE', `AGENTS.md contains missing agent file: ${name}`, '.claude/agents/AGENTS.md');
      return;
    }
    const agent = agentMap.get(name);
    const fmModel = (agent.frontmatter.model || '').toLowerCase();
    if (fmModel && summary.model && fmModel !== summary.model) {
      addFinding(
        'warning',
        'AGENT_MODEL_MISMATCH',
        `Model mismatch for ${name}: AGENTS.md=${summary.model}, frontmatter=${fmModel}`,
        agent.filePath
      );
    }

    if (summary.isReadOnly) {
      const forbidden = ['Write', 'Edit', 'Bash'];
      const found = forbidden.filter((f) => agent.tools.includes(f));
      if (found.length > 0) {
        addFinding(
          'error',
          'AGENT_READ_ONLY_TOOL_VIOLATION',
          `${name} marked read-only but has mutable tools: ${found.join(', ')}`,
          agent.filePath
        );
      }
    }
  });
}

function extractSkillsFromProcessRule(rulePath) {
  const content = readFileSafe(rulePath) || '';
  const explicit = new Set();
  const skillCallRegex = /Skill\("([a-z0-9-]+)"\)/g;
  let match = null;
  while ((match = skillCallRegex.exec(content)) !== null) {
    explicit.add(match[1]);
  }
  return explicit;
}

function getLocalSkillDirs() {
  if (!fs.existsSync(SKILLS_DIR)) {
    return [];
  }
  return fs
    .readdirSync(SKILLS_DIR)
    .filter((name) => fs.existsSync(path.join(SKILLS_DIR, name, 'SKILL.md')))
    .sort();
}

function checkSkillConsistency() {
  const processRulePath = path.join(CLAUDE_DIR, 'rules', '03-development-process.md');
  const requiredByRule = extractSkillsFromProcessRule(processRulePath);
  const localSkillDirs = new Set(getLocalSkillDirs());
  const externalAllowed = new Set(['enhance-prompt', 'stitch-loop', 'design-md', 'shadcn-ui', 'ui-ux-pro-max']);

  requiredByRule.forEach((skillName) => {
    if (!localSkillDirs.has(skillName) && !externalAllowed.has(skillName)) {
      addFinding(
        'error',
        'SKILL_REQUIRED_NOT_FOUND',
        `Required by process rule but not found locally/external allowlist: ${skillName}`,
        processRulePath
      );
    }
  });

  const cfgPath = path.join(SKILLS_DIR, 'framework-skills.json');
  const raw = readFileSafe(cfgPath);
  if (!raw) {
    addFinding('error', 'SKILL_CONFIG_MISSING', 'framework-skills.json not found', cfgPath);
    return;
  }
  let cfg = null;
  try {
    cfg = JSON.parse(raw);
  } catch (e) {
    addFinding('error', 'SKILL_CONFIG_INVALID_JSON', `Invalid JSON: ${e.message}`, cfgPath);
    return;
  }

  const workflowSkills = cfg.skills?.workflowSkills || {};
  Object.keys(workflowSkills).forEach((name) => {
    if (!localSkillDirs.has(name)) {
      addFinding('warning', 'SKILL_WORKFLOW_MISSING_LOCAL_DIR', `workflowSkills key has no local skill dir: ${name}`, cfgPath);
    }
  });

  localSkillDirs.forEach((name) => {
    if (!Object.prototype.hasOwnProperty.call(workflowSkills, name)) {
      addFinding('warning', 'SKILL_LOCAL_NOT_REGISTERED', `Local skill dir not listed in workflowSkills: ${name}`, cfgPath);
    }
  });
}

function checkRulesAndScripts() {
  const fileConventions = path.join(CLAUDE_DIR, 'rules', '06-file-conventions.md');
  const e2eTest = path.join(CLAUDE_DIR, 'scripts', 'e2e-test.js');
  const fcContent = readFileSafe(fileConventions) || '';
  const e2eContent = readFileSafe(e2eTest) || '';

  if (/"version":\s*"2\.0"/.test(fcContent)) {
    addFinding(
      'warning',
      'TASK_SCHEMA_V2_SAMPLE',
      'File conventions still contains v2 tasks.json sample; framework appears to use v3 status object',
      fileConventions
    );
  }

  if (/\.passes\s*===\s*false|\.passes\s*===\s*true|Current passes:\s*\$\{feature\.passes\}/.test(e2eContent)) {
    addFinding(
      'warning',
      'SCRIPT_USES_LEGACY_PASSES',
      'e2e-test.js still reads feature.passes directly; consider status.passes for v3',
      e2eTest
    );
  }
}

function checkTaskIdNamingConvention() {
  const raw = readFileSafe(TASKS_JSON_PATH);
  if (!raw) {
    addFinding('warning', 'TASKS_JSON_MISSING', 'tasks.json not found; skip task id naming check', TASKS_JSON_PATH);
    return;
  }

  let data = null;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    addFinding('error', 'TASKS_JSON_INVALID_JSON', `Invalid JSON: ${error.message}`, TASKS_JSON_PATH);
    return;
  }

  const features = Array.isArray(data.features) ? data.features : [];
  const allowedPhaseSymbols = new Set(['p1r', 'p1b', 'p2p', 'p25d', 'p3a', 'p4b', 'p5d', 'p6t', 'p7d', 'p8m']);
  const idRegex = /^(inital|imac-[a-z0-9-]+)-(p1r|p1b|p2p|p25d|p3a|p4b|p5d|p6t|p7d|p8m)-\d{3}$/;

  features.forEach((feature) => {
    const id = feature?.id;
    if (typeof id !== 'string' || id.length === 0) {
      addFinding('error', 'TASK_ID_MISSING', 'Feature id is missing or not a string', TASKS_JSON_PATH);
      return;
    }

    if (!idRegex.test(id)) {
      addFinding(
        'error',
        'TASK_ID_INVALID_FORMAT',
        `Feature id does not match {iteration}-{phaseSymbol}-{NNN}: ${id}`,
        TASKS_JSON_PATH
      );
      return;
    }

    const parts = id.split('-');
    const phaseSymbol = parts.length >= 3 ? parts[parts.length - 2] : '';
    if (!allowedPhaseSymbols.has(phaseSymbol)) {
      addFinding(
        'error',
        'TASK_ID_INVALID_PHASE_SYMBOL',
        `Feature id uses unsupported phase symbol: ${id}`,
        TASKS_JSON_PATH
      );
    }
  });
}

function checkPhaseManifestPolicy() {
  const requiredAlwaysOnFiles = new Set([
    '.claude/rules/04-agent-teams.md',
    '.claude/agents/_base/team-lead-base.md'
  ]);
  const raw = readFileSafe(PHASE_MANIFEST_PATH);
  if (!raw) {
    addFinding('error', 'CONTEXT_MANIFEST_MISSING', 'phase-manifest.json not found', PHASE_MANIFEST_PATH);
    return;
  }
  let manifest = null;
  try {
    manifest = JSON.parse(raw);
  } catch (error) {
    addFinding('error', 'CONTEXT_MANIFEST_INVALID_JSON', `Invalid JSON: ${error.message}`, PHASE_MANIFEST_PATH);
    return;
  }
  const alwaysOnFiles = manifest?.always_on_context?.files;
  if (!Array.isArray(alwaysOnFiles)) {
    addFinding('error', 'CONTEXT_ALWAYS_ON_MISSING', 'always_on_context.files must be an array', PHASE_MANIFEST_PATH);
    return;
  }
  const normalized = new Set(alwaysOnFiles.map((value) => normalizeFilePath(value)));
  requiredAlwaysOnFiles.forEach((requiredPath) => {
    if (!normalized.has(requiredPath)) {
      addFinding(
        'error',
        'CONTEXT_ALWAYS_ON_TEAM_LEAD_MISSING',
        `always_on_context.files must include: ${requiredPath}`,
        PHASE_MANIFEST_PATH
      );
    }
  });
}

function runChecks() {
  const agentFiles = walkFiles(AGENTS_DIR, '.md').filter((filePath) => !filePath.endsWith('AGENTS.md') && !filePath.includes(`${path.sep}_base${path.sep}`));
  const agentMap = checkAgentFrontmatter(agentFiles);
  const summaryMap = parseAgentsSummary(path.join(AGENTS_DIR, 'AGENTS.md'));
  checkAgentConsistency(agentMap, summaryMap);
  checkSkillConsistency();
  checkRulesAndScripts();
  checkTaskIdNamingConvention();
  checkPhaseManifestPolicy();
}

function applyBaseline(rawFindings, baseline) {
  if (!baseline.enabled) {
    return { activeFindings: rawFindings, suppressedCount: 0 };
  }
  const activeFindings = rawFindings.filter((f) => !baseline.signatures.has(findingSignature(f)));
  const suppressedCount = rawFindings.length - activeFindings.length;
  return { activeFindings, suppressedCount };
}

function printTextReport(activeFindings, meta) {
  const errors = activeFindings.filter((f) => f.severity === 'error');
  const warnings = activeFindings.filter((f) => f.severity === 'warning');

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║        Auto-Coding Framework - Policy Consistency         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (activeFindings.length === 0) {
    console.log('✅ No policy issues found.\n');
    if (meta.suppressedCount > 0) {
      console.log(`Suppressed by baseline: ${meta.suppressedCount}`);
      console.log(`Baseline: ${meta.baselinePath}\n`);
    }
    return;
  }

  activeFindings.forEach((f, idx) => {
    const icon = f.severity === 'error' ? '❌' : '⚠️ ';
    console.log(`${idx + 1}. ${icon} [${f.code}] ${f.message}`);
    if (f.file) {
      console.log(`   File: ${f.file}`);
    }
  });

  console.log('\n' + '─'.repeat(60));
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);
  console.log(`Suppressed: ${meta.suppressedCount}`);
  console.log(`Mode: ${strictMode ? 'strict' : 'advisory'}`);
  if (meta.baselinePath) {
    console.log(`Baseline: ${meta.baselinePath}`);
  }
  console.log('─'.repeat(60) + '\n');
}

function printJsonReport(activeFindings, meta) {
  const errors = activeFindings.filter((f) => f.severity === 'error');
  const warnings = activeFindings.filter((f) => f.severity === 'warning');
  const report = {
    summary: {
      errors: errors.length,
      warnings: warnings.length,
      suppressed: meta.suppressedCount,
      mode: strictMode ? 'strict' : 'advisory',
      baseline: meta.baselinePath || null,
      baselineWritten: meta.baselineWritten || null
    },
    findings: activeFindings
  };
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

function toSarifLevel(severity) {
  return severity === 'error' ? 'error' : 'warning';
}

function buildSarifReport(activeFindings, meta) {
  const uniqueRuleIds = [...new Set(activeFindings.map((f) => f.code))];
  const rules = uniqueRuleIds.map((code) => ({
    id: code,
    name: code,
    shortDescription: { text: code }
  }));

  const results = activeFindings.map((f) => {
    const result = {
      ruleId: f.code,
      level: toSarifLevel(f.severity),
      message: { text: f.message }
    };
    if (f.file) {
      result.locations = [{
        physicalLocation: {
          artifactLocation: {
            uri: f.file
          }
        }
      }];
    }
    return result;
  });

  return {
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'auto-coding-policy-check',
            informationUri: 'https://example.local/auto-coding-policy-check',
            rules
          }
        },
        invocations: [
          {
            executionSuccessful: true,
            properties: {
              mode: strictMode ? 'strict' : 'advisory',
              suppressed: meta.suppressedCount,
              baseline: meta.baselinePath || null
            }
          }
        ],
        results
      }
    ]
  };
}

function printSarifReport(activeFindings, meta) {
  const sarif = buildSarifReport(activeFindings, meta);
  const content = `${JSON.stringify(sarif, null, 2)}\n`;
  if (sarifOutputPath) {
    fs.mkdirSync(path.dirname(sarifOutputPath), { recursive: true });
    fs.writeFileSync(sarifOutputPath, content, 'utf8');
  } else {
    process.stdout.write(content);
  }
}

function main() {
  runChecks();
  let baselineWritten = null;

  if (writeBaseline) {
    baselineWritten = writeBaselineFile(baselinePath, findings);
    if (!jsonMode) {
      console.log(`Wrote baseline file: ${baselineWritten}`);
    }
  }

  const baseline = noBaseline
    ? { enabled: false, signatures: new Set(), path: null, error: null }
    : loadBaseline(baselinePath);
  if (baseline.error) {
    addFinding('warning', 'BASELINE_PARSE_FAILED', `Cannot parse baseline file: ${baseline.error}`, baseline.path);
  }
  const { activeFindings, suppressedCount } = applyBaseline(findings, baseline);
  const meta = {
    suppressedCount,
    baselinePath: baseline.enabled ? normalizeFilePath(baseline.path) : null,
    baselineWritten: baselineWritten ? normalizeFilePath(baselineWritten) : null
  };

  if (sarifMode) {
    printSarifReport(activeFindings, meta);
  } else if (jsonMode) {
    printJsonReport(activeFindings, meta);
  } else {
    printTextReport(activeFindings, meta);
  }

  if (sarifMode && sarifOutputPath) {
    process.stdout.write(`Wrote SARIF file: ${normalizeFilePath(sarifOutputPath)}\n`);
  }

  const hasErrors = activeFindings.some((f) => f.severity === 'error');
  if (strictMode && hasErrors) {
    process.exit(1);
  }
  process.exit(0);
}

main();
