# Evolution：建议式进化

1. 先修复当前任务，再搜索已有 Rule、Skill、Workflow、MCP、Memory 或 Proposal。
2. 自动进化开启时可形成候选记忆、Bad Case 和 Proposal；关闭时除非用户明确要求，否则不写入进化资产。
3. 优先复用、合并或修订已有资产，不制造重复资产。
4. Proposal 必须包含事件证据、目标、理由、Diff、风险、验证和回滚；状态先为 `proposed` 或 `awaiting-approval`。
5. 重复、冲突或过期资产只能提出 `merge`、`revise` 或 `deprecate`；批准后标记弃用并记录替代项，不自动删除。
6. 只有用户明确批准后才能应用用户资产 Proposal；应用后运行 Doctor 并记录结果。
7. 未被当前用户请求明确批准的 Proposal 不得自动应用。用户明确要求优化 Harness 时，可把当前批准范围应用到治理层；CLI/Marker 仍需通过正式 CLI 开发与 Release 更新。自动删除始终禁止。
8. 知识内容可以自动刷新 Manifest、索引、反向关系和质量报告；开启自动进化时可创建或补充 candidate。正式知识合并、一级分类变化、移动、deprecated 和 quarantined 仍需审阅或 Proposal。
