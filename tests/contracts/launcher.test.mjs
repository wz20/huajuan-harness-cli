import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import test from 'node:test';
import { PRODUCT_ROOT, importCli } from '../helpers/workspace.mjs';

const LAUNCHERS = [
  '花卷初始化器.app/Contents/MacOS/huajuan-launcher',
  '花卷初始化器-Linux.sh',
  '花卷初始化器-Windows.cmd',
];

test('macOS application bundle reports the current release version', async () => {
  const plist = await readFile(path.join(PRODUCT_ROOT, '花卷初始化器.app', 'Contents', 'Info.plist'), 'utf8');
  assert.match(plist, /<key>CFBundleShortVersionString<\/key><string>0\.6\.2<\/string>/);
});

test('launchers infer the current product root and never ask for a workspace path', async () => {
  for (const relative of LAUNCHERS) {
    const source = await readFile(path.join(PRODUCT_ROOT, relative), 'utf8');
    assert.doesNotMatch(source, /choose folder|FolderBrowserDialog|zenity|kdialog|请输入工作区|选择.*工作区/i, relative);
    assert.match(source, /\.harness[\\/]\.huajuan\.mjs/, relative);
  }
});

test('visible launcher commands do not pass --workspace', async () => {
  for (const relative of LAUNCHERS) {
    const source = await readFile(path.join(PRODUCT_ROOT, relative), 'utf8');
    assert.doesNotMatch(source, /--workspace/, relative);
  }
});

test('Windows launcher uses CRLF so cmd.exe can parse the downloaded script reliably', async () => {
  const launcher = await readFile(path.join(PRODUCT_ROOT, '花卷初始化器-Windows.cmd'));
  const source = launcher.toString('utf8');
  assert.match(source, /\r\n/, 'Windows 启动器缺少 CRLF 换行');
  assert.doesNotMatch(source, /(?<!\r)\n/, 'Windows 启动器包含 cmd.exe 不稳定支持的 LF 换行');
});

test('Windows launcher depends only on Node.js and not PowerShell', async () => {
  const source = await readFile(path.join(PRODUCT_ROOT, '花卷初始化器-Windows.cmd'), 'utf8');
  assert.doesNotMatch(source, /powershell(?:\.exe)?/i);
  assert.match(source, /\.huajuan\.json/);
  assert.match(source, /process\.versions\.node/);
});

async function runLauncher(file, env) {
  const child = spawn('/bin/sh', [file], {
    cwd: path.dirname(file),
    env: { ...process.env, ...env },
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
  return { exitCode, stdout, stderr };
}

for (const launcherName of ['花卷初始化器-macOS.command', '花卷初始化器-Linux.sh']) {
  test(`${launcherName} installs Harness into its package parent workspace`, async t => {
    const temporary = await mkdtemp(path.join(tmpdir(), 'huajuan-parent-launcher-'));
    t.after(async () => { await rm(temporary, { recursive: true, force: true }); });
    const workspace = path.join(temporary, '我的知识库');
    const packageRoot = path.join(workspace, 'Huajuan-Harness');
    await mkdir(path.join(workspace, '技术学习'), { recursive: true });
    await writeFile(path.join(workspace, '技术学习', '笔记.md'), '# 内容\n', 'utf8');
    await cp(PRODUCT_ROOT, packageRoot, { recursive: true, filter: source => !source.endsWith('.DS_Store') });
    const answers = path.join(temporary, 'answers.json');
    await writeFile(answers, JSON.stringify({
      ownerName: 'Ze', workspaceName: '我的知识库', mode: 'knowledge-base', agents: ['workbuddy'],
      protectedPaths: [], evolutionEnabled: true, notes: '',
    }), 'utf8');

    const result = await runLauncher(path.join(packageRoot, launcherName), {
      HUAJUAN_TEST_NODE: process.execPath,
      HUAJUAN_INIT_ANSWERS_FILE: answers,
      HUAJUAN_NO_PAUSE: '1',
    });
    assert.equal(result.exitCode, 0, `${result.stderr}\n${result.stdout}`);
    const installedWorkspace = await readFile(path.join(workspace, '.harness', 'WORKSPACE.md'), 'utf8');
    const config = (await importCli()).parseWorkspaceConfig(installedWorkspace, workspace);
    assert.equal(config.workspace.path, workspace);
    assert.equal(config.workspace.emptyAtInit, false);
    assert.match(installedWorkspace, /技术学习/);
    assert.doesNotMatch(installedWorkspace, /"name": "Huajuan-Harness"/);
    assert.match(result.stdout, /已安装到工作区/);

    const packageWorkspace = await readFile(path.join(packageRoot, '.harness', 'WORKSPACE.md'), 'utf8');
    assert.match(packageWorkspace, /"status": "unconfigured"/);
  });
}
