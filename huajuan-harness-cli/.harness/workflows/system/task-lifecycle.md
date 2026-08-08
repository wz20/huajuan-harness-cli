# Task Lifecycle

每个 Agent 任务按以下门禁执行：

1. **Read**：读取核心协议、六份知识契约和任务相关资产，确认工作区、运行内核、Harness 定制边界与保护路径。
2. **Gate**：检查状态是否 READY。未 READY 时只允许 Knowledge Bootstrap，不执行正式工作。
3. **Inspect**：只读扫描真实现状；不从文件名或相似度编造语义。初始化时形成结构事实与不确定项。
4. **Clarify**：只询问会改变长期规范的未知信息；初始化允许多轮往返，不急于一次结束。
5. **Plan**：列出目标、文件、分类、格式、来源、影响、风险、验证、回滚和待确认事项。
6. **Approve**：高风险、结构性更改、语义合并、淘汰或 Harness 治理层优化等待用户明确批准。
7. **Implement**：按 knowledge-write 做批准范围内的最小更改，用户资产放入正确目录。
8. **Codify**：更新契约、分类索引、WikiLink、Manifest；可复用能力写入对应 Harness 资产。
9. **Verify**：运行任务验证、knowledge lint 与 Doctor，读取完整结果。
10. **Distill**：按 Knowledge Write 与 Memory Cycle 判断对话是否值得沉淀。
11. **Evolve**：需要时生成知识复审或 Proposal，不自动删除和应用未批准改动。
12. **Close**：刷新 Dashboard，报告结果、位置、沉淀结论、限制和回滚。
