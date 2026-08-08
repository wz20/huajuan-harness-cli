import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TEST_ROOT = path.dirname(fileURLToPath(import.meta.url));
export const REPOSITORY_ROOT = path.resolve(TEST_ROOT, '..', '..');
export const PRODUCT_ROOT = path.join(REPOSITORY_ROOT, 'huajuan-harness-cli');
export const CLI_PATH = path.join(PRODUCT_ROOT, '.harness', '.huajuan.mjs');

export async function exists(target) {
  try {
    await readFile(target);
    return true;
  } catch (error) {
    if (error?.code === 'EISDIR') return true;
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

export async function importCli() {
  return await import(`${pathToFileURL(CLI_PATH).href}?test=${Date.now()}-${Math.random()}`);
}

export async function createWorkspaceFixture(options = {}) {
  const prefix = path.join(tmpdir(), options.prefix ?? 'huajuan-test-');
  const parent = await mkdtemp(prefix);
  const workspaceName = options.workspaceName ?? '知识库 空间';
  const workspace = path.join(parent, workspaceName);
  await cp(PRODUCT_ROOT, workspace, { recursive: true, filter: source => !source.endsWith('.DS_Store') });
  if (options.files) {
    for (const [relative, content] of Object.entries(options.files)) {
      const target = path.join(workspace, relative);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, content, 'utf8');
    }
  }
  return {
    parent,
    workspace,
    cleanup: async () => { await rm(parent, { recursive: true, force: true }); },
  };
}

export async function runCli(workspace, args = [], options = {}) {
  const cli = path.join(workspace, '.harness', '.huajuan.mjs');
  const child = spawn(process.execPath, [cli, ...args], {
    cwd: workspace,
    env: { ...process.env, ...(options.env ?? {}) },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  if (options.input !== undefined) child.stdin.end(options.input);
  else child.stdin.end();
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

export function assertCommandSucceeded(result) {
  assert.equal(result.exitCode, 0, `stderr:\n${result.stderr}\nstdout:\n${result.stdout}`);
}
