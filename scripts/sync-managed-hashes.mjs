import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptRoot, '..');
const productRoot = path.resolve(process.argv[2] ?? path.join(repositoryRoot, 'huajuan-harness-cli'));
const harnessRoot = path.join(productRoot, '.harness');
const markerFile = path.join(harnessRoot, '.huajuan.json');
const marker = JSON.parse(await readFile(markerFile, 'utf8'));
const generatedFiles = new Set(['dashboard.html']);
const managedHashes = {};

for (const relative of marker.managedFiles ?? []) {
  if (generatedFiles.has(relative)) continue;
  const content = await readFile(path.join(harnessRoot, relative));
  managedHashes[relative] = createHash('sha256').update(content).digest('hex');
}

marker.managedHashes = managedHashes;
await writeFile(markerFile, `${JSON.stringify(marker, null, 2)}\n`, 'utf8');
process.stdout.write(`已同步 ${Object.keys(managedHashes).length} 个系统文件哈希。\n`);
