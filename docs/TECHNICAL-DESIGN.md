# 技术设计

版本：Runtime v0.6.0 / Workspace Schema v4

## 1. 架构

Runtime 无第三方依赖，使用 Node.js 20+ ESM 与文件系统：

```text
启动器
  → 便携包中的 .harness/.huajuan.mjs install-parent
  → 原子安装或复用一级父目录中的 .harness
  → 读取 Marker 与 WORKSPACE
  → 确定性扫描 / 原子更新 / Doctor
  → 生成 AGENT_INIT 与离线 Dashboard
  → 用户把初始化指令交给任意 Agent
```

CLI 不承担语义推理；系统提示词、Rules、Skills 与 Workflows 约束 Agent 的推理和写入范围。

## 2. Release 目录契约

```text
Huajuan-Harness/
├── .harness/
│   ├── .huajuan.json
│   ├── .huajuan.mjs
│   ├── CORE.md
│   ├── SYSTEM_PROMPT.md
│   ├── WORKSPACE.md
│   ├── AGENT_INIT.md
│   ├── KNOWLEDGE_PROFILE.md
│   ├── STRUCTURE.md
│   ├── TAXONOMY.md
│   ├── CONTENT_SCHEMA.md
│   ├── REFERENCE_RULES.md
│   ├── LIFECYCLE.md
│   ├── dashboard.html
│   ├── state/{inventory.json,quality-report.json}
│   ├── assets/huajuan-reference.png
│   ├── agents/{claude-code,codex,cursor,trae,workbuddy,generic}.md
│   ├── rules/{system,user}/
│   ├── skills/{system,user}/
│   ├── workflows/{system,user}/
│   ├── mcp/{README.md,servers,profiles}/
│   ├── templates/
│   ├── memory/{preferences,decisions,lessons,bad-cases}/
│   └── evolution/{proposals,applied,rejected}/
├── 花卷初始化器.app
├── 花卷初始化器-macOS.command
├── 花卷初始化器-Windows.cmd
├── 花卷初始化器-Linux.sh
└── 打开花卷控制台.html
```

Marker 使用 `managedFiles` 声明系统管理面，并为除动态 Dashboard 外的固定文件保存 SHA-256。修改 Release 管理文件后由开发命令重新同步 Hash。

## 3. 工作区识别

可见入口不接收工作区路径。便携启动器固定按以下关系识别：

1. CLI 所在 `.harness` 的父目录是 `Huajuan-Harness` 便携包；
2. 便携包的一级父目录是目标工作区；
3. 首次运行原子复制 `.harness`，已安装时验证并复用，冲突时拒绝覆盖；
4. 安装后的 CLI 仍以自身 `.harness` 的父目录作为工作区；显式参数只保留给自动化兼容。

找到 `.harness/.huajuan.json` 后解析 Product 与 Schema，并验证 `.harness` 是工作区直接子目录且非越界链接。

扫描工作区时，任何包含有效 `.harness/.huajuan.json` 的嵌套便携包都会整体排除，避免把安装器错误展示为用户内容。

## 4. 配置 Schema v4

```json
{
  "schema": "huajuan-workspace/v4",
  "status": "awaiting-agent",
  "mode": "knowledge-base",
  "owner": { "name": "Ze" },
  "workspace": { "name": "Ze 的知识库", "path": "/absolute/path", "notes": "", "emptyAtInit": false },
  "agents": ["claude-code", "codex"],
  "safety": {
    "protectedPaths": ["Private"],
    "protectedPathPolicy": "read-only",
    "coreIntegrity": "guarded",
    "harnessCustomization": "explicit-user-request",
    "highRiskOperations": "confirm"
  },
  "knowledge": {
    "contract": "huajuan-knowledge-contract/v1",
    "readiness": "blocked",
    "relationPolicy": "explicit-only",
    "preserveSources": true,
    "unknownPlacement": "agent-propose",
    "noBulkProjectCopy": true
  },
  "evolution": {
    "enabled": true,
    "autoCapture": true,
    "badCaseCapture": "candidate-auto",
    "proposalGeneration": true,
    "autoApply": false,
    "retirement": "proposal-only",
    "deletion": "never-auto"
  }
}
```

`applyAnswers` 只接受批准字段，并重新写入所有安全不变量。v2 / v3 读取时迁移为 v4；迁移也不能开启自动应用，旧的 `initialized` 状态迁移为 `awaiting-agent`，必须重新通过知识门禁。

## 5. CLI 模块

- Workspace：边界识别、Marker 校验、配置读取和 v2/v3→v4 迁移。
- Terminal UI：单选、多选、返回、取消、文字阶段、最终摘要。
- Init：扫描现状、应用回答、原子更新 Workspace 与 Agent Init、刷新 Dashboard。
- Knowledge：六份契约解析、READY 检查、确定性 Inventory 与 Quality Report。
- Finalize：验证六份契约、知识 Lint 与 Doctor，通过后原子更新为 READY 并刷新 Dashboard。
- Ingest：边界检查、Markdown 显式关系、非 Markdown Sidecar、来源保留。
- Assets：系统/用户清单、Frontmatter、重复 ID、引用和生命周期。
- MCP：Server JSON、秘密模式、数据边界、审批门禁。
- Doctor：七类只读检查与 JSON 报告。
- Dashboard：嵌入数据构建、离线 HTML、浏览器交互。
- Export / Uninstall：用户沉淀导出、Hash 校验、路径复核、定点删除。

所有受管文本通过同目录临时文件写入、`fsync`、原子重命名；失败时不留下半写状态。

## 6. 终端交互

纯函数 `buildWizardModel` 定义六阶段，`collectWizardAnswers` 处理返回和最终确认，`FocusedTerminalUI` 只负责按键与渲染。

- 单选：↑↓ / J K、Enter、←、Esc；
- 多选：↑↓、Space、Enter、←、Esc；
- 文字：仅称呼、工作区名称、备注；
- 自动化：`--answers` JSON；
- 主菜单、入库目标和卸载流程同样使用选项。

## 7. Agent 治理加载顺序

Agent 初始化固定读取并进行多轮确认：

1. `AGENT_INIT.md`
2. `CORE.md`
3. `SYSTEM_PROMPT.md`
4. `WORKSPACE.md`
5. `KNOWLEDGE_PROFILE.md`
6. `STRUCTURE.md`
7. `TAXONOMY.md`
8. `CONTENT_SCHEMA.md`
9. `REFERENCE_RULES.md`
10. `LIFECYCLE.md`
11. `rules/system/`（按数字顺序）
12. `workflows/system/task-lifecycle.md`
13. 与任务相关的系统 Skill
14. 所选 Agent 适配
15. 与任务相关的用户资产

系统提示词规定目录边界、运行内核保护、治理层受控优化、知识契约、规划门禁、关系证据、MCP 安全、记忆判断、Proposal 与完成验证。初始化状态机为“观测 → 对话确认 → 六份契约 → Dry Run → 实施迁移 → Lint → READY”；空工作区也必须先提出最小结构方案，不能擅自创建复杂目录。

六份契约分别使用固定 JSON Schema 标识和 `status: confirmed`。CLI 校验其存在性、字段完整性和交叉引用；Agent 负责依据用户主题决定具体结构、分类、标签、文档类型、引用与复审标准。

## 8. 资产与生命周期

用户 Rule / Skill / Workflow / Memory 状态限定为 `candidate | active | deprecated`。`deprecated` 必须记录替代资产；文件保留。

Proposal 状态与目录一致：

- `proposals/`：`proposed | awaiting-approval | approved`
- `applied/`：`applied`
- `rejected/`：`rejected`

所有资产 ID 在工作区内唯一。创建前搜索复用，引用必须指向真实存在且未越界的文件。

## 9. MCP 声明

`mcp/servers/*.json` 使用 `huajuan-mcp-server/v1`，包含 ID、用途、Transport、能力、读写边界、外部目标、`secrets: external-only` 与 `requiresApproval: true`。

Harness 只保存声明，不运行 Server、不安装依赖、不保存凭据。Doctor 递归检查敏感字段与常见 Token 形态，但错误消息不回显秘密值。

## 10. Ingest 与关系

Markdown 的关系区块由固定 Marker 管理，支持 `references`、`related-to`、`derived-from`、`belongs-to`、`uses`、`depends-on`。状态为 `resolved`、`unresolved`、`external`、`suggested`，证据必须属于受支持集合。

WikiLink、Markdown Link、Frontmatter 和用户确认可构成正式证据。语义相似只能是 `suggested`。非 Markdown 文件生成同目录 `.huajuan.md` Sidecar，原文件保持不变。

`knowledge scan` 生成 `.harness/state/inventory.json`，记录路径、类型、大小、修改时间与 SHA-256，并排除 Harness、便携安装包、保护路径和开发目录。`knowledge lint` 生成 `quality-report.json`，检查契约、索引、Frontmatter、文档类型、分类、标签、WikiLink 与 Sidecar。未 READY 时 `ingest` 必须拒绝。

## 11. Dashboard

`buildDashboardData` 从当前配置、知识门禁、Inventory、Quality Report、资产、MCP、关系、Doctor 和最近文件生成 JSON。`renderDashboardHtml` 将 JSON 安全转义后嵌入单个离线页面。

浏览器端只进行数组筛选、DOM 渲染、剪贴板复制与 Blob 下载；不发起网络请求、不执行本地命令、不写文件、不保存浏览器状态。命令统一为当前目录相对形式。

## 12. 卸载安全

导出只遍历普通文件，跳过符号链接，为每个文件计算并复核 SHA-256，并写 `EXPORT-MANIFEST.json`。导出目录不得位于 `.harness` 内且必须为新目录。

删除前再次解析并 Realpath 校验 Harness；唯一删除目标是当前工作区的 `.harness`。交互确认不接受任意路径或自由文字。

## 13. 发布

Release Builder 使用显式 Allowlist 复制六个产品入口，先同步系统 Hash、生成 Dashboard，再创建 ZIP。Verify 检查目录、可执行位、Marker、Hash、Doctor、知识门禁、WorkBuddy 交接、父目录安装与禁止项。

Release 不能包含 `tests/`、`docs/`、`scripts/`、`package.json`、`node_modules`、`.DS_Store` 或开发缓存。
