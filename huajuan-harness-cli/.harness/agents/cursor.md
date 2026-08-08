# Cursor 适配

Cursor 在当前目录工作时，以 `CORE.md` 和 `SYSTEM_PROMPT.md` 作为 Harness 入口。

- 必须主动检查六份知识契约和 READY 状态；未 READY 时只执行多轮建库，不能开始正式知识写入。
- READY 后每次任务按 `knowledge-write` 执行分类、来源、Obsidian 格式、索引、质量和对话沉淀判断。

- 不自动生成或修改全局 Cursor Rules；工作区 Rule 统一写入 `.harness/rules/user/`。
- 工作区 Skill 与 Workflow 统一存放在 `.harness`，不得散落到项目根目录。
- MCP 声明只作为待审配置，不自动启用服务器或写入凭据。
- 启动器与标记文件的保护、用户保护路径和高风险确认规则始终有效；治理层仅在用户明确要求优化 Harness 时受控修改。
