# Asset Lifecycle

用户 Rule、Skill、Workflow、MCP 与 Memory 使用统一状态：

```text
candidate → active → deprecated
```

- `candidate`：来自真实需求，尚未充分验证。
- `active`：已经用户确认并通过至少一次真实任务验证。
- `deprecated`：已批准淘汰，必须写明理由和 `superseded_by`；文件保留用于追溯。

创建前查重，修改前记录证据，状态变化前生成 Proposal。治理层只有在用户明确要求优化 Harness 时才进入受控修订生命周期；CLI 与 Marker 仍通过源码项目和正式 Release 更新。任何资产都不得自动删除。
