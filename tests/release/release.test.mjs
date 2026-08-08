import assert from 'node:assert/strict';
import { access, readFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import test from 'node:test';
import { REPOSITORY_ROOT } from '../helpers/workspace.mjs';

const RELEASE_ROOT = path.join(REPOSITORY_ROOT, 'release');
const PRODUCT_RELEASE = path.join(RELEASE_ROOT, 'Huajuan-Harness');
const ZIP_RELEASE = path.join(RELEASE_ROOT, 'Huajuan-Harness-v0.6.0.zip');
const EXPECTED_TOP_LEVEL = [
  '.harness',
  '打开花卷控制台.html',
  '花卷初始化器-Linux.sh',
  '花卷初始化器-Windows.cmd',
  '花卷初始化器-macOS.command',
  '花卷初始化器.app',
];
const FORBIDDEN_NAMES = new Set([
  '.DS_Store',
  'docs',
  'node_modules',
  'package.json',
  'scripts',
  'tests',
]);

async function runNode(script) {
  const child = spawn(process.execPath, [path.join(REPOSITORY_ROOT, script)], {
    cwd: REPOSITORY_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', chunk => { stdout += chunk; });
  child.stderr.on('data', chunk => { stderr += chunk; });
  const exitCode = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', resolve);
  });
  assert.equal(exitCode, 0, `${script}\n${stderr}\n${stdout}`);
  return { stdout, stderr };
}

async function collectRelativeNames(root, current = root, result = []) {
  for (const entry of await readdir(current, { withFileTypes: true })) {
    const absolute = path.join(current, entry.name);
    result.push(path.relative(root, absolute));
    if (entry.isDirectory()) await collectRelativeNames(root, absolute, result);
  }
  return result;
}

test('release builder emits a verified runtime-only directory and ZIP', async t => {
  await rm(RELEASE_ROOT, { recursive: true, force: true });
  t.after(async () => { await rm(RELEASE_ROOT, { recursive: true, force: true }); });

  await runNode('scripts/build-release.mjs');
  const verification = await runNode('scripts/verify-release.mjs');
  assert.match(verification.stdout, /父目录安装冒烟通过/);
  assert.match(verification.stdout, /知识门禁冒烟通过/);

  await access(ZIP_RELEASE);
  assert.deepEqual((await readdir(PRODUCT_RELEASE)).sort(), [...EXPECTED_TOP_LEVEL].sort());

  const relativeNames = await collectRelativeNames(PRODUCT_RELEASE);
  assert.deepEqual(relativeNames.filter(relative => FORBIDDEN_NAMES.has(path.basename(relative))), []);

  const dashboard = await readFile(path.join(PRODUCT_RELEASE, '.harness', 'dashboard.html'), 'utf8');
  assert.doesNotMatch(dashboard, new RegExp(REPOSITORY_ROOT.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  const marker = JSON.parse(await readFile(path.join(PRODUCT_RELEASE, '.harness', '.huajuan.json'), 'utf8'));
  assert.equal(marker.version, '0.6.0');
  assert.ok(Object.keys(marker.managedHashes).length >= 30);
});
