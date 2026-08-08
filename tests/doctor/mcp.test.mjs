import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { createWorkspaceFixture, importCli } from '../helpers/workspace.mjs';

test('Doctor rejects MCP secrets, duplicate IDs, unsafe boundaries, and approval bypass', async t => {
  const fixture = await createWorkspaceFixture();
  t.after(fixture.cleanup);
  const servers = path.join(fixture.workspace, '.harness', 'mcp', 'servers');
  const base = {
    schema: 'huajuan-mcp-server/v1', id: 'workspace.docs', name: 'Docs', status: 'candidate',
    transport: 'stdio', purpose: '读取工作区文档', command: 'docs-mcp', args: [], capabilities: [],
    dataBoundaries: { reads: ['docs'], writes: [], externalDestinations: [] },
    secrets: 'external-only', requiresApproval: true,
  };
  await writeFile(path.join(servers, 'good.json'), JSON.stringify(base, null, 2));
  await writeFile(path.join(servers, 'bad.json'), JSON.stringify({
    ...base,
    name: 'Bad',
    apiKey: 'plain-text-secret-fixture',
    requiresApproval: false,
    secrets: 'inline',
    dataBoundaries: { reads: ['../outside'], writes: ['/tmp'], externalDestinations: [] },
  }, null, 2));

  const cli = await importCli();
  const report = await cli.runDoctor(await cli.validateWorkspace(fixture.workspace));
  const ids = new Set(report.issues.map(issue => issue.id));
  for (const id of ['mcp-secret', 'mcp-duplicate-id', 'mcp-path-outside', 'mcp-format']) {
    assert.ok(ids.has(id), `missing ${id}`);
  }
});
