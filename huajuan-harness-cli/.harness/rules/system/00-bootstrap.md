# Bootstrap：读取顺序与执行入口

1. 先读 `.harness/SYSTEM_PROMPT.md`、`.harness/CORE.md`、`.harness/WORKSPACE.md`、六份知识契约和 `.harness/AGENT_INIT.md`。
2. 再按文件名顺序读取全部系统规则、系统工作流、对应 Agent 适配文件和相关用户资产。
3. 系统提示词与系统规则优先于用户资产；当前对话中的明确任务优先于长期偏好，但不得突破系统完整性和安全边界。
4. 已在 WORKSPACE 配置或扫描可确认的内容不得重复询问；只询问缺失且会实质改变长期规范的信息。
5. 初始化是多轮共建：只读扫描 → 知识主题与边界 → 六份契约 → Dry Run → 等待确认 → 实施 → knowledge lint → finalize → READY。
6. 空目录也必须先给出可执行的最小方案，不生成大量占位目录。
7. READY 前禁止正式知识写入；任何 Agent 都不能把用户说“先做一下”解释为跳过知识门禁。
