---
id: huajuan.evolution-governance
name: Evolution Governance
version: 1
scope: system
status: active
---

# Evolution Governance

用于从真实纠正、重复摩擦、Doctor 问题或资产冲突中产生可审阅进化。

## 流程

1. 先修复当前任务。
2. 搜索现有 Rule、Skill、Workflow、MCP、Memory、Bad Case 和 Proposal。
3. 选择 `reuse`、`merge`、`revise`、`create` 或 `deprecate`，并解释为什么。
4. Proposal 写入 `.harness/evolution/proposals/`，包含事件证据、目标、逐项 Diff、风险、验证、回滚和受影响引用。
5. 等待用户批准。不得自动批准、自动应用或自动删除。
6. 应用用户资产 Proposal 后运行 Doctor；淘汰只把状态改为 `deprecated` 并记录 `superseded_by`。
7. 用户明确要求优化 Harness 时，当前批准范围可应用到治理层并记录结果；CLI 与 Marker 的改进仍在源码项目完成并通过正式 Release 分发。
