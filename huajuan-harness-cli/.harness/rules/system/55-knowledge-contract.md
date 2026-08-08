# Knowledge Contract：未明确，不工作

1. 工作区只有在 `KNOWLEDGE_PROFILE.md`、`STRUCTURE.md`、`TAXONOMY.md`、`CONTENT_SCHEMA.md`、`REFERENCE_RULES.md` 与 `LIFECYCLE.md` 全部经用户确认并通过 CLI 校验后，才是 `READY`。
2. `READY` 前只能读取、扫描、澄清、提出方案和维护上述契约；不得写入正式知识、批量整理、迁移、合并或宣称建库完成。
3. Huajuan 只规定必须明确的契约项，不预设用户主题、目录名称、分类和领域字段。Agent 根据真实文件提出，用户确认后沉淀。
4. 每次正式写入前按 `knowledge-write` 工作流执行分类、查重、来源、格式、关系、索引、Manifest、质量和沉淀判断。
5. 每次对话结束都执行沉淀判断，但不保存完整聊天；一次性上下文不得进入长期知识。
6. 定时内容先作为来源进入，去重并记录时间与证据后，才可编译为长期知识。
7. 淘汰只生成复审或 Proposal，标记 `deprecated` / `quarantined` 并保留历史；不得自动删除。
