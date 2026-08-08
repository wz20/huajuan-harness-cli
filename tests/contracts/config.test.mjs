import assert from 'node:assert/strict';
import test from 'node:test';
import { importCli } from '../helpers/workspace.mjs';

test('default workspace config guards the runtime while allowing explicit Harness customization', async () => {
  const cli = await importCli();
  const config = cli.defaultWorkspaceConfig('/tmp/知识库');
  assert.equal(config.schema, 'huajuan-workspace/v4');
  assert.equal(config.safety.coreIntegrity, 'guarded');
  assert.equal(config.safety.harnessCustomization, 'explicit-user-request');
  assert.equal(config.safety.protectedPathPolicy, 'read-only');
  assert.equal(config.safety.highRiskOperations, 'confirm');
  assert.equal(config.knowledge.relationPolicy, 'explicit-only');
  assert.equal(config.knowledge.unknownPlacement, 'agent-propose');
  assert.equal(config.knowledge.readiness, 'blocked');
  assert.equal(config.knowledge.contract, 'huajuan-knowledge-contract/v1');
  assert.equal(config.evolution.enabled, true);
  assert.equal(config.evolution.autoCapture, true);
  assert.equal(config.evolution.autoApply, false);
  assert.equal(config.evolution.retirement, 'proposal-only');
  assert.equal(config.evolution.deletion, 'never-auto');
});

test('initialization accepts only approved answer fields and forces unsafe values off', async () => {
  const cli = await importCli();
  const workspaceRoot = '/tmp/知识库 空间';
  const config = cli.applyAnswers(cli.defaultWorkspaceConfig(workspaceRoot), {
    ownerName: 'Ze',
    workspaceName: '花卷知识库',
    mode: 'hybrid',
    agents: ['codex', 'trae', 'workbuddy'],
    protectedPaths: ['Private'],
    evolutionEnabled: false,
    notes: '先给方案，再动手。',
    autoApply: true,
    fileOperations: { delete: 'allow' },
  }, workspaceRoot, { fileCount: 0, topLevel: [] });

  assert.equal(config.workspace.notes, '先给方案，再动手。');
  assert.equal(config.workspace.emptyAtInit, true);
  assert.deepEqual(config.agents, ['codex', 'trae', 'workbuddy']);
  assert.deepEqual(config.safety.protectedPaths, ['Private']);
  assert.equal(config.evolution.enabled, false);
  assert.equal(config.evolution.autoCapture, false);
  assert.equal(config.evolution.autoApply, false);
  assert.equal(config.evolution.deletion, 'never-auto');
  assert.equal(config.safety.highRiskOperations, 'confirm');
  assert.equal(config.safety.operations, undefined);
});

test('v2 and v3 configuration migrate to v4 without enabling auto-apply', async () => {
  const cli = await importCli();
  assert.equal(typeof cli.migrateWorkspaceConfig, 'function');
  const migrated = cli.migrateWorkspaceConfig({
    schema: 'huajuan-workspace/v2',
    mode: 'workspace',
    owner: { name: 'Ze' },
    workspace: { name: '旧工作区' },
    agents: ['Codex'],
    safety: { protectedPaths: ['.git'] },
    evolution: { autoApply: true },
  }, '/tmp/旧工作区');
  assert.equal(migrated.schema, 'huajuan-workspace/v4');
  assert.deepEqual(migrated.agents, ['codex']);
  assert.equal(migrated.evolution.autoApply, false);
  assert.equal(migrated.safety.coreIntegrity, 'guarded');
  assert.equal(migrated.safety.harnessCustomization, 'explicit-user-request');
  assert.equal(migrated.knowledge.readiness, 'blocked');
});
