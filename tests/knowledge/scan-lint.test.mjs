import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {
  assertCommandSucceeded,
  createWorkspaceFixture,
  runCli,
} from '../helpers/workspace.mjs';
import { writeConfirmedKnowledgeContracts } from './readiness.test.mjs';

function knowledgeDocument({ id, title, tags = ['ai-video'], links = '' }) {
  return `---
id: ${id}
title: ${title}
type: concept
status: active
category: ai-assets
tags: [${tags.join(', ')}]
sources: [user-original]
created_at: 2026-08-08
updated_at: 2026-08-08
---
# ${title}

${links}
`;
}

test('knowledge scan writes a deterministic inventory outside Harness and protected runtime files', async t => {
  const fixture = await createWorkspaceFixture({ files: {
    'Knowledge/角色一致性.md': knowledgeDocument({ id: 'character-consistency', title: '角色一致性' }),
    'Knowledge/参考图.png': 'fake-image-bytes',
    'Sources/新闻.md': '# 原始新闻\n',
  } });
  t.after(fixture.cleanup);
  await writeConfirmedKnowledgeContracts(path.join(fixture.workspace, '.harness'));

  const result = await runCli(fixture.workspace, ['knowledge', 'scan', '--json']);
  assertCommandSucceeded(result);
  const output = JSON.parse(result.stdout);
  assert.equal(output.schema, 'huajuan-inventory/v1');
  assert.deepEqual(output.items.map(item => item.path), [
    'Knowledge/参考图.png',
    'Knowledge/角色一致性.md',
    'Sources/新闻.md',
  ]);
  assert.ok(output.items.every(item => /^[a-f0-9]{64}$/.test(item.sha256)));
  assert.ok(output.items.every(item => !item.path.startsWith('.harness/')));
  assert.equal(output.summary.files, 3);

  const saved = JSON.parse(await readFile(path.join(fixture.workspace, '.harness', 'state', 'inventory.json'), 'utf8'));
  assert.deepEqual(saved.items, output.items);
});

test('knowledge lint catches taxonomy, Obsidian link, and Sidecar violations then passes after repair', async t => {
  const fixture = await createWorkspaceFixture({ files: {
    'Knowledge/角色一致性.md': knowledgeDocument({
      id: 'character-consistency',
      title: '角色一致性',
      tags: ['未知标签'],
      links: '参考 [[不存在的知识]]。',
    }),
    'Knowledge/参考图.png': 'fake-image-bytes',
    'Sources/新闻.md': '# 原始新闻\n',
  } });
  t.after(fixture.cleanup);
  const harnessRoot = path.join(fixture.workspace, '.harness');
  await writeConfirmedKnowledgeContracts(harnessRoot);

  const failed = await runCli(fixture.workspace, ['knowledge', 'lint', '--json']);
  assert.notEqual(failed.exitCode, 0);
  const failedReport = JSON.parse(failed.stdout);
  assert.equal(failedReport.ok, false);
  const ids = new Set(failedReport.issues.map(issue => issue.id));
  assert.ok(ids.has('knowledge-unknown-tag'));
  assert.ok(ids.has('knowledge-broken-wikilink'));
  assert.ok(ids.has('knowledge-sidecar-missing'));
  assert.ok(ids.has('knowledge-index-missing'));
  assert.ok(ids.has('knowledge-frontmatter-missing'));

  await writeFile(path.join(fixture.workspace, 'Knowledge', '角色一致性.md'), knowledgeDocument({
    id: 'character-consistency', title: '角色一致性', tags: ['ai-video'], links: '',
  }), 'utf8');
  await writeFile(path.join(fixture.workspace, 'Knowledge', '参考图.png.huajuan.md'), `---
id: asset-reference-image
title: 参考图
type: asset
status: active
category: ai-assets
tags: [ai-video]
sources: [参考图.png]
created_at: 2026-08-08
updated_at: 2026-08-08
---
# 参考图

## 素材说明

AI 视频角色参考图。

## 来源与授权

用户提供。

## 相关知识

[[角色一致性]]
`, 'utf8');
  await writeFile(path.join(fixture.workspace, 'Knowledge', '_index.md'), knowledgeDocument({
    id: 'knowledge-index', title: '知识索引', tags: ['ai-video'], links: '[[角色一致性]]',
  }), 'utf8');
  await writeFile(path.join(fixture.workspace, 'Sources', '新闻.md'), `---
id: source-news
title: 原始新闻
type: source
status: active
category: ai-assets
tags: [ai-video]
sources: [user-original]
created_at: 2026-08-08
updated_at: 2026-08-08
---
# 原始新闻
`, 'utf8');

  const passed = await runCli(fixture.workspace, ['knowledge', 'lint', '--json']);
  assertCommandSucceeded(passed);
  const passedReport = JSON.parse(passed.stdout);
  assert.equal(passedReport.ok, true);
  assert.equal(passedReport.counts.error, 0);
  assert.ok(passedReport.metrics.frontmatterCoverage >= 1);
  assert.equal(passedReport.metrics.brokenLinks, 0);

  const quality = JSON.parse(await readFile(path.join(harnessRoot, 'state', 'quality-report.json'), 'utf8'));
  assert.equal(quality.ok, true);
});
