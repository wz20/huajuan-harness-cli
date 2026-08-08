import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {
  assertCommandSucceeded,
  createWorkspaceFixture,
  importCli,
  runCli,
} from '../helpers/workspace.mjs';
import { writeConfirmedKnowledgeContracts } from '../knowledge/readiness.test.mjs';

test('answer-file initialization configures an otherwise empty Chinese workspace', async t => {
  const fixture = await createWorkspaceFixture({ workspaceName: '我的 知识库' });
  t.after(fixture.cleanup);
  const answerFile = path.join(fixture.parent, 'answers.json');
  await writeFile(answerFile, JSON.stringify({
    ownerName: 'Ze',
    workspaceName: '我的花卷知识库',
    mode: 'knowledge-base',
    agents: ['claude-code', 'codex', 'trae', 'workbuddy'],
    protectedPaths: [],
    evolutionEnabled: true,
    notes: '所有结构变化都先给我看方案。',
  }), 'utf8');

  const result = await runCli(fixture.workspace, ['init', '--answers', answerFile]);
  assertCommandSucceeded(result);
  const workspaceMarkdown = await readFile(path.join(fixture.workspace, '.harness', 'WORKSPACE.md'), 'utf8');
  const agentInit = await readFile(path.join(fixture.workspace, '.harness', 'AGENT_INIT.md'), 'utf8');
  const cli = await importCli();
  const config = cli.parseWorkspaceConfig(workspaceMarkdown, fixture.workspace);

  assert.equal(config.schema, 'huajuan-workspace/v4');
  assert.equal(config.workspace.emptyAtInit, true);
  assert.equal(config.workspace.notes, '所有结构变化都先给我看方案。');
  assert.deepEqual(config.agents, ['claude-code', 'codex', 'trae', 'workbuddy']);
  assert.equal(config.evolution.enabled, true);
  assert.equal(config.evolution.autoApply, false);
  assert.match(agentInit, /\.harness\/SYSTEM_PROMPT\.md/);
  assert.match(agentInit, /workspace-bootstrap/);
  assert.match(agentInit, /\.harness\/agents\/codex\.md/);
  assert.match(agentInit, /\.harness\/agents\/workbuddy\.md/);
  assert.match(agentInit, /\.harness\/STRUCTURE\.md/);
  assert.match(agentInit, /KNOWLEDGE_PROFILE\.md/);
  assert.match(agentInit, /TAXONOMY\.md/);
  assert.match(agentInit, /CONTENT_SCHEMA\.md/);
  assert.match(agentInit, /REFERENCE_RULES\.md/);
  assert.match(agentInit, /LIFECYCLE\.md/);
  assert.match(agentInit, /READY 前.*不得.*正式知识|未进入 READY/);
  assert.match(agentInit, /Obsidian/);
  assert.match(agentInit, /对话沉淀/);
  assert.match(agentInit, /定时入库/);
  assert.match(agentInit, /多轮(?:初始化|建库)/);
  assert.match(agentInit, /用户.*确认|与用户确认/);
  assert.match(agentInit, /沉淀/);
  assert.match(agentInit, /当前目录在初始化时没有用户内容/);
  assert.match(agentInit, /所有结构变化都先给我看方案/);
  assert.match(result.stdout, /复制下面这段话给你的 Agent/);
  assert.match(result.stdout, /请为当前目录构建 Huajuan Harness 知识工作区/);
  assert.doesNotMatch(result.stdout, /--workspace/);

  const promptResult = await runCli(fixture.workspace, ['prompt']);
  assertCommandSucceeded(promptResult);
  assert.match(promptResult.stdout, /WorkBuddy 适配已加载/);
  assert.match(promptResult.stdout, /agents\/workbuddy\.md/);
});

test('disabled evolution is reflected in both configuration and Agent task', async t => {
  const fixture = await createWorkspaceFixture();
  t.after(fixture.cleanup);
  const answerFile = path.join(fixture.parent, 'answers-off.json');
  await writeFile(answerFile, JSON.stringify({
    ownerName: 'Ze',
    workspaceName: '项目工作区',
    mode: 'workspace',
    agents: ['cursor'],
    protectedPaths: ['Private'],
    evolutionEnabled: false,
    notes: '',
  }), 'utf8');
  const result = await runCli(fixture.workspace, ['init', '--answers', answerFile]);
  assertCommandSucceeded(result);
  const workspaceMarkdown = await readFile(path.join(fixture.workspace, '.harness', 'WORKSPACE.md'), 'utf8');
  const agentInit = await readFile(path.join(fixture.workspace, '.harness', 'AGENT_INIT.md'), 'utf8');
  const cli = await importCli();
  const config = cli.parseWorkspaceConfig(workspaceMarkdown, fixture.workspace);
  assert.equal(config.evolution.enabled, false);
  assert.equal(config.evolution.autoCapture, false);
  assert.equal(config.evolution.proposalGeneration, false);
  assert.match(agentInit, /自动进化已关闭/);
  assert.match(agentInit, /Private/);
  assert.match(agentInit, /默认只读/);
});

test('rendered direct Agent command activates selected WorkBuddy adapter and iterative initialization', async () => {
  const cli = await importCli();
  assert.equal(typeof cli.renderAgentCommand, 'function');
  const prompt = cli.renderAgentCommand(cli.applyAnswers(cli.defaultWorkspaceConfig('/tmp/知识库'), {
    ownerName: 'Ze', workspaceName: '知识库', mode: 'hybrid', agents: ['codex', 'workbuddy'], evolutionEnabled: true,
  }, '/tmp/知识库', { fileCount: 0, topLevel: [] }));
  assert.match(prompt, /AGENT_INIT\.md/);
  assert.match(prompt, /\.harness\/CORE\.md/);
  assert.match(prompt, /\.harness\/SYSTEM_PROMPT\.md/);
  assert.match(prompt, /只读(?:扫描|观测)/);
  assert.match(prompt, /WorkBuddy/);
  assert.match(prompt, /agents\/workbuddy\.md/);
  assert.match(prompt, /多轮/);
  assert.match(prompt, /\.harness\/STRUCTURE\.md/);
  assert.match(prompt, /\.harness\/KNOWLEDGE_PROFILE\.md/);
  assert.match(prompt, /\.harness\/TAXONOMY\.md/);
  assert.match(prompt, /\.harness\/CONTENT_SCHEMA\.md/);
  assert.match(prompt, /\.harness\/REFERENCE_RULES\.md/);
  assert.match(prompt, /\.harness\/LIFECYCLE\.md/);
  assert.match(prompt, /READY/);
  assert.match(prompt, /正式知识/);
  assert.match(prompt, /明确要求优化 Harness/);
  assert.match(prompt, /不得自动应用任何 Proposal/);
  assert.ok(prompt.length < 900);
});

test('finalize closes multi-round initialization only after all knowledge contracts are confirmed', async t => {
  const fixture = await createWorkspaceFixture();
  t.after(fixture.cleanup);
  const answerFile = path.join(fixture.parent, 'answers.json');
  await writeFile(answerFile, JSON.stringify({
    ownerName: 'Ze', workspaceName: '知识库', mode: 'knowledge-base', agents: ['workbuddy'],
    protectedPaths: [], evolutionEnabled: true, notes: '',
  }), 'utf8');
  assertCommandSucceeded(await runCli(fixture.workspace, ['init', '--answers', answerFile]));

  const refused = await runCli(fixture.workspace, ['finalize', '--yes']);
  assert.notEqual(refused.exitCode, 0);
  assert.match(refused.stderr, /知识契约尚未完成|STRUCTURE\.md/);

  await writeConfirmedKnowledgeContracts(path.join(fixture.workspace, '.harness'));
  await mkdir(path.join(fixture.workspace, 'Knowledge'), { recursive: true });
  await writeFile(path.join(fixture.workspace, 'Knowledge', '_index.md'), `---
id: knowledge-index
title: 知识索引
type: index
status: active
category: ai-assets
tags: [ai-video]
sources: [user-original]
created_at: 2026-08-08
updated_at: 2026-08-08
---
# 知识索引
`, 'utf8');

  const completed = await runCli(fixture.workspace, ['finalize', '--yes']);
  assertCommandSucceeded(completed);
  assert.match(completed.stdout, /初始化闭环已完成/);
  const workspaceMarkdown = await readFile(path.join(fixture.workspace, '.harness', 'WORKSPACE.md'), 'utf8');
  const config = (await importCli()).parseWorkspaceConfig(workspaceMarkdown, fixture.workspace);
  assert.equal(config.status, 'ready');
});
