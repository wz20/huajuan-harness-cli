# Huajuan Agent 初始化入口

当前 Harness 尚未完成 CLI 配置。请先运行花卷初始化器，或执行：

```text
node .harness/.huajuan.mjs init
```

CLI 配置完成后，本文件会变成一份面向所选 Agent 的多轮建库任务。Agent 必须：

1. 运行 `knowledge scan --json`，只读观测当前目录与已有规范，不凭目录名猜测职责。
2. 和用户确认知识库主题、使命与边界，由 Agent 根据真实资料提出目录角色、分类、标签、Obsidian 文档格式、引用和生命周期。
3. 把确认结果沉淀到 KNOWLEDGE_PROFILE、STRUCTURE、TAXONOMY、CONTENT_SCHEMA、REFERENCE_RULES 与 LIFECYCLE。
4. 六份契约未 confirmed、CLI 未显示 READY 前，禁止正式知识写入、批量整理或迁移。
5. 契约确认后提交 Dry Run，确认后补齐文件格式、Sidecar、WikiLink、分类索引和来源。
6. 运行 `knowledge lint --json`、Doctor 与 Dashboard；用户最终确认并执行 `finalize` 后才能宣布初始化完成。
7. READY 后每次任务都执行知识写入、对话沉淀和复审淘汰判断；不保存完整聊天，不自动删除。

用户明确要求优化 Harness 时，允许受控优化治理提示词、Rules、Skills、Workflows、Agent 适配和模板；不得擅自修改启动器 `.huajuan.mjs` 或标记文件 `.huajuan.json`。
