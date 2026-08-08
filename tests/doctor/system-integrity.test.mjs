import assert from 'node:assert/strict';
import { readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { createWorkspaceFixture, importCli } from '../helpers/workspace.mjs';

test('Doctor distinguishes an explicitly customizable Harness baseline from runtime corruption', async t => {
  const fixture = await createWorkspaceFixture();
  t.after(fixture.cleanup);
  const markerFile = path.join(fixture.workspace, '.harness', '.huajuan.json');
  const marker = JSON.parse(await readFile(markerFile, 'utf8'));
  assert.match(marker.managedHashes?.['CORE.md'] ?? '', /^[a-f0-9]{64}$/);

  await writeFile(path.join(fixture.workspace, '.harness', 'CORE.md'), '# 用户确认后的 Harness 规范\n', 'utf8');
  await writeFile(path.join(fixture.workspace, '.harness', '.huajuan.mjs'), 'throw new Error("broken runtime");\n', 'utf8');
  await rm(path.join(fixture.workspace, '.harness', 'SYSTEM_PROMPT.md'));
  const cli = await importCli();
  const context = await cli.validateWorkspace(fixture.workspace);
  const report = await cli.runDoctor(context);
  const ids = report.issues.map(issue => issue.id);
  assert.ok(ids.includes('harness-customized'));
  assert.ok(ids.includes('runtime-modified'));
  assert.ok(ids.includes('core-missing'));
  assert.equal(report.issues.find(issue => issue.id === 'harness-customized')?.severity, 'info');
  assert.equal(report.issues.find(issue => issue.id === 'runtime-modified')?.severity, 'error');
  assert.ok(report.categories.some(category => category.id === 'core'));
});
