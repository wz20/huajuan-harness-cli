import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { assertCommandSucceeded, createWorkspaceFixture, runCli } from '../helpers/workspace.mjs';

test('workspace flow preserves structure, records protected paths, and disables evolution', async t => {
  const fixture = await createWorkspaceFixture({ files: { 'Private/不要改.md': '# 私有\n', 'src/index.js': 'export {};\n' } });
  t.after(fixture.cleanup);
  const answers = path.join(fixture.parent, 'workspace-answers.json');
  await writeFile(answers, JSON.stringify({
    ownerName: 'Ze', workspaceName: '研发工作区', mode: 'workspace', agents: ['cursor', 'trae', 'workbuddy'],
    protectedPaths: ['Private'], evolutionEnabled: false, notes: '先审阅结构。',
  }));
  assertCommandSucceeded(await runCli(fixture.workspace, ['init', '--answers', answers]));
  const privateBefore = await readFile(path.join(fixture.workspace, 'Private', '不要改.md'), 'utf8');
  const agentInit = await readFile(path.join(fixture.workspace, '.harness', 'AGENT_INIT.md'), 'utf8');
  assert.match(agentInit, /Private/);
  assert.match(agentInit, /自动进化已关闭/);
  assert.match(agentInit, /agents\/trae\.md/);
  assert.match(agentInit, /agents\/workbuddy\.md/);
  assert.equal(await readFile(path.join(fixture.workspace, 'Private', '不要改.md'), 'utf8'), privateBefore);
  const status = await runCli(fixture.workspace, ['status']);
  assertCommandSucceeded(status);
  assert.match(status.stdout, /研发工作区/);
  assertCommandSucceeded(await runCli(fixture.workspace, ['doctor']));
});
