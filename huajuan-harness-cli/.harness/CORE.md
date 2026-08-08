# Huajuan Harness Core

Huajuan Harness 是当前目录的 Agent 治理内核。工作区文件与 `.harness` 用户资产是事实源；Dashboard 与统计均可重新生成。

## 每次任务的读取顺序

1. `.harness/SYSTEM_PROMPT.md`
2. `.harness/WORKSPACE.md`
3. `.harness/KNOWLEDGE_PROFILE.md`
4. `.harness/STRUCTURE.md`
5. `.harness/TAXONOMY.md`
6. `.harness/CONTENT_SCHEMA.md`
7. `.harness/REFERENCE_RULES.md`
8. `.harness/LIFECYCLE.md`
9. `.harness/AGENT_INIT.md`
10. `.harness/rules/system/`（按文件名顺序）
11. `.harness/workflows/system/task-lifecycle.md` 与 `knowledge-write.md`
12. 与任务相关的 Agent 适配、Rules、Skills、Workflows、MCP、Memory 与 Proposals

## 两类资产

- 运行内核：`.huajuan.mjs` 与 `.huajuan.json`。普通工作区任务不得修改。
- Harness 治理基线：`CORE.md`、`SYSTEM_PROMPT.md`、六份知识契约、`rules/system/`、`skills/system/`、`workflows/system/`、`agents/`、`templates/`。默认受保护，但用户明确要求优化 Harness 时可按受控流程定制。
- 用户资产：`rules/user/`、`skills/user/`、`workflows/user/`、`mcp/servers/`、`mcp/profiles/`、`memory/`、`evolution/`。只能依据真实事件创建并遵循生命周期。

## 不可突破的边界

- 当前对话的明确任务可覆盖长期偏好；明确的 Harness 优化请求可授权治理层定制，但不能顺带修改 CLI、Marker 或任务范围外内容。
- 先只读分析并提交方案；移动、重命名、覆盖、删除、MCP 启用和外部传输必须单独确认。
- 六份知识契约未全部确认、CLI 未显示 READY 前，只允许扫描、澄清和维护契约，禁止正式知识写入或批量整理。
- 正式知识必须符合当前 CONTENT_SCHEMA、TAXONOMY 与 REFERENCE_RULES，使用 Obsidian 可读 Markdown、WikiLink、索引与 Sidecar。
- 正式知识关系必须有显式证据或用户确认；语义相似只能是 `suggested`。
- 进化可以自动形成候选记忆、Bad Case 和 Proposal，但 `autoApply` 永远为 `false`，删除永远不能自动发生。
- 完成前运行 Doctor、刷新 Dashboard，并说明结果、风险、验证和回滚。
- 每次任务结束都执行知识与记忆沉淀判断；定时来源先去重和保留证据，淘汰只标记与提案，永不自动删除。
