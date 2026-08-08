import assert from 'node:assert/strict';
import test from 'node:test';
import { importCli } from '../helpers/workspace.mjs';

test('wizard flow maps six focused answers into the approved answer schema', async () => {
  const cli = await importCli();
  assert.equal(typeof cli.collectWizardAnswers, 'function');
  const model = cli.buildWizardModel({
    topLevel: [{ name: 'Private', type: 'directory' }],
    fileCount: 2,
  }, cli.defaultWorkspaceConfig('/tmp/知识库'));
  const driver = {
    identity: async () => ({ ownerName: 'Ze', workspaceName: '花卷库' }),
    select: async stage => stage.id === 'purpose' ? 'hybrid' : true,
    multiSelect: async () => ['codex', 'trae', 'workbuddy'],
    pathMultiSelect: async () => ['Private'],
    notes: async () => '先扫描，再给方案。',
    confirm: async () => 'start',
  };
  const answers = await cli.collectWizardAnswers(model, driver);
  assert.deepEqual(answers, {
    ownerName: 'Ze',
    workspaceName: '花卷库',
    mode: 'hybrid',
    agents: ['codex', 'trae', 'workbuddy'],
    protectedPaths: ['Private'],
    evolutionEnabled: true,
    notes: '先扫描，再给方案。',
  });
  assert.deepEqual(Object.keys(answers), [
    'ownerName', 'workspaceName', 'mode', 'agents', 'protectedPaths', 'evolutionEnabled', 'notes',
  ]);
});

test('revisiting the Agent step hydrates the latest WorkBuddy selection', async () => {
  const cli = await importCli();
  assert.equal(typeof cli.hydrateWizardStage, 'function');
  const model = cli.buildWizardModel({ topLevel: [], fileCount: 0 }, cli.defaultWorkspaceConfig('/tmp/工作区'));
  const stage = model.stages.find(item => item.id === 'agents');
  const hydrated = cli.hydrateWizardStage(stage, { agents: ['workbuddy'] });
  assert.deepEqual(hydrated.defaultValues, ['workbuddy']);
});

test('wizard flow returns to the previous stage without losing earlier answers', async () => {
  const cli = await importCli();
  const model = cli.buildWizardModel({ topLevel: [], fileCount: 0 }, cli.defaultWorkspaceConfig('/tmp/空目录'));
  let evolutionVisits = 0;
  let notesVisits = 0;
  const driver = {
    identity: async () => ({ ownerName: 'Ze', workspaceName: '空目录' }),
    select: async stage => {
      if (stage.id === 'purpose') return 'knowledge-base';
      evolutionVisits += 1;
      return evolutionVisits === 1 ? true : false;
    },
    multiSelect: async () => ['generic'],
    pathMultiSelect: async () => [],
    notes: async () => {
      notesVisits += 1;
      return notesVisits === 1 ? Symbol.for('back') : '';
    },
    confirm: async () => 'start',
  };
  const answers = await cli.collectWizardAnswers(model, driver);
  assert.equal(evolutionVisits, 2);
  assert.equal(answers.evolutionEnabled, false);
  assert.equal(answers.notes, '');
  assert.equal(answers.workspaceName, '空目录');
});

test('summary can return to notes before final initialization', async () => {
  const cli = await importCli();
  const model = cli.buildWizardModel({ topLevel: [], fileCount: 0 }, cli.defaultWorkspaceConfig('/tmp/空目录'));
  let confirmations = 0;
  let note = '第一版';
  const driver = {
    identity: async () => ({ ownerName: 'Ze', workspaceName: '空目录' }),
    select: async stage => stage.id === 'purpose' ? 'workspace' : true,
    multiSelect: async () => ['codex'],
    pathMultiSelect: async () => [],
    notes: async () => note,
    confirm: async () => {
      confirmations += 1;
      if (confirmations === 1) {
        note = '最终备注';
        return 'back';
      }
      return 'start';
    },
  };
  const answers = await cli.collectWizardAnswers(model, driver);
  assert.equal(confirmations, 2);
  assert.equal(answers.notes, '最终备注');
});
