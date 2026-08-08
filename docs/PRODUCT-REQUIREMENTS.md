# 产品需求

版本：v0.6.1

状态：已批准并实施

产品定位：通用、可复制到任意知识库或工作区的一键 Agent Harness

## 1. 产品目标

用户把 Huajuan Release 放入自己的目录并启动后，应立即获得一套跨 Agent 的长期治理能力：

- Agent 理解当前目录的用途、边界、保护范围与用户要求；
- 工作区级 Rule、Skill、Workflow 与 MCP 有固定归属，不污染全局配置；
- 知识入库保留来源，只把显式证据或用户确认写成正式关系；
- 稳定偏好、决策、经验和 Bad Case 按固定工作流沉淀；
- 重复、冲突或过期资产通过可审阅 Proposal 进化或淘汰；
- 用户可在离线 Dashboard 中看清状态并复制下一步指令。

文件系统是唯一真实数据源。CLI 负责确定性扫描、生成和校验；Agent 负责语义判断，但必须受系统协议约束。

## 2. 核心原则

1. **零路径配置**：完整 `Huajuan-Harness` 便携包的一级父目录就是工作区；用户不选择、不输入路径。
2. **少输入、多选择**：初始化只有称呼、工作区名称、补充要求接受文字，其余均为清晰选项。
3. **多轮初始化**：Agent 先读系统协议、只读观测、与用户确认目录规范、提交方案，再实施与沉淀；不得一轮宣布完成。
4. **运行与治理分层**：CLI 与 Marker 默认保护；治理脚手架在用户明确要求优化 Harness 时可受控演进；用户资产进入对应 `user/` 或沉淀目录。
5. **安全默认强制**：保护路径只读，高风险操作先确认，危险配置不能被回答文件绕过。
6. **进化可审阅**：可自动发现候选，但不能自动应用 Proposal 或自动删除资产。
7. **不向用户转嫁语义判断**：目录含义、记忆价值和沉淀触发由 Agent 扫描及固定工作流判断。
8. **无契约不工作**：主题、结构、分类、格式、引用和生命周期未明确前，工作区保持 `BLOCKED`，不得正式入库。

## 3. 初始化体验

终端采用 Claude Code 式聚焦界面：深炭黑背景、暖桃色强调、每屏一个问题，并持续显示“为什么要问”。

用户将完整 `Huajuan-Harness` 文件夹放入工作区后运行启动器。CLI 先验证安装包，再把 `.harness` 原子安装到一级父目录；父目录已有有效 Huajuan Harness 时直接复用，已有其他 `.harness` 时停止并保护原内容。嵌套安装包不进入用户路径选项、文件统计或知识扫描。

| 步骤 | 交互 | 作用 |
|---|---|---|
| 1. 身份 | 输入称呼、工作区名称 | 用于 Agent 回复、Workspace 与 Dashboard 标识 |
| 2. 核心用途 | 单选知识库、工作区、混合用途 | 决定初始化任务、关系规则和看板重点 |
| 3. 主要 Agent | 多选 Claude Code、Codex、Cursor、Trae、WorkBuddy、通用 Agent | 生成工作区适配说明，不修改 Agent 全局配置 |
| 4. 保护路径 | 从现有顶层路径多选 | 选中项默认只读；启动器与 Marker 自动保护 |
| 5. 自动进化 | 单选开启或关闭 | 控制候选 Memory、Bad Case 和 Proposal 的生成 |
| 6. 补充要求 | 可选文字备注 | 原样进入 Agent 初始化任务 |

空目录时第 4 步正常显示“没有可选用户路径”，不失败。最终摘要提供“开始初始化、返回修改备注、取消”三个选项，不要求输入 Y/N。

完成后必须输出一段可直接复制给 Agent 的指令，要求阅读 `AGENT_INIT.md`、`CORE.md`、`SYSTEM_PROMPT.md`、`WORKSPACE.md`、六份知识契约与系统规则。所选 WorkBuddy 时必须明确加载其适配。Agent 先观测并与用户确认，最后才把知识库规范沉淀进 Harness；不得自动应用 Proposal。

`AGENT_INIT.md` 是多轮初始化协议，不是一次性生成任务。首次观测必须区分事实与不确定项；Agent 必须提出可读的 Dry Run，让用户确认后再迁移或补齐现有文件。只有六份契约确认、方案实施、知识质量检查、Doctor 验证与最终确认全部完成后，才能进入 `READY`。

Agent 必须根据主题与现状，在用户确认后维护六份契约：`KNOWLEDGE_PROFILE.md`、`STRUCTURE.md`、`TAXONOMY.md`、`CONTENT_SCHEMA.md`、`REFERENCE_RULES.md`、`LIFECYCLE.md`。CLI 只规定每项必须明确，不预设具体目录或分类。随后由已获得明确确认的 Agent 调用 `finalize`；CLI 验证全部契约、知识质量与 Doctor 后更新状态并刷新 Dashboard。

## 4. 核心用途

- **个人知识库**：维护来源、显式关系、未解析关系、Sidecar 与长期知识质量。
- **现有工作区**：优先保留结构，治理工作区级 Rules、Skills、Workflows、MCP 与纠错沉淀。
- **项目与长期知识**：区分项目材料与长期知识，只沉淀经确认的决策、经验和可复用方法，禁止批量复制整个项目。

## 5. 固定 Harness 能力

`.harness` 必须包含：

- `CORE.md`、`SYSTEM_PROMPT.md`、有序系统规则；
- Claude Code、Codex、Cursor、Trae、WorkBuddy、通用 Agent 适配；
- 系统 Skills：Workspace Bootstrap、Knowledge Bootstrap、Knowledge Ingest、Knowledge Quality、Knowledge Retirement、Memory Distillation、Evolution Governance；
- 系统 Workflows：Task Lifecycle、Knowledge Write、Knowledge Review、Memory Cycle、Asset Lifecycle；
- 用户 Rules、Skills、Workflows 的固定目录与模板；
- MCP Server 声明、Agent Profile 目录与无密钥模板；
- Preferences、Decisions、Lessons、Bad Cases；
- Proposals、Applied、Rejected 生命周期目录；
- Huajuan 原始 IP 素材与离线 Dashboard。

知识库内容必须适配 Obsidian：Markdown 使用 YAML Frontmatter 与 WikiLink；非 Markdown 素材使用同名 `.huajuan.md` Sidecar；来源目录、正式知识目录与素材目录均受已确认格式约束。每次写入前必须先搜索、分类并判断新建或合并，同时维护必要索引。对话与定时采集必须执行沉淀判断和生命周期复审。

## 6. 系统提示词与权限

CLI 与 Marker 是运行内核，普通工作任务不得修改；其 Hash 不一致时 Doctor 必须报错并优先要求使用正式 Release 恢复。Core、System Prompt、系统规则、系统 Skills、系统 Workflows、Agent 适配、MCP 安全协议和模板是治理脚手架：未收到用户明确的 Harness 优化要求时不得修改；收到明确要求后，必须先列出范围、理由、风险、验证和回滚，经确认后才可修改并记录演进。Huajuan 原始 IP 素材不得被工作区任务覆盖。

用户资产只能写入：

- `.harness/rules/user/`
- `.harness/skills/user/`
- `.harness/workflows/user/`
- `.harness/mcp/servers/` 与 `.harness/mcp/profiles/`
- `.harness/memory/`
- `.harness/evolution/`

不得在工作区外安装 Skill 或 MCP，不得改 Agent 全局配置，不得把秘密写入 Harness。

## 7. 自动记忆、进化与淘汰

固定工作流：真实事件或纠正 → 修复当前任务 → 判断是否稳定且可复用 → 搜索既有资产 → 复用、合并或生成候选 → 生成含证据、Diff、风险、验证、回滚的 Proposal → 用户批准 → 应用 → Doctor 与 Dashboard。

淘汰资产只允许：

- 生成 `merge`、`revise` 或 `deprecate` Proposal；
- 用户批准后把状态改为 `deprecated`；
- 记录 `superseded_by` 和原因；
- 保留历史，不自动删除。

## 8. Dashboard

Dashboard 是生成式离线快照，包含六个视图：概览、知识库门禁、知识关系、Harness 资产、进化中心、Doctor。

必须支持：

- 关系、资产、Proposal 与 Doctor 问题的搜索和筛选；
- 选中行后的来源、证据、状态、路径和生命周期详情；
- 系统资产与用户资产分层统计；
- MCP、Memory、Bad Case、Proposal 和最近活动浏览；
- 初始化、关系确认、Proposal 审阅、Doctor 修复指令复制；
- 六份知识契约状态、READY 门禁、Frontmatter / Sidecar 覆盖率、失效链接和知识体检指令；
- 相对路径 CLI 命令抽屉；
- 当前嵌入数据的 JSON 快照导出；
- 桌面和窄屏响应式、键盘焦点及 reduced-motion。

Dashboard 不联网、不执行 Shell、不写工作区、不使用浏览器持久存储。

## 9. Doctor

Doctor 按七类报告：

1. `core`：固定文件缺失、Marker 越界、运行内核被修改，以及治理脚手架与发布基线的差异提示；
2. `config`：Schema、内核权限、高风险门禁、自动应用/删除等配置违规；
3. `assets`：资产错位、旧平铺目录、格式和重复 ID；
4. `mcp`：JSON、重复 ID、明文秘密、越界数据边界和绕过确认；
5. `relations`：受管区块、失效目标、越界链接和语义建议误升级；
6. `lifecycle`：无效状态、Proposal 目录不一致、淘汰缺少替代项。
7. `knowledge`：READY 工作区的六份契约缺失、损坏或重新变为待确认。

Doctor 默认只读。运行内核损坏优先从正式 Release 恢复；治理脚手架差异作为已定制信息展示，不阻断用户明确要求的 Harness 优化。

## 10. 卸载

安全卸载全程使用选项。推荐先选择用户沉淀范围，CLI 自动导出到工作区同级新目录并逐文件校验 SHA-256；随后再次确认，仅删除当前 `.harness`。用户知识内容与启动器不被删除，系统资产不混入用户导出包。

## 11. 验收标准

- 六步向导与主菜单无编号输入、无路径输入，选项都有作用说明；
- 空目录、中文和空格路径正常；
- 固定目录、系统提示词、系统/用户资产分层与六类 Agent 适配完整；
- 六份知识契约未确认时正式入库被拒绝，确认并通过 Lint 后才能进入 READY；
- Markdown Frontmatter、受控分类/标签、索引、WikiLink 与非 Markdown Sidecar 可确定性检查；
- 自动进化开关有效，`autoApply=false`、`deletion=never-auto` 无法绕过；
- Finalize、Ingest、Doctor、Dashboard、Prompt、Status、Uninstall 全链路通过；
- Dashboard 的筛选、详情、复制、抽屉、导出和响应式在真实浏览器通过；
- Release ZIP 只包含运行时产品树，不含开发文件。
