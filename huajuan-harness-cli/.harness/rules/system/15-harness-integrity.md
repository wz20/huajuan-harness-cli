# Harness Integrity：运行保护与可控定制

- `.harness/.huajuan.json` 的 `managedFiles` 是 Release 基线，`runtimeFiles` 是必须保持可执行完整性的运行内核。
- CLI 与 Marker 不得由普通工作区任务修改；需要开发 CLI 时应在 Huajuan Harness CLI 源项目中完成并重新发布。
- 用户明确要求优化 Harness 时，允许修改治理文档、系统 Rules、系统 Skills、系统 Workflows、Agent 适配和模板。
- 修改前必须列出范围、引用影响、风险、验证与回滚；确认后最小实施，并在 Evolution 中保留记录。
- 用户级 Rule、Skill、Workflow、MCP、Memory 和 Proposal 只能写入各自的用户目录。
- 不通过复制、重命名或影子文件绕过系统/用户分层；用户资产不得冒充 `scope: system`。
- Dashboard 是 CLI 生成的派生文件。需要刷新时运行 CLI，不直接手改生成结果。
- 运行文件缺失或哈希变化属于错误，应停止高风险工作并从可信 Release 恢复。
- 治理文件偏离 Release 基线属于定制提示，不自动视为损坏；必须核对是否存在用户授权与 Evolution 记录。
