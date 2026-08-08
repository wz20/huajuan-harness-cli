import assert from 'node:assert/strict';
import test from 'node:test';
import { importCli } from '../helpers/workspace.mjs';

test('single-select reducer supports arrows, confirmation, back, and cancellation', async () => {
  const cli = await importCli();
  assert.equal(typeof cli.reduceSelectKey, 'function');
  const options = [{ value: 'a' }, { value: 'b' }, { value: 'c' }];
  assert.deepEqual(cli.reduceSelectKey({ index: 0 }, { name: 'down' }, options), { index: 1, action: null });
  assert.deepEqual(cli.reduceSelectKey({ index: 0 }, { name: 'up' }, options), { index: 2, action: null });
  assert.deepEqual(cli.reduceSelectKey({ index: 1 }, { name: 'return' }, options), { index: 1, action: 'confirm', value: 'b' });
  assert.equal(cli.reduceSelectKey({ index: 1 }, { name: 'left' }, options).action, 'back');
  assert.equal(cli.reduceSelectKey({ index: 1 }, { name: 'escape' }, options).action, 'cancel');
});

test('multi-select reducer toggles with Space and enforces a minimum selection', async () => {
  const cli = await importCli();
  assert.equal(typeof cli.reduceMultiSelectKey, 'function');
  const options = [{ value: 'claude-code' }, { value: 'codex' }, { value: 'trae' }];
  let state = { index: 1, selected: new Set(['claude-code']) };
  state = cli.reduceMultiSelectKey(state, { name: 'space' }, options, 1);
  assert.deepEqual([...state.selected], ['claude-code', 'codex']);
  assert.equal(state.action, null);
  state = cli.reduceMultiSelectKey(state, { name: 'return' }, options, 1);
  assert.equal(state.action, 'confirm');
  assert.deepEqual(state.values, ['claude-code', 'codex']);

  const only = cli.reduceMultiSelectKey({ index: 0, selected: new Set(['claude-code']) }, { name: 'space' }, options, 1);
  assert.deepEqual([...only.selected], []);
  const blocked = cli.reduceMultiSelectKey(only, { name: 'return' }, options, 1);
  assert.equal(blocked.action, 'invalid');
});

test('WorkBuddy is a real selectable value and remains visible as checked', async () => {
  const cli = await importCli();
  const options = cli.AGENT_OPTIONS;
  const workbuddyIndex = options.findIndex(option => option.value === 'workbuddy');
  assert.ok(workbuddyIndex >= 0);
  const selected = cli.reduceMultiSelectKey({ index: workbuddyIndex, selected: new Set() }, { name: 'space' }, options, 1);
  assert.deepEqual([...selected.selected], ['workbuddy']);
  const output = cli.renderQuestionFrame({
    step: 3,
    total: 6,
    title: '你主要会用哪些 Agent？',
    why: '生成适配。',
    options,
    index: workbuddyIndex,
    selected: selected.selected,
    multi: true,
  }, { color: false });
  assert.match(output, /✓ WorkBuddy/);
  assert.match(output, /已勾选 1 项：WorkBuddy/);
  assert.match(output, /高亮只是光标/);
});

test('question renderer explains why and how to choose in the approved visual language', async () => {
  const cli = await importCli();
  assert.equal(typeof cli.renderQuestionFrame, 'function');
  const output = cli.renderQuestionFrame({
    step: 2,
    total: 6,
    title: '你希望花卷怎样帮助这个目录？',
    why: '这会决定 Agent 的初始化任务、知识关系规则和 Dashboard 重点。',
    options: cli.PURPOSE_OPTIONS,
    index: 0,
    selected: null,
    multi: false,
  }, { color: false });
  assert.match(output, /花 卷\s+H A R N E S S/);
  assert.match(output, /\/\\_\/\\/);
  assert.match(output, /___\/\s+\\___/);
  assert.match(output, /初始化 · 2 \/ 6/);
  assert.match(output, /为什么要问/);
  assert.match(output, /❯.*建立并持续进化个人知识库/);
  assert.match(output, /↑↓ 选择.*Enter 确认.*Esc 取消/);
});
