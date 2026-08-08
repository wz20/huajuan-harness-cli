import assert from 'node:assert/strict';
import test from 'node:test';
import { importCli } from '../helpers/workspace.mjs';

test('wizard has six focused stages and only three free-text fields', async () => {
  const cli = await importCli();
  assert.equal(typeof cli.buildWizardModel, 'function');
  const model = cli.buildWizardModel({
    topLevel: [
      { name: 'Notes', type: 'directory' },
      { name: '.git', type: 'directory' },
    ],
    fileCount: 12,
  }, cli.defaultWorkspaceConfig('/tmp/知识库'));
  assert.deepEqual(model.stages.map(stage => stage.type), [
    'identity',
    'select',
    'multi-select',
    'path-multi-select',
    'select',
    'notes',
  ]);
  assert.deepEqual(model.freeTextFields, ['ownerName', 'workspaceName', 'notes']);
  assert.equal(model.stages[1].options.length, 3);
  assert.ok(model.stages[1].options.every(option => option.description.length > 20));
  assert.deepEqual(model.stages[2].options.map(option => option.value), [
    'claude-code', 'codex', 'cursor', 'trae', 'workbuddy', 'generic',
  ]);
  assert.match(model.stages[3].why, /只读|不允许.*修改/);
  assert.match(model.stages[4].why, /Proposal|自动应用/);
});

test('empty workspace still presents a safe non-input protection stage', async () => {
  const cli = await importCli();
  const model = cli.buildWizardModel({ topLevel: [], fileCount: 0 }, cli.defaultWorkspaceConfig('/tmp/空目录'));
  const protection = model.stages[3];
  assert.equal(protection.type, 'path-multi-select');
  assert.equal(protection.empty, true);
  assert.deepEqual(protection.options, []);
  assert.match(protection.emptyMessage, /运行内核.*保护/);
});
