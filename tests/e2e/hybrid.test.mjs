import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { assertCommandSucceeded, createWorkspaceFixture, runCli } from '../helpers/workspace.mjs';

test('hybrid flow supports an initially empty Chinese workspace and emits the direct Agent handoff', async t => {
  const fixture = await createWorkspaceFixture({ workspaceName: '空白 混合空间' });
  t.after(fixture.cleanup);
  const answers = path.join(fixture.parent, 'hybrid-answers.json');
  await writeFile(answers, JSON.stringify({
    ownerName: 'Ze', workspaceName: '项目与知识', mode: 'hybrid', agents: ['codex'],
    protectedPaths: [], evolutionEnabled: true, notes: '只沉淀可复用经验。',
  }));
  const init = await runCli(fixture.workspace, ['init', '--answers', answers]);
  assertCommandSucceeded(init);
  assert.match(init.stdout, /复制下面这段话给你的 Agent/);
  assert.match(init.stdout, /不得自动应用任何 Proposal/);
  const workspace = await readFile(path.join(fixture.workspace, '.harness', 'WORKSPACE.md'), 'utf8');
  const agentInit = await readFile(path.join(fixture.workspace, '.harness', 'AGENT_INIT.md'), 'utf8');
  assert.match(workspace, /"emptyAtInit": true/);
  assert.match(agentInit, /连接项目工作与长期知识|项目工作与长期知识/);
  assert.match(agentInit, /只沉淀可复用经验/);
  const prompt = await runCli(fixture.workspace, ['prompt']);
  assertCommandSucceeded(prompt);
  assert.match(prompt.stdout, /区分项目内容与长期知识/);
  assertCommandSucceeded(await runCli(fixture.workspace, ['doctor']));
});
