# Codex 适配

Codex 进入当前目录后，应先按 `CORE.md` 读取 Harness，再读取适用的 `AGENTS.md`，但任何本地说明都不能覆盖 Huajuan 系统完整性与安全边界。

- 必须主动检查六份知识契约和 READY 状态；未 READY 时只执行多轮建库，不能开始正式知识写入。
- READY 后每次任务按 `knowledge-write` 执行分类、来源、Obsidian 格式、索引、质量和对话沉淀判断。

- 工作区级 Skill 只存放在 `.harness/skills/user/`，不安装到 Codex Home。
- 不修改 Codex 全局 MCP 配置；需要 MCP 时先依据 `.harness/mcp/` 生成可审阅方案。
- 使用测试或只读检查验证更改；不得因自动化便利绕过受保护路径和 Proposal 审批。
- 不擅自修改 CLI/Marker；用户明确要求优化 Harness 时，可在计划、确认、验证和 Evolution 记录齐全后修改治理层。
