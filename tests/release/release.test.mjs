import assert from 'node:assert/strict';
import { access, readFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import test from 'node:test';
import { REPOSITORY_ROOT } from '../helpers/workspace.mjs';

const RELEASE_ROOT = path.join(REPOSITORY_ROOT, 'release');
const PRODUCT_RELEASE = path.join(RELEASE_ROOT, 'Huajuan-Harness');
const ZIP_RELEASE = path.join(RELEASE_ROOT, 'Huajuan-Harness-v0.6.2.zip');
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
const execFileAsync = promisify(execFile);

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
  const pythonExecutable = process.env.HUAJUAN_BUILD_PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
  const metadataProgram = 'import json,sys,zipfile; z=zipfile.ZipFile(sys.argv[1]); print(json.dumps([{"name":i.filename,"flags":i.flag_bits} for i in z.infolist()], ensure_ascii=False)); z.close()';
  const zipMetadata = await execFileAsync(pythonExecutable, ['-c', metadataProgram, ZIP_RELEASE], { encoding: 'utf8' });
  const zipRecords = JSON.parse(zipMetadata.stdout);
  for (const name of [
    'Huajuan-Harness/花卷初始化器-Windows.cmd',
    'Huajuan-Harness/花卷初始化器-macOS.command',
  ]) {
    const record = zipRecords.find(item => item.name === name);
    assert.ok(record, `ZIP 缺少 ${name}`);
    assert.notEqual(record.flags & 0x800, 0, `${name} 缺少 UTF-8 文件名标记`);
  }
  const verification = await runNode('scripts/verify-release.mjs');
  assert.match(verification.stdout, /父目录安装冒烟通过/);
  assert.match(verification.stdout, /知识门禁冒烟通过/);

  await access(ZIP_RELEASE);
  assert.deepEqual((await readdir(PRODUCT_RELEASE)).sort(), [...EXPECTED_TOP_LEVEL].sort());

  const windowsLauncher = await readFile(path.join(PRODUCT_RELEASE, '花卷初始化器-Windows.cmd'));
  const windowsLauncherSource = windowsLauncher.toString('utf8');
  assert.match(windowsLauncherSource, /\r\n/, 'Release 中的 Windows 启动器缺少 CRLF 换行');
  assert.doesNotMatch(windowsLauncherSource, /(?<!\r)\n/, 'Release 中的 Windows 启动器包含单独 LF 换行');
  assert.doesNotMatch(windowsLauncherSource, /powershell(?:\.exe)?/i, 'Windows 启动器不应额外依赖 PowerShell');

  const relativeNames = await collectRelativeNames(PRODUCT_RELEASE);
  assert.deepEqual(relativeNames.filter(relative => FORBIDDEN_NAMES.has(path.basename(relative))), []);

  const dashboard = await readFile(path.join(PRODUCT_RELEASE, '.harness', 'dashboard.html'), 'utf8');
  assert.doesNotMatch(dashboard, new RegExp(REPOSITORY_ROOT.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  const marker = JSON.parse(await readFile(path.join(PRODUCT_RELEASE, '.harness', '.huajuan.json'), 'utf8'));
  assert.equal(marker.version, '0.6.2');
  assert.ok(Object.keys(marker.managedHashes).length >= 30);
});
