import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { createWorkspaceFixture, exists, runCli } from '../helpers/workspace.mjs';

test('safe uninstall exports only user sediment with hashes and preserves workspace content', async t => {
  const fixture = await createWorkspaceFixture({ files: { '我的知识.md': '# 不应删除\n' } });
  t.after(fixture.cleanup);
  const userSkill = path.join(fixture.workspace, '.harness', 'skills', 'user', 'demo');
  await mkdir(userSkill, { recursive: true });
  await writeFile(path.join(userSkill, 'SKILL.md'), '---\nid: user.demo\nname: Demo\nscope: user\nstatus: active\n---\n# Demo\n');
  const destination = path.join(fixture.parent, '安全导出');
  const result = await runCli(fixture.workspace, ['uninstall', '--yes', '--scope', 'all', '--export', destination]);
  assert.equal(result.exitCode, 0, result.stderr || result.stdout);
  assert.equal(await exists(path.join(fixture.workspace, '.harness')), false);
  assert.equal(await readFile(path.join(fixture.workspace, '我的知识.md'), 'utf8'), '# 不应删除\n');
  assert.equal(await exists(path.join(destination, 'skills', 'user', 'demo', 'SKILL.md')), true);
  assert.equal(await exists(path.join(destination, 'skills', 'system', 'workspace-bootstrap', 'SKILL.md')), false);
  const manifest = JSON.parse(await readFile(path.join(destination, 'EXPORT-MANIFEST.json'), 'utf8'));
  assert.ok(manifest.files.length >= 1);
  assert.ok(manifest.files.every(file => /^[a-f0-9]{64}$/.test(file.sha256)));
  assert.match(result.stdout, /仅删除了当前 \.harness/);
  assert.match(result.stdout, /其他文件未修改/);
});
