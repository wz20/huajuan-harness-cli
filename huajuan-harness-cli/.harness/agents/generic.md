# 通用 Agent 适配

如果当前 Agent 没有专属适配文件，使用本协议：

1. 按 `CORE.md` 顺序读取 Harness。
2. 不修改 Agent 全局配置，不把工作区资产写到 `.harness` 之外。
3. 不假定拥有 Hook、MCP、Shell 或编辑器专属能力；只使用当前明确可用且经授权的工具。
4. CLI/Marker 与保护路径保持只读；用户明确要求时可受控优化 Harness 治理层，高风险操作先计划并确认。
5. 进化只生成候选和 Proposal，不自动应用或删除。
6. 主动检查六份知识契约和 READY 状态；未 READY 时只执行多轮建库。
7. READY 后按 `knowledge-write` 执行分类、来源、Obsidian 格式、索引、质量和对话沉淀判断。
