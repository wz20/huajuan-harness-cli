---
id: huajuan.knowledge-quality
name: Knowledge Quality
version: 1
scope: system
status: active
---

# Knowledge Quality

用于初始化后和日常任务结束前检查知识库质量。

## 检查

- 正式 Markdown 的 Frontmatter、类型、分类、受控标签和来源；
- Obsidian WikiLink、相对附件、分类索引和非 Markdown Sidecar；
- 重复、别名、冲突、孤立页面、待复审、失效来源和未分类内容；
- Manifest 是否覆盖当前文件，二次执行是否产生无意义修改。

确定性问题使用 `knowledge lint`；语义重复、冲突和知识价值由 Agent 依据证据判断。错误未解决时不得宣称任务完成。
