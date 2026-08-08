# 开发与验收

版本：v0.6.1

## 已实现范围

- 六步 Claude Code 风格初始化向导；
- 便携包一级父目录识别、原子安装与 macOS / Windows / Linux 无路径启动器；
- Workspace Schema v4、知识 READY 状态与危险字段强制覆写；
- 固定 System Prompt、系统 Rules、七个系统 Skills、五个系统 Workflows；
- Claude Code、Codex、Cursor、Trae、WorkBuddy 和通用 Agent 适配；
- 用户 Rules / Skills / Workflows、MCP、Memory、Bad Cases、Evolution 固定目录与模板；
- 显式关系入库、Sidecar 与边界检查；
- 六份知识契约、Inventory、Knowledge Lint 与正式入库门禁；
- 七类 Doctor 与系统文件 SHA-256 完整性；
- 六视图离线 Dashboard；
- 选项式安全导出与卸载；
- Release 构建与内容验证。

## 开发验证

Runtime 只要求 Node.js 20+。构建 Release 还需要 Python 3，用于生成带 UTF-8 文件名标记的 ZIP。

```text
npm test
npm run sync:hashes
node --check huajuan-harness-cli/.harness/.huajuan.mjs
node huajuan-harness-cli/.harness/.huajuan.mjs doctor --workspace huajuan-harness-cli
npm run build:release
npm run verify:release
```

浏览器验收（本地静态服务启动后）还运行：

```text
HUAJUAN_DASHBOARD_URL=<本地 dashboard 地址> \
CODEX_NODE_MODULES=<包含 playwright 的 node_modules> \
HUAJUAN_CHROME_EXECUTABLE=<Chrome 可执行文件> \
node --test tests/dashboard/browser.test.mjs
```

## 需求验收矩阵

| 范围 | 通过条件 |
|---|---|
| 输入控制 | 只有称呼、工作区名称、备注为文字；其他初始化、菜单、入库、卸载均为选项 |
| 路径 | 完整便携包放入工作区后自动作用于一级父目录；不弹选择器、不询问路径；中文与空格目录通过 |
| 空工作区 | 初始化成功，保护路径步骤不失败，Agent Init 要求最小结构方案 |
| Agent | 六个适配文件存在，选择结果写入配置与 Agent Init |
| 知识契约 | 主题、结构、分类、格式、引用、生命周期均须由 Agent 提案并经用户确认 |
| READY | 六份契约、内容迁移、Knowledge Lint 和 Doctor 全通过前拒绝正式入库 |
| 内核 | System Prompt、系统资产与 Hash 完整，Doctor 能发现删除和篡改 |
| 用户资产 | Rules、Skills、Workflows、MCP、Memory、Bad Cases、Proposals 分层正确 |
| 安全 | 保护路径只读，高风险先确认，自动应用与自动删除永久关闭 |
| 进化 | 开关生效，淘汰必须 Proposal + deprecated + successor |
| Ingest | READY 后才可入库；来源保留，关系只来自显式证据，非 Markdown 使用 Sidecar |
| Obsidian | 正式 Markdown 有 Frontmatter 和 WikiLink，来源/素材目录受 Schema 管理，索引存在 |
| Dashboard | 六视图、知识门禁与质量指标、搜索筛选、详情、指令复制、命令抽屉、JSON 导出均可用 |
| 浏览器 | 1600px 与 390px 通过，无控制台错误、无页面横向溢出 |
| 卸载 | 用户沉淀可导出并 Hash 校验，只删除 `.harness` |
| Release | ZIP 仅含产品运行树，父目录安装、WorkBuddy、BLOCKED 门禁和正式入库拒绝均通过 |

## 发布前门禁

1. 修改固定系统文件后运行 `npm run sync:hashes`。
2. 重新生成模板 Dashboard。
3. 全量测试必须零失败；可选浏览器测试在发布验收中不得跳过。
4. Doctor 必须零错误。
5. Release Verify 必须确认禁止项为零。
6. 对概念图、桌面截图和移动截图完成视觉差异记录。

逐项验收结果见 `docs/releases/v0.6.1.md`。
