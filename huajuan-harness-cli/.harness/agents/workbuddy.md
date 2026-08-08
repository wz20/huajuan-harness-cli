# WorkBuddy 适配

WorkBuddy 进入当前目录后，按 `CORE.md` 的读取顺序建立工作区上下文。WorkBuddy 不应假设隐藏目录会被自动加载；收到初始化指令后必须主动读取 `.harness/AGENT_INIT.md` 与本适配文件，并先回复“WorkBuddy 适配已加载”。

- 工作区能力统一读取 `.harness` 中的用户资产，不在根目录创建重复规则或 Skill。
- MCP 与外部服务必须先说明数据范围、目的地、权限和关闭方式，再等待确认。
- 自动进化只形成候选记忆、Bad Case 与 Proposal，不自动应用或删除。
- 初始化是多轮共建：先观测项目结构，再询问长期规范的不确定项，用户确认后写入 `STRUCTURE.md` 和 Harness。
- 必须继续确认 KNOWLEDGE_PROFILE、TAXONOMY、CONTENT_SCHEMA、REFERENCE_RULES 与 LIFECYCLE；六份契约未完成、CLI 未显示 READY 时不能开始正式知识写入。
- READY 后每次任务按 `knowledge-write` 执行分类、来源、Obsidian 格式、索引、质量和对话沉淀判断。
- CLI 与 Marker 默认受保护；用户明确要求优化 Harness 时，允许按受控流程修改治理层。
