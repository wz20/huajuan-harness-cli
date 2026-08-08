import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { exists, PRODUCT_ROOT } from '../helpers/workspace.mjs';

const REQUIRED_V3_PATHS = [
  '.harness/SYSTEM_PROMPT.md',
  '.harness/STRUCTURE.md',
  '.harness/KNOWLEDGE_PROFILE.md',
  '.harness/TAXONOMY.md',
  '.harness/CONTENT_SCHEMA.md',
  '.harness/REFERENCE_RULES.md',
  '.harness/LIFECYCLE.md',
  '.harness/state/.keep',
  '.harness/assets/huajuan-reference.png',
  '.harness/agents/claude-code.md',
  '.harness/agents/codex.md',
  '.harness/agents/cursor.md',
  '.harness/agents/trae.md',
  '.harness/agents/workbuddy.md',
  '.harness/agents/generic.md',
  '.harness/rules/system/15-harness-integrity.md',
  '.harness/skills/system/workspace-bootstrap/SKILL.md',
  '.harness/skills/system/knowledge-ingest/SKILL.md',
  '.harness/skills/system/knowledge-bootstrap/SKILL.md',
  '.harness/skills/system/knowledge-quality/SKILL.md',
  '.harness/skills/system/knowledge-retirement/SKILL.md',
  '.harness/skills/system/memory-distillation/SKILL.md',
  '.harness/skills/system/evolution-governance/SKILL.md',
  '.harness/skills/user/.keep',
  '.harness/workflows/system/task-lifecycle.md',
  '.harness/workflows/system/memory-cycle.md',
  '.harness/workflows/system/asset-lifecycle.md',
  '.harness/workflows/system/knowledge-write.md',
  '.harness/workflows/system/knowledge-review.md',
  '.harness/workflows/user/.keep',
  '.harness/mcp/README.md',
  '.harness/mcp/servers/.keep',
  '.harness/mcp/profiles/.keep',
  '.harness/templates/RULE.md',
  '.harness/templates/SKILL.md',
  '.harness/templates/WORKFLOW.md',
  '.harness/templates/MEMORY.md',
  '.harness/templates/BAD_CASE.md',
  '.harness/templates/PROPOSAL.md',
  '.harness/templates/MCP_SERVER.json',
  '.harness/templates/KNOWLEDGE_DOCUMENT.md',
  '.harness/templates/KNOWLEDGE_SIDECAR.md',
  '花卷初始化器-macOS.command',
];

test('release template contains every fixed v4 governance surface', async () => {
  const missing = [];
  for (const relative of REQUIRED_V3_PATHS) {
    if (!(await exists(path.join(PRODUCT_ROOT, relative)))) missing.push(relative);
  }
  assert.deepEqual(missing, []);
});

test('legacy flat user skill and workflow placeholders are absent', async () => {
  assert.equal(await exists(path.join(PRODUCT_ROOT, '.harness', 'skills', '.keep')), false);
  assert.equal(await exists(path.join(PRODUCT_ROOT, '.harness', 'workflows', '.keep')), false);
});
