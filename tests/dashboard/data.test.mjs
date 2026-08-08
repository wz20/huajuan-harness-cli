import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { createWorkspaceFixture, importCli } from '../helpers/workspace.mjs';

test('dashboard data separates system/user assets and exposes safe actionable prompts', async t => {
  const fixture = await createWorkspaceFixture({ files: {
    '笔记.md': '# 笔记\n\n[[来源]]\n',
    '来源.md': '# 来源\n',
  } });
  t.after(fixture.cleanup);
  const harness = path.join(fixture.workspace, '.harness');
  await mkdir(path.join(harness, 'skills', 'user', 'writing'), { recursive: true });
  await writeFile(path.join(harness, 'skills', 'user', 'writing', 'SKILL.md'), '---\nid: user.writing\nname: 写作\nscope: user\nstatus: active\n---\n# 写作\n');
  await writeFile(path.join(harness, 'evolution', 'proposals', 'p1.md'), '---\nid: proposal.p1\nname: 合并写作规则\ntype: merge\nscope: user\nstatus: proposed\n---\n# Proposal\n');
  await writeFile(path.join(harness, 'mcp', 'servers', 'docs.json'), JSON.stringify({
    schema: 'huajuan-mcp-server/v1', id: 'workspace.docs', name: 'Docs', status: 'candidate',
    transport: 'stdio', purpose: '读取文档', command: 'docs-mcp', args: [], capabilities: [],
    dataBoundaries: { reads: ['.'], writes: [], externalDestinations: [] }, secrets: 'external-only', requiresApproval: true,
  }, null, 2));

  const cli = await importCli();
  assert.equal(typeof cli.buildDashboardData, 'function');
  const context = await cli.validateWorkspace(fixture.workspace);
  const data = await cli.buildDashboardData(context);
  assert.equal(Object.hasOwn(data.workspace, 'root'), false);
  assert.equal(Object.hasOwn(data.config.workspace, 'path'), false);
  assert.equal(data.counts.systemSkills, 7);
  assert.equal(data.counts.systemWorkflows, 5);
  assert.equal(data.counts.userSkills, 1);
  assert.equal(data.counts.mcpServers, 1);
  assert.ok(data.lifecycle.candidate >= 1);
  assert.ok(data.lifecycle.proposed >= 1);
  assert.ok(data.lifecycle.active >= 1);
  assert.ok(data.recentActivity.length >= 1);
  assert.ok(data.assets.some(item => item.kind === 'mcp-server'));
  assert.ok(data.prompts.initialize.includes('AGENT_INIT.md'));
  assert.ok(data.prompts.doctorRepair.includes('Doctor'));
  assert.ok(data.prompts.proposalReview.includes('Proposal'));
  assert.equal(data.knowledge.readiness.status, 'blocked');
  assert.equal(data.knowledge.readiness.gates.length, 6);
  assert.ok(data.prompts.knowledgeReview.includes('knowledge lint'));
  assert.ok(data.prompts.conversationDistill.includes('沉淀'));
  assert.ok(data.commands.some(item => item.command.endsWith('knowledge status')));
  assert.ok(data.commands.some(item => item.command.endsWith('knowledge scan')));
  assert.ok(data.commands.some(item => item.command.endsWith('knowledge lint')));
  assert.ok(data.commands.every(item => item.command.startsWith('node .harness/.huajuan.mjs')));
  assert.ok(data.commands.every(item => !item.command.includes('--workspace')));
  assert.ok(data.commands.every(item => !item.command.includes(fixture.workspace)));
});
