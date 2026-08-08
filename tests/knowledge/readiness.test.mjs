import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {
  assertCommandSucceeded,
  createWorkspaceFixture,
  importCli,
  runCli,
} from '../helpers/workspace.mjs';

export async function writeConfirmedKnowledgeContracts(harnessRoot, options = {}) {
  const knowledgeRoot = options.knowledgeRoot ?? 'Knowledge';
  const files = {
    'KNOWLEDGE_PROFILE.md': `# Knowledge Profile

\`\`\`json
{
  "schema": "huajuan-knowledge-profile/v1",
  "status": "confirmed",
  "theme": "AI 素材",
  "mission": "沉淀可追溯、可复用、可复审的 AI 素材知识。",
  "boundaries": {
    "included": ["AI 图片、视频、音频、提示词、工具与制作方法"],
    "excluded": ["无法确认来源的转载内容"]
  },
  "knowledgeObjects": ["source", "concept", "tool", "method", "asset", "case", "synthesis", "index"],
  "successCriteria": ["每条正式知识可追溯来源", "所有正式页面可在 Obsidian 中浏览"]
}
\`\`\`

## 主题与使命

AI 素材知识库。

## 边界

只保留可追溯资料。

## 核心知识对象

来源、概念、工具、方法、素材、案例与索引。

## 成功标准

来源完整、关系可用、可以复审。

## 未决问题

- 无。

## 变更记录

- 已与用户确认。
`,
    'STRUCTURE.md': `# Workspace Structure Contract

\`\`\`json
{
  "schema": "huajuan-structure/v1",
  "status": "confirmed",
  "roots": [
    { "path": "${knowledgeRoot}", "role": "knowledge", "description": "正式知识与素材" },
    { "path": "Sources", "role": "sources", "description": "保留的原始来源" }
  ],
  "defaultWriteRoot": "${knowledgeRoot}",
  "indexFiles": ["${knowledgeRoot}/_index.md"]
}
\`\`\`

状态：\`confirmed\`

## 当前结构地图

- \`${knowledgeRoot}/\`：正式知识。
- \`Sources/\`：原始来源。

## 目录职责

- 正式知识进入 \`${knowledgeRoot}/\`，原始材料保留在 \`Sources/\`。

## 文件放置与命名

- 新知识按已确认分类放置，并维护分类索引。

## 保护、归档与淘汰

- 淘汰只标记状态，不自动删除来源。

## 未决问题

- 无。

## 变更记录

- 已与用户确认首次结构规范。
`,
    'TAXONOMY.md': `# Knowledge Taxonomy

\`\`\`json
{
  "schema": "huajuan-taxonomy/v1",
  "status": "confirmed",
  "categories": [
    { "id": "ai-assets", "name": "AI 素材", "description": "可复用的 AI 素材和知识" }
  ],
  "tags": [
    { "id": "ai-video", "name": "AI 视频", "description": "AI 视频生成与制作" },
    { "id": "prompt", "name": "提示词", "description": "生成提示词" }
  ],
  "aliases": [{ "term": "人物一致性", "canonical": "角色一致性" }],
  "classificationOrder": ["先判断知识类型", "再选择唯一主分类", "最后补充受控标签"]
}
\`\`\`

## 一级分类

- AI 素材。

## 标签标准

- 标签必须来自受控词表。

## 别名与同义词

- 同义词指向唯一规范名称。

## 分类判断顺序

- 类型 → 主分类 → 标签。

## 未决问题

- 无。

## 变更记录

- 已与用户确认。
`,
    'CONTENT_SCHEMA.md': `# Content Schema

\`\`\`json
{
  "schema": "huajuan-content-schema/v1",
  "status": "confirmed",
  "documentTypes": [
    { "id": "source", "name": "来源", "requiredSections": ["来源信息", "内容摘要"] },
    { "id": "concept", "name": "概念", "requiredSections": ["定义", "相关知识"] },
    { "id": "asset", "name": "素材", "requiredSections": ["素材说明", "来源与授权", "相关知识"] },
    { "id": "index", "name": "索引", "requiredSections": ["知识导航"] }
  ],
  "requiredFrontmatter": ["id", "title", "type", "status", "category", "tags", "sources", "created_at", "updated_at"],
  "obsidian": {
    "wikilinks": true,
    "relativeAttachments": true,
    "sidecarSuffix": ".huajuan.md"
  }
}
\`\`\`

## 文档类型

来源、概念和素材使用不同正文结构。

## 通用 Frontmatter

所有正式知识使用统一字段。

## 分类型格式

各类型必须满足定义的章节。

## 非 Markdown Sidecar

非 Markdown 文件使用同名 \`.huajuan.md\`。

## Obsidian 兼容

使用 WikiLink、相对附件和 YAML Frontmatter。

## 未决问题

- 无。

## 变更记录

- 已与用户确认。
`,
    'REFERENCE_RULES.md': `# Reference Rules

\`\`\`json
{
  "schema": "huajuan-reference-rules/v1",
  "status": "confirmed",
  "sourceRequired": true,
  "acceptedRelations": ["references", "related-to", "derived-from", "belongs-to", "uses", "depends-on"],
  "unresolvedPolicy": "unresolved",
  "semanticSimilarity": "suggested-only",
  "conflictPolicy": "preserve-and-review"
}
\`\`\`

## 来源要求

正式知识必须有来源或用户原创标记。

## 引用格式

来源写入 Frontmatter 与正文来源区。

## WikiLink 与附件

内部关系使用 Obsidian WikiLink。

## 冲突与不确定关系

冲突保留证据并进入复审，不确定关系不得升级为事实。

## 未决问题

- 无。

## 变更记录

- 已与用户确认。
`,
    'LIFECYCLE.md': `# Knowledge Lifecycle

\`\`\`json
{
  "schema": "huajuan-knowledge-lifecycle/v1",
  "status": "confirmed",
  "states": ["raw", "candidate", "active", "review", "deprecated", "quarantined"],
  "reviewPolicy": "按 review_after 与真实变更触发复审",
  "retirement": "proposal-only",
  "deletion": "never-auto",
  "conversationDistillation": true,
  "scheduledIngest": true
}
\`\`\`

## 状态与准入

raw → candidate → active → review → deprecated / quarantined。

## 更新与合并

先搜索已有知识，优先合并并保留来源。

## 复审与淘汰

到期、冲突、重复或被替代时进入复审；淘汰不删除。

## 对话沉淀

每次任务结束判断是否新增、合并、更新、淘汰或无需沉淀。

## 定时入库

定时来源先去重、保留来源，再判断是否编译为长期知识。

## 未决问题

- 无。

## 变更记录

- 已与用户确认。
`,
  };
  await mkdir(harnessRoot, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    await writeFile(path.join(harnessRoot, name), content, 'utf8');
  }
}

test('knowledge readiness stays blocked until all six workspace contracts are confirmed', async t => {
  const fixture = await createWorkspaceFixture();
  t.after(fixture.cleanup);
  const cli = await importCli();
  const context = await cli.validateWorkspace(fixture.workspace);

  const blocked = await cli.inspectKnowledgeReadiness(context);
  assert.equal(blocked.ready, false);
  assert.equal(blocked.status, 'blocked');
  assert.deepEqual(blocked.gates.map(gate => gate.id), [
    'knowledge-profile',
    'structure',
    'taxonomy',
    'content-schema',
    'reference-rules',
    'lifecycle',
  ]);
  assert.ok(blocked.gates.every(gate => gate.status !== 'confirmed'));

  await writeConfirmedKnowledgeContracts(path.join(fixture.workspace, '.harness'));
  const ready = await cli.inspectKnowledgeReadiness(context);
  assert.equal(ready.ready, true);
  assert.equal(ready.status, 'ready');
  assert.ok(ready.gates.every(gate => gate.status === 'confirmed'));
});

test('formal ingestion is blocked before READY and enabled after contract finalization', async t => {
  const fixture = await createWorkspaceFixture({ files: {
    'Knowledge/_index.md': `---
id: knowledge-index
title: 知识索引
type: index
status: active
category: ai-assets
tags: [ai-video]
sources: [user-original]
created_at: 2026-08-08
updated_at: 2026-08-08
---
# 知识索引

[[主题]]
`,
    'Knowledge/主题.md': `---
id: topic
title: 主题
type: concept
status: active
category: ai-assets
tags: [ai-video]
sources: [user-original]
created_at: 2026-08-08
updated_at: 2026-08-08
---
# 主题
`,
  } });
  t.after(fixture.cleanup);
  const answers = path.join(fixture.parent, 'answers.json');
  await writeFile(answers, JSON.stringify({
    ownerName: 'Ze', workspaceName: 'AI 素材', mode: 'knowledge-base', agents: ['codex'],
    protectedPaths: [], evolutionEnabled: true, notes: '',
  }), 'utf8');
  assertCommandSucceeded(await runCli(fixture.workspace, ['init', '--answers', answers]));

  const blocked = await runCli(fixture.workspace, ['ingest', 'Knowledge/主题.md']);
  assert.notEqual(blocked.exitCode, 0);
  assert.match(blocked.stderr, /READY|知识契约/);

  await writeConfirmedKnowledgeContracts(path.join(fixture.workspace, '.harness'));
  const finalized = await runCli(fixture.workspace, ['finalize', '--yes']);
  assertCommandSucceeded(finalized);
  assert.match(finalized.stdout, /READY/);

  const workspaceMarkdown = await readFile(path.join(fixture.workspace, '.harness', 'WORKSPACE.md'), 'utf8');
  const config = (await importCli()).parseWorkspaceConfig(workspaceMarkdown, fixture.workspace);
  assert.equal(config.status, 'ready');
  assert.equal(config.knowledge.readiness, 'ready');

  assertCommandSucceeded(await runCli(fixture.workspace, ['ingest', 'Knowledge/主题.md']));
});
