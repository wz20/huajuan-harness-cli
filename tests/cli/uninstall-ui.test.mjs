import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { CLI_PATH, importCli } from '../helpers/workspace.mjs';

test('safe uninstall is fully option-driven and explains export and deletion effects', async () => {
  const cli = await importCli();
  assert.equal(typeof cli.buildUninstallModel, 'function');
  const model = cli.buildUninstallModel('/tmp/知识库-Huajuan-Export');
  assert.deepEqual(model.export.options.map(option => option.value), ['all', 'none', 'cancel']);
  assert.ok(model.scopes.options.some(option => option.value === 'skills/user'));
  assert.ok(model.scopes.options.some(option => option.value === 'mcp/servers'));
  assert.deepEqual(model.confirm.options.map(option => option.value), ['delete', 'back', 'cancel']);
  assert.match(model.confirm.why, /仅删除当前目录的 \.harness/);
  assert.match(model.confirm.summary.join(' '), /自动导出目录/);
});

test('interactive uninstall contains no free-text confirmation, path, or scope prompt', async () => {
  const source = await readFile(CLI_PATH, 'utf8');
  assert.doesNotMatch(source, /输入 DELETE/);
  assert.doesNotMatch(source, /卸载前导出用户沉淀？Y\/n/);
  assert.doesNotMatch(source, /导出范围 all 或逗号分隔名称/);
  assert.doesNotMatch(source, /导出目录.*question/);
});
