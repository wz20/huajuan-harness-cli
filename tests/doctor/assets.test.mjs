import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { createWorkspaceFixture, importCli } from '../helpers/workspace.mjs';

const asset = ({ id, name, status, scope = 'user', extra = '' }) => `---\nid: ${id}\nname: ${name}\nscope: ${scope}\nstatus: ${status}\n${extra}---\n\n# ${name}\n`;

test('Doctor catches wrong asset placement, duplicate IDs, and invalid lifecycle metadata', async t => {
  const fixture = await createWorkspaceFixture();
  t.after(fixture.cleanup);
  const harness = path.join(fixture.workspace, '.harness');
  await mkdir(path.join(harness, 'skills', 'user', 'alpha'), { recursive: true });
  await writeFile(path.join(harness, 'skills', 'user', 'alpha', 'SKILL.md'), asset({ id: 'user.shared', name: 'Alpha', status: 'active' }));
  await writeFile(path.join(harness, 'workflows', 'user', 'alpha.md'), asset({ id: 'user.shared', name: 'Duplicate', status: 'active' }));
  await writeFile(path.join(harness, 'skills', 'legacy.md'), asset({ id: 'user.legacy', name: 'Legacy', status: 'active' }));
  await mkdir(path.join(harness, 'skills', 'user', 'old'), { recursive: true });
  await writeFile(path.join(harness, 'skills', 'user', 'old', 'SKILL.md'), asset({ id: 'user.old', name: 'Old', status: 'deprecated' }));
  await mkdir(path.join(harness, 'skills', 'user', 'invalid'), { recursive: true });
  await writeFile(path.join(harness, 'skills', 'user', 'invalid', 'SKILL.md'), asset({ id: 'user.invalid', name: 'Invalid', status: 'retired' }));
  await mkdir(path.join(harness, 'skills', 'system', 'rogue'), { recursive: true });
  await writeFile(path.join(harness, 'skills', 'system', 'rogue', 'SKILL.md'), asset({ id: 'user.rogue', name: 'Rogue', status: 'active' }));

  const cli = await importCli();
  const report = await cli.runDoctor(await cli.validateWorkspace(fixture.workspace));
  const ids = new Set(report.issues.map(issue => issue.id));
  for (const id of ['asset-duplicate-id', 'asset-legacy-location', 'asset-system-placement', 'lifecycle-status', 'lifecycle-deprecated-successor']) {
    assert.ok(ids.has(id), `missing ${id}`);
  }
});
