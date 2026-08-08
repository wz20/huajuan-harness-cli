import assert from 'node:assert/strict';
import test from 'node:test';
import { importCli } from '../helpers/workspace.mjs';

const dashboardData = {
  product: 'huajuan-harness', version: '0.6.0', generatedAt: '2026-08-07T00:00:00.000Z',
  workspace: { name: '花卷知识库', mode: 'hybrid', modeLabel: '连接项目工作与长期知识', status: 'awaiting-agent', owner: 'Ze', notes: '' },
  counts: { relations: 1, unresolved: 0, userAssets: 2, systemAssets: 15, proposals: 1, doctorIssues: 0, mcpServers: 0 },
  lifecycle: { candidate: 1, active: 1, deprecated: 0, proposed: 1, applied: 0, rejected: 0 },
  assets: [{ id: 'a', name: '写作', path: '.harness/skills/user/a/SKILL.md', kind: 'skill', scope: 'user', status: 'active', modifiedAt: '2026-08-07T00:00:00.000Z' }],
  relations: [{ source: 'A.md', target: 'B.md', type: 'references', status: 'resolved', evidence: 'wikilink' }],
  recentActivity: [],
  doctor: { ok: true, counts: { error: 0, warning: 0, info: 0 }, categories: [], issues: [] },
  prompts: { initialize: '初始化', relationConfirm: '确认关系', doctorRepair: '修复 Doctor', proposalReview: '审阅 Proposal' },
  commands: [{ id: 'doctor', label: '运行 Doctor', command: 'node .harness/.huajuan.mjs doctor' }],
  knowledge: {
    readiness: { status: 'blocked', ready: false, gates: [{ id: 'taxonomy', file: 'TAXONOMY.md', status: 'awaiting-confirmation', issues: ['尚未确认'] }] },
    quality: null,
    inventory: null,
  },
};

test('dashboard HTML contains six functional views, filters, detail panels, copy actions, and export', async () => {
  const cli = await importCli();
  const html = cli.renderDashboardHtml(dashboardData);
  for (const view of ['overview', 'knowledge', 'relations', 'assets', 'evolution', 'doctor']) {
    assert.match(html, new RegExp(`data-view-target="${view}"`));
    assert.match(html, new RegExp(`data-view="${view}"`));
  }
  assert.match(html, /data-role="relation-search"/);
  assert.match(html, /data-role="relation-status-filter"/);
  assert.match(html, /data-role="asset-search"/);
  assert.match(html, /data-role="detail-panel"/);
  assert.match(html, /data-action="copy-init"/);
  assert.match(html, /data-action="copy-doctor-repair"/);
  assert.match(html, /data-action="open-command-drawer"/);
  assert.match(html, /data-action="export-snapshot"/);
  assert.match(html, /data-action="copy-proposal-review"/);
  assert.match(html, /运行内核已保护/);
  assert.match(html, /知识库门禁/);
  assert.match(html, /TAXONOMY\.md/);
});

test('dashboard remains offline and cannot execute shell or persist hidden browser state', async () => {
  const cli = await importCli();
  const html = cli.renderDashboardHtml(dashboardData);
  assert.doesNotMatch(html, /fetch\s*\(|https?:\/\//i);
  assert.doesNotMatch(html, /localStorage|sessionStorage|WebSocket|EventSource/);
  assert.doesNotMatch(html, /child_process|exec\s*\(|spawn\s*\(/);
  assert.doesNotMatch(html, /--workspace/);
});
