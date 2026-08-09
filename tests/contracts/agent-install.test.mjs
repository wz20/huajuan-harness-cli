import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import test from 'node:test';
import { PRODUCT_ROOT, REPOSITORY_ROOT, importCli } from '../helpers/workspace.mjs';

async function loadManifest() {
  return JSON.parse(await readFile(path.join(REPOSITORY_ROOT, 'agent-install.json'), 'utf8'));
}

function runNode(file, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file, ...args], {
      cwd,
      env: { ...process.env, HUAJUAN_NO_PAUSE: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.once('error', reject);
    child.once('close', exitCode => resolve({ exitCode, stdout, stderr }));
  });
}

test('Agent install manifest drives the existing kernel into awaiting-agent BLOCKED state', async t => {
  const manifest = await loadManifest();
  assert.equal(manifest.schema, 'huajuan-agent-install/v1');
  assert.equal(manifest.release.asset, 'Huajuan-Harness-latest.zip');
  assert.equal(manifest.release.requireDigest, 'sha256');
  assert.equal(manifest.workspace.target, 'agent-current-working-directory');
  assert.deepEqual(manifest.install.answerFields.freeText, ['ownerName', 'workspaceName', 'notes']);
  assert.equal(manifest.postInstall.requiredStatus, 'awaiting-agent');
  assert.equal(manifest.postInstall.knowledgeReadiness, 'blocked');
  assert.equal(manifest.postInstall.continueWith, '.harness/AGENT_INIT.md');

  const temporary = await mkdtemp(path.join(tmpdir(), 'huajuan-agent-install-'));
  t.after(async () => { await rm(temporary, { recursive: true, force: true }); });
  const workspace = path.join(temporary, 'AI素材知识库');
  const packageRoot = path.join(workspace, manifest.workspace.packageDirectory);
  await mkdir(workspace, { recursive: true });
  await writeFile(path.join(workspace, '已有素材.md'), '# 已有内容\n', 'utf8');
  await cp(PRODUCT_ROOT, packageRoot, { recursive: true });
  const answersFile = path.join(temporary, 'answers.json');
  await writeFile(answersFile, JSON.stringify({
    ownerName: 'Ze',
    workspaceName: 'AI素材知识库',
    mode: 'knowledge-base',
    agents: ['codex'],
    protectedPaths: [],
    evolutionEnabled: true,
    notes: '',
  }), 'utf8');

  const entrypoint = path.join(workspace, manifest.install.entrypoint);
  const args = manifest.install.command.map(item => item === '{answersFile}' ? answersFile : item);
  const result = await runNode(entrypoint, args, workspace);
  assert.equal(result.exitCode, 0, `${result.stderr}\n${result.stdout}`);

  const workspaceContract = await readFile(path.join(workspace, '.harness', 'WORKSPACE.md'), 'utf8');
  const config = (await importCli()).parseWorkspaceConfig(workspaceContract, workspace);
  assert.equal(config.status, 'awaiting-agent');
  assert.equal(config.knowledge.readiness, 'blocked');
  assert.deepEqual(config.agents, ['codex']);
  assert.match(await readFile(path.join(workspace, manifest.postInstall.continueWith), 'utf8'), /多轮|BLOCKED/);
});

test('Agent install manifest cannot overwrite an unknown existing Harness', async t => {
  const manifest = await loadManifest();
  const temporary = await mkdtemp(path.join(tmpdir(), 'huajuan-agent-conflict-'));
  t.after(async () => { await rm(temporary, { recursive: true, force: true }); });
  const workspace = path.join(temporary, '工作区');
  const packageRoot = path.join(workspace, manifest.workspace.packageDirectory);
  await mkdir(path.join(workspace, '.harness'), { recursive: true });
  await writeFile(path.join(workspace, '.harness', 'private.txt'), 'must stay', 'utf8');
  await cp(PRODUCT_ROOT, packageRoot, { recursive: true });
  const answersFile = path.join(temporary, 'answers.json');
  await writeFile(answersFile, '{}', 'utf8');

  const entrypoint = path.join(workspace, manifest.install.entrypoint);
  const args = manifest.install.command.map(item => item === '{answersFile}' ? answersFile : item);
  const result = await runNode(entrypoint, args, workspace);
  assert.notEqual(result.exitCode, 0);
  assert.match(result.stderr, /为避免覆盖，安装已停止/);
  assert.equal(await readFile(path.join(workspace, '.harness', 'private.txt'), 'utf8'), 'must stay');
});
