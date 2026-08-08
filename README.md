# Huajuan Harness CLI

<p align="center">
  <img src="huajuan-harness-cli/.harness/assets/huajuan-reference.png" width="150" alt="花卷 Huajuan Harness">
</p>

<p align="center">
  把任意本地目录变成一个由 Agent 持续维护、自动进化且可审阅淘汰的知识工作区。
</p>

<p align="center">
  <a href="https://github.com/wz20/huajuan-harness-cli/releases/latest">下载最新版</a> ·
  <a href="docs/PRODUCT-REQUIREMENTS.md">产品设计</a> ·
  <a href="docs/TECHNICAL-DESIGN.md">技术设计</a>
</p>

## 它解决什么问题

普通文件夹交给 Agent 后，常见结果是目录越建越乱、同类内容重复、来源丢失、对话经验没有沉淀，过期内容也没人处理。

Huajuan Harness CLI 不替用户预设知识库结构。它提供一套强制治理脚手架，让 Agent 必须先理解工作区、与用户确认规则，再开始干活：

- 明确知识库主题和边界；
- 明确目录结构与文件职责；
- 明确分类、标签和命名标准；
- 明确 Markdown、素材 Sidecar 与 Obsidian 格式；
- 明确来源、引用和知识关系；
- 明确更新、复审、淘汰与记忆规则。

规则没有明确前，工作区保持 `BLOCKED`；六份知识契约、质量检查和 Doctor 全部通过后，才会进入 `READY`。

## Huajuan 的特色

### 下载即用，不选路径

把完整 `Huajuan-Harness` 文件夹放进知识库，启动器自动作用于它的一级父目录。无需安装全局 CLI，也不要求用户输入文件路径。

### 不是固定模板，而是元规则

Huajuan 不硬编码“AI 素材应该有哪些目录”。Agent 会扫描真实内容，提出结构、分类和格式方案，与用户确认后沉淀为当前知识库自己的规则。

### 多 Agent 共用一套 Harness

内置 Claude Code、Codex、Cursor、Trae、WorkBuddy 和通用 Agent 适配。工作区规则、Skills、Workflows、MCP 声明、Memory、Bad Case 与 Evolution Proposal 全部保存在 `.harness`，不污染全局配置。

### 真正面向知识库质量

- Markdown 使用 YAML Frontmatter；
- 内部关系使用 Obsidian WikiLink；
- 图片、视频、音频等非 Markdown 文件使用同名 `.huajuan.md` Sidecar；
- 每次写入先分类、查重，再决定新建、合并或更新；
- 来源目录、正式知识目录和素材目录都受格式约束；
- 索引、失效链接、未知标签和缺失 Sidecar 可确定性检查。

### 自动进化，但不失控

每次任务和定时采集结束后，Agent 都要判断：无需沉淀、新增、合并、更新、复审、淘汰候选，或升级为 Rule / Skill / Workflow。

Proposal 永不自动应用，资产永不自动删除；高风险文件操作、保护路径写入和 MCP 权限扩大都必须先确认。

### 花卷看板

离线 Dashboard 提供概览、知识库门禁、知识关系、Harness 资产、进化中心和 Doctor 六个视图。它可以查看状态、筛选数据、复制 Agent 指令与 CLI 命令、导出快照，但不会执行 Shell 或修改工作区。

## 快速开始

### 1. 下载

[直接下载最新版 ZIP](https://github.com/wz20/huajuan-harness-cli/releases/latest/download/Huajuan-Harness-latest.zip)

需要 Node.js 20 或更高版本。

### 2. 放入工作区

解压后，把完整 `Huajuan-Harness` 文件夹放进知识库根目录，不要只复制其中某个启动脚本。

```text
我的知识库/                       ← Huajuan 实际管理的工作区
├── 技术学习/
├── 素材/
├── 项目/
└── Huajuan-Harness/             ← 下载并解压得到的完整文件夹
    ├── 花卷初始化器-macOS.command
    ├── 花卷初始化器-Windows.cmd
    └── 花卷初始化器-Linux.sh
```

第一次启动后，Harness 会安装到工作区根目录：

```text
我的知识库/
├── .harness/                    ← 工作区治理内核
└── Huajuan-Harness/             ← 便携安装包，不会被计入知识扫描
```

### 3. 运行启动器

- macOS：双击 `花卷初始化器-macOS.command`，也可以双击应用版本；
- Windows：双击 `花卷初始化器-Windows.cmd`；
- Linux：运行 `花卷初始化器-Linux.sh`。

启动器只允许输入用户称呼、工作区名称和可选备注。核心用途、主要 Agent、保护路径和自动进化全部通过方向键与 Space 选择。

### 4. 把最终指令交给 Agent

向导完成后会输出一段可直接复制的初始化指令。把它发给所选 Agent，Agent 将按以下过程继续：

```text
只读扫描
  → 确认主题与边界
  → 确认六份知识契约
  → 提交 Dry Run
  → 迁移或补齐现有内容
  → Knowledge Lint
  → Doctor
  → 用户最终确认
  → READY
```

`AGENT_INIT.md` 是多轮初始化协议。Agent 不应该在第一次回复中直接生成一堆目录并宣布完成。

## 六份知识契约

| 文件 | 必须明确的内容 |
|---|---|
| `KNOWLEDGE_PROFILE.md` | 主题、使命、边界、知识对象和成功标准 |
| `STRUCTURE.md` | 目录角色、默认写入位置、索引与归档规则 |
| `TAXONOMY.md` | 主分类、受控标签、别名与分类顺序 |
| `CONTENT_SCHEMA.md` | 文档类型、Frontmatter、正文格式和 Sidecar |
| `REFERENCE_RULES.md` | 来源、WikiLink、关系证据、冲突与不确定项 |
| `LIFECYCLE.md` | 准入、更新、合并、复审、淘汰、对话和定时入库 |

## 常用命令

在知识库根目录运行：

```bash
node .harness/.huajuan.mjs                 # 打开选项式主菜单
node .harness/.huajuan.mjs status          # 查看工作区状态
node .harness/.huajuan.mjs knowledge status
node .harness/.huajuan.mjs knowledge scan  # 刷新文件清单与指纹
node .harness/.huajuan.mjs knowledge lint  # 检查知识质量
node .harness/.huajuan.mjs finalize        # 通过全部门禁后进入 READY
node .harness/.huajuan.mjs doctor
node .harness/.huajuan.mjs dashboard --open
node .harness/.huajuan.mjs prompt          # 再次输出 Agent 指令
node .harness/.huajuan.mjs uninstall       # 选项式导出与安全卸载
```

## 安全边界

- `.huajuan.mjs` 与 `.huajuan.json` 是运行内核，普通工作任务不能修改；
- 用户明确要求优化 Harness 时，允许按范围、风险、验证和回滚受控修改治理层；
- 保护路径默认只读；
- Harness 不保存 MCP 密钥，也不修改 Agent 全局配置；
- 自动进化只能产生候选、Bad Case 和 Proposal；
- 淘汰使用 `deprecated + superseded_by` 保留历史，不等于删除；
- 文件系统中的 Markdown 和素材始终是唯一真实数据源。

## 仓库结构

```text
huajuan-harness-cli/       # 发布包源模板
scripts/                   # Hash 同步、Release 构建与解压验收
tests/                     # CLI、Doctor、Dashboard、E2E 与 Release 测试
docs/                      # 产品、技术、决策与发布说明
```

## 开发与发布

```bash
npm test
npm run sync:hashes
npm run build:release
npm run verify:release
```

Release 校验会真实解压 ZIP，在一个含已有文件的中文工作区中运行父目录启动器，并验证 WorkBuddy、Doctor、首次 `BLOCKED` 和提前入库拒绝。

更多信息：

- [产品需求](docs/PRODUCT-REQUIREMENTS.md)
- [技术设计](docs/TECHNICAL-DESIGN.md)
- [开发与验收](docs/DEVELOPMENT.md)
- [产品决策与非目标](docs/DECISIONS.md)
- [参考项目](docs/REFERENCES.md)
- [v0.6.0 发布验收](docs/releases/v0.6.0.md)
