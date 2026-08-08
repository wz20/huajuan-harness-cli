---
id: huajuan.knowledge-bootstrap
name: Knowledge Bootstrap
version: 1
scope: system
status: active
---

# Knowledge Bootstrap

用于把任意目录建成经过确认、可校验、可持续演化的知识库。

## 流程

1. 运行 `node .harness/.huajuan.mjs knowledge scan --json`，只读盘点真实文件、类型和现有结构。
2. 和用户确认知识库主题、使命、边界和成功标准，填写 `KNOWLEDGE_PROFILE.md`。
3. 根据现有目录提出角色映射；空目录只提出最小结构，填写 `STRUCTURE.md`，不凭名称猜测职责。
4. 提出受控分类、标签、别名和判断顺序，填写 `TAXONOMY.md`。
5. 根据领域定义文档类型、Frontmatter、正文章节、Sidecar 与 Obsidian 规则，填写 `CONTENT_SCHEMA.md`。
6. 明确来源、引用、WikiLink、冲突和不确定关系，填写 `REFERENCE_RULES.md`。
7. 明确准入、更新、复审、对话沉淀、定时入库和淘汰，填写 `LIFECYCLE.md`。
8. 先给出 Dry Run：保留、补格式、Sidecar、索引、合并候选、冲突、风险和回滚；等待用户确认。
9. 实施后运行 `knowledge lint --json`。六份契约和质量均通过后，再运行 `finalize` 进入 READY。

READY 前禁止执行正式知识写入。
