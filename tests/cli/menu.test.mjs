import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { CLI_PATH, importCli } from '../helpers/workspace.mjs';

test('main menu exposes every command as a described selectable option', async () => {
  const cli = await importCli();
  assert.equal(typeof cli.buildCommandMenuModel, 'function');
  const menu = cli.buildCommandMenuModel({ workspace: { name: '花卷知识库' }, status: 'awaiting-agent' });
  assert.deepEqual(menu.options.map(option => option.value), [
    'init', 'finalize', 'status', 'knowledge', 'ingest', 'doctor', 'dashboard', 'prompt', 'uninstall', 'exit',
  ]);
  assert.match(menu.options.find(option => option.value === 'finalize').description, /最终确认/);
  assert.match(menu.options.find(option => option.value === 'knowledge').description, /READY|知识/);
  assert.ok(menu.options.every(option => option.symbol && option.label && option.description));
  assert.match(menu.why, /方向键/);
});

test('ingest candidates are generated from workspace entries instead of free-text paths', async () => {
  const cli = await importCli();
  assert.equal(typeof cli.buildIngestTargetOptions, 'function');
  const options = cli.buildIngestTargetOptions([
    { name: '.harness', type: 'directory' },
    { name: 'Inbox', type: 'directory' },
    { name: '随手记.md', type: 'file' },
    { name: '花卷初始化器-Windows.cmd', type: 'file' },
  ]);
  assert.deepEqual(options.map(option => option.value), ['Inbox', '随手记.md']);
  assert.match(options[0].description, /目录/);
  assert.match(options[1].description, /文件/);
});

test('interactive menu implementation has no numbered choice or ingest path prompt', async () => {
  const source = await readFile(CLI_PATH, 'utf8');
  assert.doesNotMatch(source, /1 初始化\s+2 状态/);
  assert.doesNotMatch(source, /question\(['"]选择:/);
  assert.doesNotMatch(source, /question\(['"]入库路径:/);
});
