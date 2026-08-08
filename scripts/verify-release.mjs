import { createHash } from 'node:crypto';
import { access, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptRoot, '..');
const releaseRoot = path.join(repositoryRoot, 'release');
const releaseProduct = path.join(releaseRoot, 'Huajuan-Harness');
const releaseZip = path.join(releaseRoot, 'Huajuan-Harness-v0.6.1.zip');
const harnessRoot = path.join(releaseProduct, '.harness');
const expectedTopLevel = [
  '.harness',
  '花卷初始化器.app',
  '花卷初始化器-macOS.command',
  '花卷初始化器-Windows.cmd',
  '花卷初始化器-Linux.sh',
  '打开花卷控制台.html',
].sort();
const forbiddenNames = new Set([
  '.DS_Store',
  '__MACOSX',
  'docs',
  'node_modules',
  'package.json',
  'scripts',
  'tests',
]);
const requiredRuntimePaths = [
  '.harness/.huajuan.json',
  '.harness/.huajuan.mjs',
  '.harness/CORE.md',
  '.harness/SYSTEM_PROMPT.md',
  '.harness/KNOWLEDGE_PROFILE.md',
  '.harness/STRUCTURE.md',
  '.harness/TAXONOMY.md',
  '.harness/CONTENT_SCHEMA.md',
  '.harness/REFERENCE_RULES.md',
  '.harness/LIFECYCLE.md',
  '.harness/WORKSPACE.md',
  '.harness/AGENT_INIT.md',
  '.harness/dashboard.html',
  '.harness/assets/huajuan-reference.png',
  '.harness/skills/user/.keep',
  '.harness/workflows/user/.keep',
  '.harness/mcp/servers/.keep',
  '.harness/mcp/profiles/.keep',
  '花卷初始化器.app/Contents/MacOS/huajuan-launcher',
  '花卷初始化器-macOS.command',
  '花卷初始化器-Windows.cmd',
  '花卷初始化器-Linux.sh',
  '打开花卷控制台.html',
];

function fail(message) {
  throw new Error(`Release 校验失败：${message}`);
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? repositoryRoot,
      env: { ...process.env, ...(options.env ?? {}) },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.once('error', reject);
    child.once('close', code => resolve({ code, stdout, stderr }));
  });
}

async function walk(directory, root = directory, records = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(root, absolute);
    const info = await lstat(absolute);
    records.push({ absolute, relative, name: entry.name, info });
    if (info.isDirectory()) await walk(absolute, root, records);
  }
  return records;
}

async function sha256(file) {
  return createHash('sha256').update(await readFile(file)).digest('hex');
}

await access(releaseProduct).catch(() => fail('缺少 release/Huajuan-Harness，请先运行 build:release。'));
await access(releaseZip).catch(() => fail('缺少 Release ZIP。'));

const topLevel = (await readdir(releaseProduct)).sort();
if (JSON.stringify(topLevel) !== JSON.stringify(expectedTopLevel)) {
  fail(`顶层内容不符合白名单：${topLevel.join('、')}`);
}

const records = await walk(releaseProduct);
const forbidden = records.filter(record => forbiddenNames.has(record.name));
if (forbidden.length) fail(`包含开发或系统垃圾文件：${forbidden.map(item => item.relative).join('、')}`);
const links = records.filter(record => record.info.isSymbolicLink());
if (links.length) fail(`Release 不允许符号链接：${links.map(item => item.relative).join('、')}`);

for (const relative of requiredRuntimePaths) {
  await access(path.join(releaseProduct, relative)).catch(() => fail(`缺少运行文件 ${relative}`));
}

if (process.platform !== 'win32') {
  for (const relative of [
    '花卷初始化器-macOS.command',
    '花卷初始化器-Linux.sh',
    '花卷初始化器.app/Contents/MacOS/huajuan-launcher',
  ]) {
    const info = await lstat(path.join(releaseProduct, relative));
    if ((info.mode & 0o111) === 0) fail(`${relative} 缺少可执行权限`);
  }
}

const marker = JSON.parse(await readFile(path.join(harnessRoot, '.huajuan.json'), 'utf8'));
if (marker.product !== 'huajuan-harness' || marker.version !== '0.6.1' || marker.schema !== 4 || marker.harnessRoot !== '.harness') {
  fail('Marker 产品、版本、Schema 或 Harness 根目录无效。');
}
const dynamicManagedFiles = new Set(['dashboard.html']);
const expectedHashFiles = (marker.managedFiles ?? []).filter(relative => !dynamicManagedFiles.has(relative)).sort();
const actualHashFiles = Object.keys(marker.managedHashes ?? {}).sort();
if (JSON.stringify(expectedHashFiles) !== JSON.stringify(actualHashFiles)) {
  fail('Marker 的 managedHashes 与固定 managedFiles 不一致。');
}
for (const relative of marker.managedFiles ?? []) {
  const absolute = path.join(harnessRoot, relative);
  const resolved = path.resolve(absolute);
  if (!resolved.startsWith(`${harnessRoot}${path.sep}`)) fail(`受管路径越界：${relative}`);
  const info = await lstat(absolute).catch(() => fail(`缺少受管文件：${relative}`));
  if (!info.isFile()) fail(`受管项不是普通文件：${relative}`);
  if (!dynamicManagedFiles.has(relative)) {
    const actual = await sha256(absolute);
    if (actual !== marker.managedHashes[relative]) fail(`系统文件哈希不匹配：${relative}`);
  }
}

const dashboard = await readFile(path.join(harnessRoot, 'dashboard.html'), 'utf8');
if (dashboard.includes(repositoryRoot)) fail('Dashboard 泄露了开发机绝对路径。');
if (/fetch\s*\(|https?:\/\//i.test(dashboard)) fail('Dashboard 包含联网能力。');

const doctor = await run(process.execPath, [path.join(harnessRoot, '.huajuan.mjs'), 'doctor', '--workspace', releaseProduct, '--json'], { cwd: releaseProduct });
if (doctor.code !== 0) fail(`Doctor 未通过。\n${doctor.stderr || doctor.stdout}`);
const doctorReport = JSON.parse(doctor.stdout);
if (!doctorReport.ok || doctorReport.counts.error !== 0) fail('Doctor 报告包含错误。');

const pythonExecutable = process.env.HUAJUAN_BUILD_PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
const metadataProgram = 'import json,sys,zipfile; z=zipfile.ZipFile(sys.argv[1]); print(json.dumps([{"name":i.filename,"flags":i.flag_bits} for i in z.infolist()], ensure_ascii=False)); z.close()';
const zipMetadataResult = await run(pythonExecutable, ['-c', metadataProgram, releaseZip], { cwd: releaseRoot });
if (zipMetadataResult.code !== 0) fail(`ZIP 元数据无法读取。\n${zipMetadataResult.stderr}`);
const zipRecords = JSON.parse(zipMetadataResult.stdout);
const zipEntries = zipRecords.map(record => record.name);
if (!zipEntries.length || zipEntries.some(entry => !entry.startsWith('Huajuan-Harness/'))) {
  fail('ZIP 必须且只能包含 Huajuan-Harness 根目录。');
}
for (const relative of requiredRuntimePaths) {
  const expected = `Huajuan-Harness/${relative}`;
  if (!zipEntries.includes(expected)) fail(`ZIP 缺少运行文件 ${expected}`);
}
const malformedUnicode = zipRecords.filter(record => /[^\x00-\x7f]/.test(record.name) && (record.flags & 0x800) === 0);
if (malformedUnicode.length) fail(`ZIP 中文路径缺少 UTF-8 标记：${malformedUnicode.map(item => item.name).join('、')}`);
const forbiddenZipEntries = zipEntries.filter(entry => entry.split('/').some(part => forbiddenNames.has(part)));
if (forbiddenZipEntries.length) fail(`ZIP 包含禁止项：${forbiddenZipEntries.join('、')}`);

const smokeRoot = await mkdtemp(path.join(tmpdir(), 'huajuan-release-parent-'));
try {
  const smokeWorkspace = path.join(smokeRoot, '我的知识库');
  await mkdir(path.join(smokeWorkspace, '技术学习'), { recursive: true });
  await writeFile(path.join(smokeWorkspace, '技术学习', '笔记.md'), '# 发布包父目录验证\n', 'utf8');
  const extracted = await run('unzip', ['-q', releaseZip, '-d', smokeWorkspace]);
  if (extracted.code !== 0) fail(`ZIP 解压失败。\n${extracted.stderr}`);
  const smokePackage = path.join(smokeWorkspace, 'Huajuan-Harness');
  const answers = path.join(smokeRoot, 'answers.json');
  await writeFile(answers, JSON.stringify({
    ownerName: 'Release QA',
    workspaceName: '父目录安装验收',
    mode: 'knowledge-base',
    agents: ['workbuddy'],
    protectedPaths: [],
    evolutionEnabled: true,
    notes: '',
  }), 'utf8');
  const install = await run('/bin/sh', [path.join(smokePackage, '花卷初始化器-Linux.sh')], {
    cwd: smokePackage,
    env: {
      HUAJUAN_TEST_NODE: process.execPath,
      HUAJUAN_INIT_ANSWERS_FILE: answers,
      HUAJUAN_NO_PAUSE: '1',
    },
  });
  if (install.code !== 0) fail(`父目录安装失败。\n${install.stderr || install.stdout}`);
  if (!install.stdout.includes('已安装到工作区')) fail('启动器没有报告父目录安装结果。');

  const installedWorkspace = await readFile(path.join(smokeWorkspace, '.harness', 'WORKSPACE.md'), 'utf8');
  if (!installedWorkspace.includes('技术学习')) fail('父目录中的真实用户内容没有被扫描。');
  if (installedWorkspace.includes('"name": "Huajuan-Harness"')) fail('便携安装包被错误计入用户内容。');
  const installedDoctor = await run(process.execPath, [path.join(smokeWorkspace, '.harness', '.huajuan.mjs'), 'doctor', '--json'], { cwd: smokeWorkspace });
  if (installedDoctor.code !== 0 || !JSON.parse(installedDoctor.stdout).ok) fail('父目录安装后的 Doctor 未通过。');
  const installedPrompt = await run(process.execPath, [path.join(smokeWorkspace, '.harness', '.huajuan.mjs'), 'prompt'], { cwd: smokeWorkspace });
  const requiredPromptTerms = ['WorkBuddy 适配已加载', '.harness/KNOWLEDGE_PROFILE.md', '.harness/TAXONOMY.md', '.harness/LIFECYCLE.md', 'READY'];
  if (installedPrompt.code !== 0 || requiredPromptTerms.some(term => !installedPrompt.stdout.includes(term))) {
    fail('父目录安装后的 WorkBuddy 或知识契约交接未生效。');
  }

  const knowledgeStatus = await run(process.execPath, [path.join(smokeWorkspace, '.harness', '.huajuan.mjs'), 'knowledge', 'status', '--json'], { cwd: smokeWorkspace });
  if (knowledgeStatus.code !== 0) fail(`父目录安装后的知识门禁状态无法读取。\n${knowledgeStatus.stderr || knowledgeStatus.stdout}`);
  const statusReport = JSON.parse(knowledgeStatus.stdout);
  if (statusReport.ready || statusReport.status !== 'blocked' || statusReport.gates?.length !== 6) {
    fail('首次安装必须由六份知识契约保持 BLOCKED，不能误报 READY。');
  }
  const prematureIngest = await run(process.execPath, [path.join(smokeWorkspace, '.harness', '.huajuan.mjs'), 'ingest', '技术学习/笔记.md'], { cwd: smokeWorkspace });
  if (prematureIngest.code === 0 || !/READY|知识契约/.test(prematureIngest.stderr)) {
    fail('首次安装在知识契约确认前没有拒绝正式入库。');
  }
} finally {
  await rm(smokeRoot, { recursive: true, force: true });
}

process.stdout.write(`Release 校验通过：${records.length} 个运行项，${actualHashFiles.length} 个系统哈希，Doctor 0 错误，父目录安装冒烟通过，知识门禁冒烟通过。\n`);
