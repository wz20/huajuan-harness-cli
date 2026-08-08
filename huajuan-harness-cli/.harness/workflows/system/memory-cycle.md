# Memory Cycle

1. 识别稳定偏好、已确认决策、可复用经验或错误模式。
2. 使用 `memory-distillation` 的标准判断价值，搜索重复项。
3. 新证据优先更新现有记忆；冲突时保留来源并生成 Proposal，不静默覆盖。
4. 自动进化关闭时只在当前任务报告机会，不写文件。
5. 自动进化开启时可写 `candidate`；高风险 Bad Case 可一次记录。
6. 到达 `review_after` 后重新验证。失效记忆通过 deprecate Proposal 淘汰，不自动删除。
7. 任务结束必须同时判断领域知识沉淀：无需沉淀、新增、合并、更新或淘汰候选；领域知识按 CONTENT_SCHEMA 进入知识区，不混入 Harness Memory。
