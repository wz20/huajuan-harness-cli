import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { createWorkspaceFixture, importCli } from '../helpers/workspace.mjs';
import { writeConfirmedKnowledgeContracts } from '../knowledge/readiness.test.mjs';

test('Doctor detects attempts to enable automatic Proposal application or deletion', async t => {
  const fixture = await createWorkspaceFixture();
  t.after(fixture.cleanup);
  const workspaceFile = path.join(fixture.workspace, '.harness', 'WORKSPACE.md');
  const source = await readFile(workspaceFile, 'utf8');
  await writeFile(workspaceFile, source
    .replace('"autoApply": false', '"autoApply": true')
    .replace('"deletion": "never-auto"', '"deletion": "automatic"'), 'utf8');

  const cli = await importCli();
  const report = await cli.runDoctor(await cli.validateWorkspace(fixture.workspace));
  const ids = new Set(report.issues.map(issue => issue.id));
  assert.ok(ids.has('config-auto-apply'));
  assert.ok(ids.has('config-auto-delete'));
  assert.equal(report.ok, false);
});

test('Doctor blocks a READY workspace whose knowledge contract becomes incomplete', async t => {
  const fixture = await createWorkspaceFixture();
  t.after(fixture.cleanup);
  const harnessRoot = path.join(fixture.workspace, '.harness');
  await writeConfirmedKnowledgeContracts(harnessRoot, { knowledgeRoot: '.' });
  const workspaceFile = path.join(harnessRoot, 'WORKSPACE.md');
  const cli = await importCli();
  const source = await readFile(workspaceFile, 'utf8');
  const config = cli.parseWorkspaceConfig(source, fixture.workspace);
  config.status = 'ready';
  config.knowledge.readiness = 'ready';
  await writeFile(workspaceFile, cli.replaceManagedBlock(source, 'CONFIG', `\`\`\`json\n${JSON.stringify(config, null, 2)}\n\`\`\``), 'utf8');
  const taxonomy = path.join(harnessRoot, 'TAXONOMY.md');
  await writeFile(taxonomy, (await readFile(taxonomy, 'utf8')).replace('"status": "confirmed"', '"status": "awaiting-agent-confirmation"'), 'utf8');

  const report = await cli.runDoctor(await cli.validateWorkspace(fixture.workspace));
  assert.equal(report.ok, false);
  assert.ok(report.issues.some(issue => issue.id === 'knowledge-contract-incomplete' && issue.path.endsWith('TAXONOMY.md')));
  assert.ok(report.categories.some(category => category.id === 'knowledge'));
});
