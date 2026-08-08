# Trae 适配

Trae 进入当前目录后，先读取 `CORE.md`、`SYSTEM_PROMPT.md`、`WORKSPACE.md` 与系统规则。

- 必须主动检查六份知识契约和 READY 状态；未 READY 时只执行多轮建库，不能开始正式知识写入。
- READY 后每次任务按 `knowledge-write` 执行分类、来源、Obsidian 格式、索引、质量和对话沉淀判断。

- 所有工作区级 Rule、Skill、Workflow 与 MCP 描述都留在 `.harness`，不自动同步到全局空间。
- 使用 Trae 工具前遵守保护路径、外部传输和高风险确认规则。
- 需要 Agent 专属配置时，先在 `.harness/mcp/profiles/` 或 Evolution Proposal 中说明，不直接改全局设置。
- 不擅自修改 CLI/Marker；用户明确要求时可受控优化 Harness 治理层。
