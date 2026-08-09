import { access, chmod, cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptRoot, '..');
const sourceProduct = path.join(repositoryRoot, 'huajuan-harness-cli');
const releaseRoot = path.join(repositoryRoot, 'release');
const releaseProduct = path.join(releaseRoot, 'Huajuan-Harness');
const releaseZip = path.join(releaseRoot, 'Huajuan-Harness-v0.6.3.zip');
const releaseAllowlist = [
  '.harness',
  '花卷初始化器.app',
  '花卷初始化器-macOS.command',
  '花卷初始化器-Windows.cmd',
  '花卷初始化器-Linux.sh',
  '打开花卷控制台.html',
];
const ignoredNames = new Set(['.DS_Store', '__MACOSX']);

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? repositoryRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.once('error', reject);
    child.once('close', code => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${command} 执行失败（${code}）\n${stderr || stdout}`));
    });
  });
}

async function assertSourceProduct() {
  await access(path.join(sourceProduct, '.harness', '.huajuan.json'));
  await access(path.join(sourceProduct, '.harness', '.huajuan.mjs'));
  for (const relative of releaseAllowlist) await access(path.join(sourceProduct, relative));
}

function includeInRelease(source) {
  return !ignoredNames.has(path.basename(source));
}

await assertSourceProduct();

// Dashboard 是动态快照，不纳入系统哈希；其余固定文件在复制前统一刷新哈希。
await run(process.execPath, [path.join(scriptRoot, 'sync-managed-hashes.mjs'), sourceProduct]);

await mkdir(releaseRoot, { recursive: true });
await rm(releaseProduct, { recursive: true, force: true });
await rm(releaseZip, { force: true });
await mkdir(releaseProduct, { recursive: true });

for (const relative of releaseAllowlist) {
  await cp(path.join(sourceProduct, relative), path.join(releaseProduct, relative), {
    recursive: true,
    preserveTimestamps: true,
    filter: includeInRelease,
  });
}

if (process.platform !== 'win32') {
  await chmod(path.join(releaseProduct, '花卷初始化器-macOS.command'), 0o755);
  await chmod(path.join(releaseProduct, '花卷初始化器-Linux.sh'), 0o755);
  await chmod(path.join(releaseProduct, '花卷初始化器.app', 'Contents', 'MacOS', 'huajuan-launcher'), 0o755);
}

// 在干净的 Release 树中生成快照，避免把开发目录或系统垃圾文件带入看板数据。
await run(process.execPath, [path.join(releaseProduct, '.harness', '.huajuan.mjs'), 'dashboard', '--workspace', releaseProduct], { cwd: releaseProduct });
// Python 标准库会为非 ASCII 路径写入 ZIP UTF-8 标记，避免跨平台解压乱码。
const pythonExecutable = process.env.HUAJUAN_BUILD_PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
await run(pythonExecutable, [path.join(scriptRoot, 'create-release-zip.py'), releaseProduct, releaseZip], { cwd: releaseRoot });

process.stdout.write(`Release 已生成：${releaseProduct}\nZIP 已生成：${releaseZip}\n`);
