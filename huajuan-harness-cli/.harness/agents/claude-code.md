# Claude Code 适配

Claude Code 进入当前目录后，应先按 `CORE.md` 读取 Harness，再处理用户任务。

- 必须主动检查六份知识契约和 READY 状态；未 READY 时只执行多轮建库，不能开始正式知识写入。
- READY 后每次任务按 `knowledge-write` 执行分类、来源、Obsidian 格式、索引、质量和对话沉淀判断。

- 工作区级 Skill 只读取 `.harness/skills/system/` 与 `.harness/skills/user/`；不把它们复制到用户全局目录。
- 不创建或改写根目录 `CLAUDE.md` 来绕过 Huajuan；若用户已有该文件，只把它视为用户上下文，冲突时以 Huajuan 系统安全规则为准。
- MCP 仅参考 `.harness/mcp/` 声明。修改 Claude Code MCP 配置前必须展示目标服务器、权限、数据流和撤销方式，并等待确认。
- 不擅自修改 CLI/Marker；用户明确要求优化 Harness 时，可在计划、确认、验证和 Evolution 记录齐全后修改治理层。
