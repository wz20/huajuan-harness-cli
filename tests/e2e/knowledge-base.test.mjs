import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { assertCommandSucceeded, createWorkspaceFixture, runCli } from '../helpers/workspace.mjs';
import { writeConfirmedKnowledgeContracts } from '../knowledge/readiness.test.mjs';

test('knowledge-base flow confirms contracts, reaches READY, ingests relations, and refreshes dashboard', async t => {
  const fixture = await createWorkspaceFixture({ workspaceName: 'Ze 的 知识库', files: {
    'Inbox/_index.md': '---\nid: knowledge-index\ntitle: 知识索引\ntype: index\nstatus: active\ncategory: ai-assets\ntags: [ai-video]\nsources: [user-original]\ncreated_at: 2026-08-08\nupdated_at: 2026-08-08\n---\n# 知识索引\n\n[[新笔记]]\n',
    'Inbox/新笔记.md': '---\nid: new-note\ntitle: 新笔记\ntype: concept\nstatus: active\ncategory: ai-assets\ntags: [ai-video]\nsources: [来源]\ncreated_at: 2026-08-08\nupdated_at: 2026-08-08\n---\n# 新笔记\n\n参考 [[来源]]。\n',
    'Inbox/来源.md': '---\nid: source-note\ntitle: 来源\ntype: source\nstatus: active\ncategory: ai-assets\ntags: [ai-video]\nsources: [user-original]\ncreated_at: 2026-08-08\nupdated_at: 2026-08-08\n---\n# 来源\n',
  } });
  t.after(fixture.cleanup);
  const answers = path.join(fixture.parent, 'knowledge-answers.json');
  await writeFile(answers, JSON.stringify({
    ownerName: 'Ze', workspaceName: 'Ze 的知识库', mode: 'knowledge-base',
    agents: ['claude-code', 'codex'], protectedPaths: [], evolutionEnabled: true, notes: '来源优先。',
  }));
  assertCommandSucceeded(await runCli(fixture.workspace, ['init', '--answers', answers]));
  await writeConfirmedKnowledgeContracts(path.join(fixture.workspace, '.harness'), { knowledgeRoot: 'Inbox' });
  assertCommandSucceeded(await runCli(fixture.workspace, ['finalize', '--yes']));
  const ingest = await runCli(fixture.workspace, ['ingest', 'Inbox/新笔记.md']);
  assertCommandSucceeded(ingest);
  assert.match(ingest.stdout, /关系 1/);
  const note = await readFile(path.join(fixture.workspace, 'Inbox', '新笔记.md'), 'utf8');
  assert.match(note, /HUAJUAN:RELATIONS:START/);
  assert.match(note, /status: resolved/);
  const doctor = await runCli(fixture.workspace, ['doctor']);
  assertCommandSucceeded(doctor);
  assert.match(doctor.stdout, /Doctor：0 错误/);
  assertCommandSucceeded(await runCli(fixture.workspace, ['dashboard']));
  const dashboard = await readFile(path.join(fixture.workspace, '.harness', 'dashboard.html'), 'utf8');
  assert.match(dashboard, /Ze 的知识库/);
  assert.match(dashboard, /data-view="relations"/);
});
