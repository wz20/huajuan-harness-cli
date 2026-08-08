# Knowledge Write

每次向知识库写入或修改正式内容前执行：

1. Gate：读取六份知识契约；状态不是 READY 时停止正式写入，回到 Knowledge Bootstrap。
2. Classify：确定知识类型、唯一主分类、受控标签和目录位置。
3. Search：搜索现有页面、别名、重复、冲突和替代项。
4. Decide：选择新建、合并、更新、候选、无需沉淀或淘汰提案。
5. Source：保留来源；区分事实、用户原创、引用和 Agent 推断。
6. Format：按 CONTENT_SCHEMA 写 Frontmatter、必需章节和 Sidecar，使用 Obsidian WikiLink。
7. Connect：更新相关知识、分类索引和反向关系，不创造无证据关系。
8. Verify：运行 knowledge scan、knowledge lint 与任务验证。
9. Distill：判断本次对话是否应沉淀为知识、Memory、Rule、Skill、Workflow 或无需沉淀。
10. Report：说明新增、合并、更新、待确认和淘汰候选；不得隐瞒未解决问题。
